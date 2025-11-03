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
  const [activeView, setActiveView] = useState('3D'); // '3D' | '2D-side'

  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraPosRef = useRef({ x: 0, y: 0, z: 0 });
  const cameraTargetRef = useRef({ x: 0, y: 0, z: 0 });
  const tooltipRef = useRef(null);
  const markerRef = useRef(null);  // der Marker für den aktuell gewählten Punkt
  const sideCanvasRef = useRef(null);

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
    sprite.scale.set(4, 4, 1);
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

        // --- Marker skalieren, damit er gleich groß bleibt ---
      if (markerRef.current && cameraRef.current) {
        const cam = cameraRef.current;
        const marker = markerRef.current;

        const distance = cam.position.distanceTo(marker.position);
        const vFOV = cam.fov * (Math.PI / 180);
        const height = 2 * Math.tan(vFOV / 2) * distance;
        const rendererHeight = rendererRef.current.domElement.clientHeight;
        const scale = (8 / rendererHeight) * height; // 8 = gewünschte Pixelgröße
        marker.scale.set(scale, scale, 1);
      }

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

      // Tag aus debugPoints holen
      const tagArray = line === scene.lines.innerLine ? debugPoints.inner : debugPoints.outer;
      closestTag = tagArray[i / 3] ? tagArray[i / 3].tag : null;
    }
  }
});


    if (closestPoint) {
      let tagText = closestTag && Object.values(window.PointTag).includes(closestTag) ? `\nTag: ${closestTag}` : `\nNo Tag`;
      tooltip.style.display = "block";
      tooltip.style.left = event.clientX + 10 + "px";
      tooltip.style.top = event.clientY + 10 + "px";
      tooltip.innerText = 
          `Index: ${closestIndex}\nx: ${closestPoint.x.toFixed(2)}, y: ${closestPoint.y.toFixed(2)}, z: ${closestPoint.z.toFixed(2)}` +
          tagText;
      
        // Marker setzen
      if (markerRef.current) {
        markerRef.current.position.copy(closestPoint);
        // Farbe abhängig vom Tag
        if (closestTag === window.PointTag.START || closestTag === window.PointTag.END || closestTag === window.PointTag.AILERON || closestTag === window.PointTag.HOLE  || closestTag === window.PointTag.HOLE_END) {
          markerRef.current.material.color.set(0x00ff00); // grün
        } else {
          markerRef.current.material.color.set(0x000000); // schwarz
        }
        markerRef.current.visible = true;
      }


    } else {
      tooltip.style.display = "none";
    }


  };

  canvas.addEventListener("mousemove", handleMouseMove);
  return () => canvas.removeEventListener("mousemove", handleMouseMove);
}, [sceneRef.current, rendererRef.current, cameraRef.current, debugPoints]);

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

    //hier weiter bauen
    
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

    const { innerNew, outerNew } = window.syncTaggedPointsNoDuplicates(innerTrimmed, outerTrimmed, profilePointsCount);

    //setDebugPoints({ inner: innerNew.map(p => ({x: p.x, y: p.y, tag: p.tag || null })), outer: outerNew.map(p => ({x: p.x, y: p.y, tag: p.tag || null}))});

    const innerFinal = innerNew.map(p => window.rotatePoint(p, rotationInner));
    const outerFinal = outerNew.map(p => window.rotatePoint(p, rotationOuter));

    const scene = sceneRef.current;
    if (scene.lines && scene.lines.innerLine) scene.remove(scene.lines.innerLine);
    if (scene.lines && scene.lines.outerLine) scene.remove(scene.lines.outerLine);

    const innerLine = window.createLine(innerFinal, -span / 2, parseInt(innerColor.slice(1), 16));
    const outerLine = window.createLine(outerFinal, span / 2, parseInt(outerColor.slice(1), 16));

    scene.lines = { innerLine, outerLine };
    scene.add(innerLine);
    scene.add(outerLine);

    setDebugPoints({ inner: innerFinal.map(p => ({x: p.x, y: p.y, tag: p.tag || null })), outer: outerFinal.map(p => ({x: p.x, y: p.y, tag: p.tag || null}))});
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

