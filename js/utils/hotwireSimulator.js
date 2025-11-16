// globales Sim-Objekt
window.hotwireSim = window.hotwireSim || {
  running: false,
  index: 0,
  line: null,
  surface: null,
  cones: [],
  frame: null,
  lastTime: null,
  speedMultiplier: 1
};

// --- startHotwireSimulation: NUR Speed ändern, wenn läuft ---
window.startHotwireSimulation = function(scene, innerPts, outerPts, hotwireLength, speedMultiplier = 1) {
  if (!scene || !innerPts?.length || !outerPts?.length) return;

  const total = Math.min(innerPts.length, outerPts.length);
  const trailLength = 50;

  // --- FALL 1: Simulation läuft → NUR Speed ändern ---
  if (window.hotwireSim.running) {
    window.hotwireSim.speedMultiplier = speedMultiplier;
    // lastTime bleibt → kein Ruckeln
    return;
  }

  // --- FALL 2: ECHTER NEUSTART (z. B. nach stop oder erstmalig) ---
  // Nur hier: alles aufräumen + index = 0
  window.stopHotwireSimulation(scene);
  window.hotwireSim.running = true;
  window.hotwireSim.speedMultiplier = speedMultiplier;
  window.hotwireSim.index = 0;
  window.hotwireSim.lastTime = performance.now();

  // --- ORANGE LINIE ---
  const linePositions = new Float32Array(6);
  const lineColors = new Float32Array(6);
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
  const lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: false,
    opacity: 1.0,
    linewidth: 3
  });
  const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lineMesh);
  window.hotwireSim.line = { mesh: lineMesh, positions: linePositions, colors: lineColors };

  // --- SURFACE ---
  const maxLines = trailLength;
  const maxSegments = maxLines - 1;
  const surfacePositions = new Float32Array(maxLines * 6);
  const surfaceIndices = new Uint32Array(maxSegments * 6);
  let m = 0;
  for (let seg = 0; seg < maxSegments; seg++) {
    const base = seg * 2;
    surfaceIndices[m++] = base + 0; surfaceIndices[m++] = base + 1; surfaceIndices[m++] = base + 2;
    surfaceIndices[m++] = base + 1; surfaceIndices[m++] = base + 3; surfaceIndices[m++] = base + 2;
  }
  const surfaceGeometry = new THREE.BufferGeometry();
  surfaceGeometry.setAttribute('position', new THREE.BufferAttribute(surfacePositions, 3));
  surfaceGeometry.setIndex(new THREE.BufferAttribute(surfaceIndices, 1));
  surfaceGeometry.setDrawRange(0, 0);
  const surfaceMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffcc,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  });
  const surfaceMesh = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
  scene.add(surfaceMesh);
  window.hotwireSim.surface = {
    mesh: surfaceMesh,
    positions: surfacePositions,
    numLines: 0,
    head: 0
  };

  // --- Kegel ---
  const coneHeight = 5;
  const coneRadius = 3;
  const coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 16);
  coneGeometry.rotateX(Math.PI / 2);
  coneGeometry.translate(0, 0, -coneHeight / 2);
  const coneMatLeft = new THREE.MeshStandardMaterial({ color: 0xb5a642, metalness: 0.8, roughness: 0.3 });
  const coneMatRight = new THREE.MeshStandardMaterial({ color: 0xffa500, metalness: 0.8, roughness: 0.3 });
  const coneLeft = new THREE.Mesh(coneGeometry, coneMatLeft);
  const coneRight = new THREE.Mesh(coneGeometry, coneMatRight);
  scene.add(coneLeft);
  scene.add(coneRight);
  window.hotwireSim.cones = [coneLeft, coneRight];

  // --- Licht ---
  if (!scene.getObjectByName('hotwireLight')) {
    const light = new THREE.PointLight(0xffffff, 5.0, 1000);
    light.position.set(0, 0, 50);
    light.name = 'hotwireLight';
    scene.add(light);
  }

  function animate() {
    if (!window.hotwireSim.running) return;

    const now = performance.now();
    const delta = now - window.hotwireSim.lastTime;
    window.hotwireSim.lastTime = now;

    const speed = window.hotwireSim.speedMultiplier;
    window.hotwireSim.index += speed * 60 * (delta / 1000);
    const i = Math.floor(window.hotwireSim.index) % total;
    const pL = innerPts[i];
    const pR = outerPts[i];
    if (!pL || !pR) return;

    const v1 = new THREE.Vector3(pL.x, -hotwireLength / 2, pL.y);
    const v2 = new THREE.Vector3(pR.x, hotwireLength / 2, pR.y);

    // --- ORANGE LINIE ---
    const line = window.hotwireSim.line;
    line.positions[0] = v1.x; line.positions[1] = v1.y; line.positions[2] = v1.z;
    line.positions[3] = v2.x; line.positions[4] = v2.y; line.positions[5] = v2.z;
    for (let c = 0; c < 6; c += 3) {
      line.colors[c] = 1.0; line.colors[c + 1] = 0.5; line.colors[c + 2] = 0.0;
    }
    line.mesh.geometry.attributes.position.needsUpdate = true;
    line.mesh.geometry.attributes.color.needsUpdate = true;

    // --- SURFACE ---
    const s = window.hotwireSim.surface;
    const sPos = s.positions;
    const head = s.head;

    for (let j = sPos.length - 6; j >= 6; j -= 6) {
      sPos[j]     = sPos[j - 6];
      sPos[j + 1] = sPos[j - 5];
      sPos[j + 2] = sPos[j - 4];
      sPos[j + 3] = sPos[j - 3];
      sPos[j + 4] = sPos[j - 2];
      sPos[j + 5] = sPos[j - 1];
    }
    sPos[0] = v1.x; sPos[1] = v1.y; sPos[2] = v1.z;
    sPos[3] = v2.x; sPos[4] = v2.y; sPos[5] = v2.z;

    s.head = (head + 1) % trailLength;
    if (s.numLines < trailLength) s.numLines++;
    s.mesh.geometry.setDrawRange(0, (s.numLines - 1) * 6);
    s.mesh.geometry.attributes.position.needsUpdate = true;

    // --- Kegel ---
    const leftDir = new THREE.Vector3().subVectors(v2, v1).normalize();
    const rightDir = new THREE.Vector3().subVectors(v1, v2).normalize();
    coneLeft.position.copy(v1);
    coneRight.position.copy(v2);
    coneLeft.lookAt(v1.clone().add(leftDir));
    coneRight.lookAt(v2.clone().add(rightDir));

    window.hotwireSim.frame = requestAnimationFrame(animate);
  }

  animate();
};

// --- STOP: Nur wenn wirklich gestoppt werden soll ---
window.stopHotwireSimulation = function(scene) {
  if (!window.hotwireSim) return;
  window.hotwireSim.running = false;
  if (window.hotwireSim.frame) cancelAnimationFrame(window.hotwireSim.frame);

  if (window.hotwireSim.line?.mesh) {
    scene.remove(window.hotwireSim.line.mesh);
    window.hotwireSim.line.mesh.geometry.dispose();
    window.hotwireSim.line.mesh.material.dispose();
  }
  if (window.hotwireSim.surface?.mesh) {
    scene.remove(window.hotwireSim.surface.mesh);
    window.hotwireSim.surface.mesh.geometry.dispose();
    window.hotwireSim.surface.mesh.material.dispose();
  }
  if (window.hotwireSim.cones?.length) {
    window.hotwireSim.cones.forEach(c => {
      scene.remove(c);
      c.geometry.dispose();
      c.material.dispose();
    });
  }

  // index bleibt für Neustart erhalten
  window.hotwireSim = {
    running: false,
    index: window.hotwireSim.index,
    line: null,
    surface: null,
    cones: [],
    frame: null,
    lastTime: null,
    speedMultiplier: 1
  };
};