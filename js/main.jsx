const { useState, useEffect, useRef } = React;

function HotwireWing3D() {
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

  const [span, setSpan] = useState(500);
  const [profilePointsCount, setProfilePointsCount] = useState(300);
  const [holes, setHoles] = useState([{ diameter: 5, xPercent: 0.5, yPercent: 0.5, nPoints: 30 }]);
  const [ailerons, setAilerons] = useState([{ thicknessTop: 2, xPercent: 0.7, frontAngleDeg: 15, rearAngleDeg: 15 }]);
  const [trimEnabled, setTrimEnabled] = useState(false);
  const [trimLEmm, setTrimLEmm] = useState(0);
  const [trimTEmm, setTrimTEmm] = useState(0);

  const [activeTab, setActiveTab] = useState(null);
  const [debugOpen, setDebugOpen] = useState(false);
  const [debugPoints, setDebugPoints] = useState({ inner: [], outer: [] });

  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraPosRef = useRef({ x: 0, y: 0, z: 0 });
  const cameraTargetRef = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    fetch('airfoil/clarky.dat')
      .then(res => res.text())
      .then(text => {
        setInnerDAT(text);
        setOuterDAT(text);
        setInnerName("clarky.dat");
        setOuterName("clarky.dat");
      });
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const width = canvasRef.current.clientWidth;
    const height = canvasRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.set(600, -span/2, span);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    canvasRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;

    const axes = new THREE.AxesHelper(span);
    scene.add(axes);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      cameraPosRef.current = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
      cameraTargetRef.current = { x: controls.target.x, y: controls.target.y, z: controls.target.z };
      renderer.render(scene, camera);
    };
    animate();

    return () => renderer.dispose();
  }, []);

  useEffect(() => {
    if (!innerDAT || !outerDAT || !sceneRef.current) return;

    // Statt nur parseDAT:
    let innerPts = window.parseDAT(innerDAT);
    let outerPts = window.parseDAT(outerDAT);

    // Resample direkt auf z.B. 200–300 Punkte
    innerPts = window.resampleArcLength(innerPts, profilePointsCount);
    outerPts = window.resampleArcLength(outerPts, profilePointsCount);

    innerPts = window.scaleProfile(innerPts, innerScale);
    outerPts = window.scaleProfile(outerPts, outerScale);

    innerPts = innerPts.map(p => ({ ...p, y: p.y * thicknessScaleInner }));
    outerPts = outerPts.map(p => ({ ...p, y: p.y * thicknessScaleOuter }));

    outerPts = window.offsetOuterProfile(outerPts, outerVerticalOffset, outerChordOffset);

    let [innerWithScaled, outerWithScaled] = window.matchPointCount(innerPts, outerPts);

    let innerWithAilerons = innerWithScaled.slice();
    let outerWithAilerons = outerWithScaled.slice();

    ailerons.forEach(a => {
      innerWithAilerons = window.addBottomPath(innerWithAilerons, a.xPercent, a.thicknessTop, a.frontAngleDeg, a.rearAngleDeg);
      outerWithAilerons = window.addBottomPath(outerWithAilerons, a.xPercent, a.thicknessTop, a.frontAngleDeg, a.rearAngleDeg);
    });

    let innerWithHoles = innerWithAilerons.slice();
    let outerWithHoles = outerWithAilerons.slice();

    holes.forEach(h => {
      const holeInner = window.getHolePoints(h.diameter, h.xPercent, h.yPercent, innerWithHoles, h.nPoints);
      innerWithHoles = window.insertHoleWithInOut(innerWithHoles, holeInner, 3);
      const holeOuter = window.getHolePoints(h.diameter, h.xPercent, h.yPercent, outerWithHoles, h.nPoints);
      outerWithHoles = window.insertHoleWithInOut(outerWithHoles, holeOuter, 3);
    });

    let innerTrimmed = innerWithHoles;
    let outerTrimmed = outerWithHoles;
    if (trimEnabled) {
      innerTrimmed = window.trimAirfoilFront(innerTrimmed, trimLEmm);
      outerTrimmed = window.trimAirfoilFront(outerTrimmed, trimLEmm);
      innerTrimmed = window.trimAirfoilBack(innerTrimmed, trimTEmm);
      outerTrimmed = window.trimAirfoilBack(outerTrimmed, trimTEmm);
    }

    const innerFinal = innerTrimmed.map(p => window.rotatePoint(p, rotationInner));
    const outerFinal = outerTrimmed.map(p => window.rotatePoint(p, rotationOuter));

    const scene = sceneRef.current;
    if (scene.lines && scene.lines.innerLine) scene.remove(scene.lines.innerLine);
    if (scene.lines && scene.lines.outerLine) scene.remove(scene.lines.outerLine);

    const innerLine = window.createLine(innerFinal, -span / 2, parseInt(innerColor.slice(1), 16));
    const outerLine = window.createLine(outerFinal, span / 2, parseInt(outerColor.slice(1), 16));

    scene.lines = { innerLine, outerLine };
    scene.add(innerLine);
    scene.add(outerLine);

    setDebugPoints({ inner: innerFinal, outer: outerFinal });
  }, [
    innerDAT, outerDAT, 
    innerScale, outerScale, 
    span, 
    profilePointsCount,
    thicknessScaleInner, thicknessScaleOuter,
    rotationInner, rotationOuter, 
    outerVerticalOffset, 
    outerChordOffset, 
    holes, 
    ailerons,
    trimEnabled, trimLEmm, trimTEmm, 
    innerColor, outerColor
  ]);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 12, height: 'calc(100vh - 60px)', boxSizing: 'border-box' }}>
      <h2>Hotwire Wing 3D Preview</h2>
      <div style={{ display: 'flex', gap: 12, flex: 1, minHeight: 0 }}>
        <div style={{ flex: '0 0 500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 12, background: '#f7f7f7', padding: 8, border: '1px solid #ccc' }}>
            <b>Kamera:</b> {cameraPosRef.current.x.toFixed(1)}, {cameraPosRef.current.y.toFixed(1)}, {cameraPosRef.current.z.toFixed(1)}<br/>
            <b>Ziel:</b> {cameraTargetRef.current.x.toFixed(1)}, {cameraTargetRef.current.y.toFixed(1)}, {cameraTargetRef.current.z.toFixed(1)}
          </div>

          <label>Inner DAT <input type="file" accept=".dat" onChange={e => handleFile(e, setInnerDAT, setInnerName)} /> {innerName}</label>
          <label>Outer DAT <input type="file" accept=".dat" onChange={e => handleFile(e, setOuterDAT, setOuterName)} /> {outerName}</label>

          <label>Spannweite (mm)
            <input type="range" min="10" max="3000" value={span} onChange={e => setSpan(Number(e.target.value))} />
            <input type="number" value={span} onChange={e => setSpan(Number(e.target.value))} />
          </label>

          <label>
            Anzahl Punkte pro Profil
            <input type="number" value={profilePointsCount} min="10" max="1000" onChange={e => setProfilePointsCount(Number(e.target.value))} />
            <input type="range" min="10" max="1000" step="1" value={profilePointsCount} onChange={e => setProfilePointsCount(Number(e.target.value))} />
          </label>

          <ProfileBox title="Inner Profil" color={innerColor} isActive={activeTab === 'inner'} onToggle={() => setActiveTab(activeTab === 'inner' ? null : 'inner')}>
            <label>Farbe <input type="color" value={innerColor} onChange={e => setInnerColor(e.target.value)} /></label>
            
            <input type="number" value={innerScale} onChange={e => setInnerScale(Number(e.target.value))} />
            <label>Länge (mm) <input type="range" min="10" max="1000" value={innerScale} onChange={e => setInnerScale(Number(e.target.value))} /></label>
            
            <input type="number" step="0.01" min="0.5" max="1.5" value={thicknessScaleInner} onChange={e => setThicknessScaleInner(Number(e.target.value))} />
            <label>Dicke <input type="range" min="0.5" max="1.5" step="0.01" value={thicknessScaleInner} onChange={e => setThicknessScaleInner(Number(e.target.value))} /></label>
            
            <input type="number" step="1" min="-25" max="25" value={rotationInner * 180 / Math.PI} onChange={e => setRotationInner(Number(e.target.value) * Math.PI / 180)} />
            <label>Rotation (°) <input type="range" min="-25" max="25" value={rotationInner * 180 / Math.PI} onChange={e => setRotationInner(e.target.value * Math.PI / 180)} /></label>
          </ProfileBox>

          <ProfileBox title="Outer Profil" color={outerColor} isActive={activeTab === 'outer'} onToggle={() => setActiveTab(activeTab === 'outer' ? null : 'outer')}>
            <label>Farbe <input type="color" value={outerColor} onChange={e => setOuterColor(e.target.value)} /></label>
            
            <input type="number" value={outerScale} onChange={e => setOuterScale(Number(e.target.value))} />
            <label>Länge (mm) <input type="range" min="10" max="1000" value={outerScale} onChange={e => setOuterScale(Number(e.target.value))} /></label>
            
            <input type="number" step="0.01" min="0.5" max="1.5" value={thicknessScaleOuter} onChange={e => setThicknessScaleOuter(Number(e.target.value))} />
            <label>Dicke <input type="range" min="0.5" max="1.5" step="0.01" value={thicknessScaleOuter} onChange={e => setThicknessScaleOuter(Number(e.target.value))} /></label>
            
            <input type="number" step="1" min="-25" max="25" value={rotationOuter * 180 / Math.PI} onChange={e => setRotationOuter(Number(e.target.value) * Math.PI / 180)} />
            <label>Rotation (°) <input type="range" min="-25" max="25" value={rotationOuter * 180 / Math.PI} onChange={e => setRotationOuter(e.target.value * Math.PI / 180)} /></label>
            
            <input type="number" value={outerVerticalOffset} onChange={e => setOuterVerticalOffset(Number(e.target.value))} />
            <label>Vertikal (mm) <input type="range" min="-500" max="500" value={outerVerticalOffset} onChange={e => setOuterVerticalOffset(Number(e.target.value))} /></label>
            
            <input type="number" value={outerChordOffset} onChange={e => setOuterChordOffset(Number(e.target.value))} />
            <label>Chord (mm) <input type="range" min="-1000" max="1000" value={outerChordOffset} onChange={e => setOuterChordOffset(Number(e.target.value))} /></label>
          </ProfileBox>

          <HolesSection holes={holes} setHoles={setHoles} isActive={activeTab === 'holes'} onToggle={() => setActiveTab(activeTab === 'holes' ? null : 'holes')} />
          <AileronsSection ailerons={ailerons} setAilerons={setAilerons} isActive={activeTab === 'ailerons'} onToggle={() => setActiveTab(activeTab === 'ailerons' ? null : 'ailerons')} />
          <TrimSection trimEnabled={trimEnabled} setTrimEnabled={setTrimEnabled} trimLEmm={trimLEmm} setTrimLEmm={setTrimLEmm} trimTEmm={trimTEmm} setTrimTEmm={setTrimTEmm} isActive={activeTab === 'trim'} onToggle={() => setActiveTab(activeTab === 'trim' ? null : 'trim')} />
          <DebugSection debugPoints={debugPoints} innerName={innerName} outerName={outerName} isOpen={debugOpen} onToggle={() => setDebugOpen(!debugOpen)} />
        </div>
        <div ref={canvasRef} style={{ flex: 1, minHeight: 0 }}></div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<HotwireWing3D />);