// 2D 
useEffect(() => {
  if (!sideCanvasRef.current) return;
  const canvas = sideCanvasRef.current;
  const ctx = canvas.getContext('2d');

  const draw = () => {
    if (!canvas) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const allPoints = [...debugPoints.inner, ...debugPoints.outer];
    if (allPoints.length === 0) return;

    let minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    allPoints.forEach(p => {
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
      if (p.z < minZ) minZ = p.z;
      if (p.z > maxZ) maxZ = p.z;
    });

    const profileWidth = maxY - minY;
    const profileHeight = maxZ - minZ;

    const pad = 20;
    const scaleX = (width - 2*pad) / profileWidth;
    const scaleY = (height - 2*pad) / profileHeight;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = pad - minY * scale + (width - 2*pad - profileWidth*scale)/2;
    const offsetY = pad + profileHeight*scale + (height - 2*pad - profileHeight*scale)/2;

    // Raster
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    for(let x=0; x<width; x+=10*scale){
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,height); ctx.stroke();
    }
    for(let y=0; y<height; y+=10*scale){
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(width,y); ctx.stroke();
    }

    const drawProfile = (points, color) => {
      ctx.strokeStyle = color;
      ctx.beginPath();
      points.forEach((p,i)=>{
        const px = p.y * scale + offsetX;
        const py = offsetY - p.z * scale;
        if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
      });
      ctx.stroke();
    };

    if(debugPoints.inner.length>0) drawProfile(debugPoints.inner, innerColor);
    if(debugPoints.outer.length>0) drawProfile(debugPoints.outer, outerColor);
  };

  // Initial draw oder bei debugPoints/activeView Änderung
  if(activeView === '2D-side') draw();

  // Resize-Handler nur einmal
  const handleResize = () => {
    if(activeView === '2D-side') draw();
  }
  window.addEventListener('resize', handleResize);

  return () => window.removeEventListener('resize', handleResize);
}, [debugPoints, activeView, innerColor, outerColor]);



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
        {/* Left Canvas-Box */}
        <LeftPanel
          cameraPosRef={cameraPosRef} cameraTargetRef={cameraTargetRef}
          innerDAT={innerDAT} setInnerDAT={setInnerDAT}
          outerDAT={outerDAT} setOuterDAT={setOuterDAT}
          innerName={innerName} setInnerName={setInnerName}
          outerName={outerName} setOuterName={setOuterName}
          handleFile={handleFile}
          span={span} setSpan={setSpan} 
          profilePointsCount={profilePointsCount} setProfilePointsCount={setProfilePointsCount}
          innerColor={innerColor} setInnerColor={setInnerColor} innerScale={innerScale} setInnerScale={setInnerScale} 
          thicknessScaleInner={thicknessScaleInner} setThicknessScaleInner={setThicknessScaleInner} 
          rotationInner={rotationInner} setRotationInner={setRotationInner}
          outerColor={outerColor} setOuterColor={setOuterColor} outerScale={outerScale} setOuterScale={setOuterScale} 
          thicknessScaleOuter={thicknessScaleOuter} setThicknessScaleOuter={setThicknessScaleOuter} 
          rotationOuter={rotationOuter} setRotationOuter={setRotationOuter}
          outerVerticalOffset={outerVerticalOffset} setOuterVerticalOffset={setOuterVerticalOffset} 
          outerChordOffset={outerChordOffset} setOuterChordOffset={setOuterChordOffset}
          holes={holes} setHoles={setHoles} ailerons={ailerons} setAilerons={setAilerons}
          trimEnabled={trimEnabled} setTrimEnabled={setTrimEnabled} 
          trimLEmm={trimLEmm} setTrimLEmm={setTrimLEmm} trimTEmm={trimTEmm} setTrimTEmm={setTrimTEmm}
          activeTab={activeTab} setActiveTab={setActiveTab} 
          debugOpen={debugOpen} setDebugOpen={setDebugOpen} debugPoints={debugPoints}
        />
        {/* Rechte Canvas-Box mit Tabs */}
        <div style={{flex: 1, minHeight: 0, position: 'relative'}}>

          {/* Tabs oben */}
          <div style={{display:'flex', gap: 8, marginBottom: 8}}>
            <button 
              onClick={() => setActiveView('3D')} 
              style={{ fontWeight: activeView==='3D'?'bold':'normal' }}
            >3D Ansicht</button>
            <button 
              onClick={() => setActiveView('2D-side')} 
              style={{ fontWeight: activeView==='2D-side'?'bold':'normal' }}
            >Seitenansicht</button>
          </div>

          {/* Canvas-Bereiche */}
          {activeView === '3D' && 
            <div ref={canvasRef} id="canvas-container" style={{width:'100%', height:'100%'}}></div>
          }

          {activeView === '2D-side' &&
            <canvas ref={sideCanvasRef} style={{width:'100%', height:'100%'}}></canvas>
          }

        </div>
        {/* Canvas-Box TooltiipRef */}
        <div ref={tooltipRef} style={{ position:'absolute', padding:'4px 6px', background:'#000', color:'#fff', borderRadius:4, pointerEvents:'none', display:'none', fontSize:12 }}></div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<HotwireWing3D />);