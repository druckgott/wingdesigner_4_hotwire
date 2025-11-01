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
  const tooltipRef = useRef(null);
  const markerRef = useRef(null);  // der Marker für den aktuell gewählten Punkt

  const [cameraPos, setCameraPos] = useState({x:0,y:0,z:0});
  const [cameraTarget, setCameraTarget] = useState({x:0,y:0,z:0});

  
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

  // --- Kamera-Position alle 200ms im State aktualisieren ---
  useEffect(() => {
    const iv = setInterval(() => {
      setCameraPos({ ...cameraPosRef.current });
      setCameraTarget({ ...cameraTargetRef.current });
    }, 200);
    return () => clearInterval(iv);
  }, []);

  // --- 3D Setup: Szene, Kamera, Renderer, OrbitControls ---
  useEffect(() => {
    if (!canvasRef.current) return;

    const width = canvasRef.current.clientWidth;
    const height = canvasRef.current.clientHeight;

    // Szene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Kamera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.set(600, -span / 2, span);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    canvasRef.current.innerHTML = ""; // leere vorherige Inhalte
    canvasRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Achsenhilfe
    const axes = new THREE.AxesHelper(span);
    scene.add(axes);

    // Marker als Sprite (z.B. für Maus-/Tag-Markierung)
    const material = new THREE.SpriteMaterial({ color: 0x000000 });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(10, 10, 1);
    sprite.visible = false;
    scene.add(sprite);
    markerRef.current = sprite;

    // Linien-Platzhalter
    scene.lines = { innerLine: null, outerLine: null };

    // Animation
    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      controls.update();

      // Kamera/Target Refs updaten
      cameraPosRef.current.x = camera.position.x;
      cameraPosRef.current.y = camera.position.y;
      cameraPosRef.current.z = camera.position.z;

      cameraTargetRef.current.x = controls.target.x;
      cameraTargetRef.current.y = controls.target.y;
      cameraTargetRef.current.z = controls.target.z;

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handling
    const handleResize = () => {
      const w = canvasRef.current.clientWidth;
      const h = canvasRef.current.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(reqId);
      controls.dispose();
      renderer.dispose();
      scene.clear();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const initCanvas = () => {
      if (!canvasRef.current) return;
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      if (width === 0 || height === 0) return;

      // Three.js Setup hier
    };

    initCanvas(); // erstmal versuchen
    window.addEventListener('resize', initCanvas);

    return () => window.removeEventListener('resize', initCanvas);
  }, []);


  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !tooltipRef.current) return;

    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const tooltip = tooltipRef.current;
    const canvas = renderer.domElement;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const lines = [];
      if (scene.lines) {
        if (scene.lines.innerLine) lines.push(scene.lines.innerLine);
        if (scene.lines.outerLine) lines.push(scene.lines.outerLine);
      }

      if (lines.length === 0) {
        tooltip.style.display = "none";
        return;
      }

      let closestPoint = null;
      let minDist = Infinity;
      let closestIndex = -1;
      let closestTag = null;

      lines.forEach(line => {
        const positions = line.geometry.attributes.position.array;
        const tags = (line.geometry.attributes.tag && line.geometry.attributes.tag.array) || [];

        for (let i = 0; i < positions.length; i += 3) {
          const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
          const projected = vertex.clone().project(camera);
          const screenX = (projected.x + 1) / 2 * rect.width;
          const screenY = (-projected.y + 1) / 2 * rect.height;
          const dx = screenX - (event.clientX - rect.left);
          const dy = screenY - (event.clientY - rect.top);
          const dist = Math.sqrt(dx*dx + dy*dy);

          if (dist < minDist && dist < 10) {
            minDist = dist;
            closestPoint = vertex;
            closestIndex = i / 3;
            closestTag = tags[i / 3] !== undefined ? tags[i / 3] : null;
          }
        }
      });

      if (closestPoint) {
        tooltip.style.display = "block";
        tooltip.style.left = event.clientX + 10 + "px";
        tooltip.style.top = event.clientY + 10 + "px";
        tooltip.innerText = `Index: ${closestIndex}\nx: ${closestPoint.x.toFixed(1)}, y: ${closestPoint.y.toFixed(1)}, z: ${closestPoint.z.toFixed(1)}` +
                            (closestTag !== null ? `\nTag: ${closestTag}` : "");
      } else {
        tooltip.style.display = "none";
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    return () => canvas.removeEventListener("mousemove", handleMouseMove);
  }, [sceneRef.current, rendererRef.current, cameraRef.current]);


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
        {/* Rechte Canvas-Box */}
        <div ref={canvasRef} id="canvas-container" style={{flex: 1, minHeight: 0, maxHeight: 'calc(100vh - 160px)',  overflow: 'hidden' }}></div>
        {/* Canvas-Box TooltiipRef */}
        <div ref={tooltipRef} style={{ position:'absolute', padding:'4px 6px', background:'#000', color:'#fff', borderRadius:4, pointerEvents:'none', display:'none', fontSize:12 }}></div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<HotwireWing3D />);