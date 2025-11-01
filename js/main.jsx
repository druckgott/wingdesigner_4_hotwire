const { useState, useEffect, useRef } = React;

function HotwireWing3D() {
    // Wing States
    const [innerDAT, setInnerDAT] = useState("");
    const [innerName, setInnerName] = useState("clarky.dat");
    const [innerColor, setInnerColor] = useState("#ff0000");
    const [innerScale, setInnerScale] = useState(100);
    const [thicknessScaleInner, setThicknessScaleInner] = useState(1.0);
    const [rotationInner, setRotationInner] = useState(0);

    const [outerDAT, setOuterDAT] = useState("");
    const [outerName, setOuterName] = useState("clarky.dat");
    const [outerColor, setOuterColor] = useState("#0000ff");
    const [outerScale, setOuterScale] = useState(120);
    const [thicknessScaleOuter, setThicknessScaleOuter] = useState(1.0);
    const [rotationOuter, setRotationOuter] = useState(0);
    const [outerVerticalOffset, setOuterVerticalOffset] = useState(0);
    const [outerChordOffset, setOuterChordOffset] = useState(0);

    // General Parameters
    const [span, setSpan] = useState(500);
    const [profilePointsCount, setProfilePointsCount] = useState(300);
    const [holes, setHoles] = useState([{ diameter: 5, xPercent: 0.5, yPercent: 0.5, nPoints: 30 }]);
    const [ailerons, setAilerons] = useState([{thicknessTop: 2, xPercent: 0.7, frontAngleDeg: 15, rearAngleDeg: 15}]);

    // Trim
    const [trimEnabled, setTrimEnabled] = useState(false);
    const [trimLEmm, setTrimLEmm] = useState(0);
    const [trimTEmm, setTrimTEmm] = useState(0);

    // UI State
    const [activeTab, setActiveTab] = useState(null);
    const [debugOpen, setDebugOpen] = useState(false);
    const [debugPoints, setDebugPoints] = useState({ inner: [], outer: [] });

    // Camera State
    const [cameraPos, setCameraPos] = useState({x:0,y:0,z:0});
    const [cameraTarget, setCameraTarget] = useState({x:0,y:0,z:0});

    // Refs
    const canvasRef = useRef(null);
    const tooltipRef = useRef(null);
    const cameraPosRef = useRef({x:0,y:0,z:0});
    const cameraTargetRef = useRef({x:0,y:0,z:0});

    // Load Default DAT
    useEffect(() => {
        fetch('airfoil/clarky.dat')
            .then(res => res.text())
            .then(text => {
                setInnerDAT(text);
                setOuterDAT(text);
                setInnerName("clarky.dat");
                setOuterName("clarky.dat");
            })
            .catch(err => console.log("Default DAT konnte nicht geladen werden", err));
    }, []);

    // Update Camera Display
    useEffect(() => {
        const interval = setInterval(() => {
            setCameraPos({...cameraPosRef.current});
            setCameraTarget({...cameraTargetRef.current});
        }, 200);
        return () => clearInterval(interval);
    }, []);

    // Initialize Three.js Scene
    useEffect(() => {
        if (!canvasRef.current) return;
        
        const sceneSetup = window.initThreeScene(canvasRef, span, cameraPosRef, cameraTargetRef);
        window.setupMouseInteraction(
            canvasRef, 
            tooltipRef, 
            cameraPosRef, 
            cameraTargetRef,
            sceneSetup.scene,
            sceneSetup.camera,
            sceneSetup.controls
        );

        return () => {
            if (sceneSetup.renderer) sceneSetup.renderer.dispose();
        };
    }, [span]);

    // File Handler
    const handleFile = (e, setFunc, setName) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            setFunc(ev.target.result);
            setName(file.name);
        };
        reader.readAsText(file);
    };

    // Update 3D Lines when parameters change
    useEffect(() => {
        if (!innerDAT || !outerDAT) return;

        let innerPts = window.parseDAT(innerDAT);
        let outerPts = window.parseDAT(outerDAT);

        innerPts = window.scaleProfile(innerPts, innerScale);
        outerPts = window.scaleProfile(outerPts, outerScale);

        const innerPtsScaled = innerPts.map(p => ({...p, y: p.y * thicknessScaleInner}));
        const outerPtsScaled = outerPts.map(p => ({...p, y: p.y * thicknessScaleOuter}));

        const outerPtsOffset = window.offsetOuterProfile(outerPtsScaled, outerVerticalOffset, outerChordOffset);

        let innerWithScaled = innerPtsScaled.slice();
        let outerWithScaled = outerPtsOffset.slice();

        [innerWithScaled, outerWithScaled] = window.matchPointCount(innerWithScaled, outerWithScaled);

        let innerWithAilerons = window.smoothProfile(innerWithScaled, 2);
        let outerWithAilerons = window.smoothProfile(outerWithScaled, 2);

        ailerons.forEach(a => {
            innerWithAilerons = window.addBottomPath(innerWithAilerons, a.xPercent, a.thicknessTop, a.frontAngleDeg, a.rearAngleDeg);
            outerWithAilerons = window.addBottomPath(outerWithAilerons, a.xPercent, a.thicknessTop, a.frontAngleDeg, a.rearAngleDeg);
        });

        let innerWithHoles = innerWithAilerons.slice();
        let outerWithHoles = outerWithAilerons.slice();

        holes.forEach(h => {
            const holePtsInner = window.getHolePoints(h.diameter, h.xPercent, h.yPercent, innerWithHoles, h.nPoints);
            innerWithHoles = window.insertHoleWithInOut(innerWithHoles, holePtsInner, 3);

            const holePtsOuter = window.getHolePoints(h.diameter, h.xPercent, h.yPercent, outerWithHoles, h.nPoints);
            outerWithHoles = window.insertHoleWithInOut(outerWithHoles, holePtsOuter, 3);
        });

        if (trimEnabled) {
            innerWithHoles = window.trimAirfoilFront(innerWithHoles, trimLEmm) || innerWithHoles;
            outerWithHoles = window.trimAirfoilFront(outerWithHoles, trimLEmm) || outerWithHoles;
            innerWithHoles = window.trimAirfoilBack(innerWithHoles, trimTEmm) || innerWithHoles;
            outerWithHoles = window.trimAirfoilBack(outerWithHoles, trimTEmm) || outerWithHoles;
        }

        const innerPtsRotated = innerWithHoles.map(pt => window.rotatePoint(pt, rotationInner));
        const outerPtsRotated = outerWithHoles.map(pt => window.rotatePoint(pt, rotationOuter));

        setDebugPoints({ inner: innerPtsRotated, outer: outerPtsRotated });

        if (canvasRef.current && canvasRef.current.scene) {
            canvasRef.current.scene.lines = {
                innerLine: window.createLine(innerPtsRotated, -span / 2, parseInt(innerColor.replace("#","0x"),16)),
                outerLine: window.createLine(outerPtsRotated, span / 2, parseInt(outerColor.replace("#","0x"),16))
            };
        }
    }, [
        innerDAT, outerDAT, innerScale, outerScale, span, thicknessScaleInner, 
        thicknessScaleOuter, rotationInner, rotationOuter, outerVerticalOffset, 
        outerChordOffset, holes, profilePointsCount, ailerons, innerColor, 
        outerColor, trimEnabled, trimLEmm, trimTEmm
    ]);

    return (
        <div className="main-container">
            {/* ... dein JSX bleibt unverändert ... */}
        </div>
    );
}

// Render App mit React 18
ReactDOM.createRoot(document.getElementById('root')).render(<HotwireWing3D />);
