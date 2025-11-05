window.createLine = function(pts, yOffset, color) {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  pts.forEach(p => vertices.push(p.x, yOffset, p.y));
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color }));
};

window.removeLine = function(scene, lineName) {
  if (scene.lines && scene.lines[lineName]) {
    const line = scene.lines[lineName];
    scene.remove(line);
    if (line.geometry) line.geometry.dispose();
    if (line.material) line.material.dispose();
    scene.lines[lineName] = null;
  }
};

function makeTextSprite(message) {
  const canvas = document.createElement('canvas');
  const size = 128; // Canvas größer für bessere Auflösung
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');

  context.clearRect(0, 0, size, size);
  context.font = '28px Arial'; // kleinere Schrift
  context.fillStyle = 'black';
  context.textAlign = 'center';
  context.textBaseline = 'middle'; // Text mittig platzieren
  context.fillText(message, size / 2, size / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);

  sprite.scale.set(8, 8, 3); // kleinere Größe für bessere Sichtbarkeit

  return sprite;
}

// global in main.jsx oder utils/threeHelpers.js
window.addCenterMMGrid = function(scene, innerProfile, outerProfile, coarseStep = 10, fineStep = 1) {
  if (!scene) return;

  // Vorher vorhandenes Raster entfernen
  if (scene.gridMM) {
    scene.gridMM.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
      if (obj.type === 'Sprite') obj.material.map.dispose();
    });
    scene.remove(scene.gridMM);
    scene.gridMM = null;
  }

  const gridGroup = new THREE.Group();

  // Materialien
  const coarseMaterial = new THREE.LineBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.2
  });

  const mediumMaterial = new THREE.LineBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.15 // mittlere Sichtbarkeit
  });

  const fineMaterial = new THREE.LineBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.1
  });

  const invert = v => -v;

  // Profile-Bounds berechnen
  const allPoints = innerProfile.concat(outerProfile);
  const yValues = allPoints.map(p => p.y);
  const xValues = allPoints.map(p => p.x);

  const yMin = Math.min(...xValues);
  const yMax = Math.max(...xValues);
  const zMin = Math.min(...yValues);
  const zMax = Math.max(...yValues);

  const yStart = Math.floor(yMin / coarseStep) * coarseStep;
  const yEnd = Math.ceil(yMax / coarseStep) * coarseStep;
  const zStart = Math.floor(zMin / coarseStep) * coarseStep;
  const zEnd = Math.ceil(zMax / coarseStep) * coarseStep;

  // --- Grobes Raster + Zahlen (10mm) ---
  for (let y = yStart; y <= yEnd; y += coarseStep) {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, invert(y), zStart),
      new THREE.Vector3(0, invert(y), zEnd)
    ]);
    gridGroup.add(new THREE.Line(geometry, coarseMaterial));

    const label = makeTextSprite(`${y} mm`);
    label.position.set(0, invert(y), zEnd + coarseStep * 0.2);
    gridGroup.add(label);
  }

  for (let z = zStart; z <= zEnd; z += coarseStep) {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, invert(yStart), z),
      new THREE.Vector3(0, invert(yEnd), z)
    ]);
    gridGroup.add(new THREE.Line(geometry, coarseMaterial));

    const label = makeTextSprite(`${z} mm`);
    label.position.set(0, invert(yEnd + coarseStep * 0.2), z);
    gridGroup.add(label);
  }

  // --- Mittleres Raster (5mm) ---
  const mediumStep = coarseStep / 2;
  for (let y = yStart + mediumStep; y < yEnd; y += coarseStep) {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, invert(y), zStart),
      new THREE.Vector3(0, invert(y), zEnd)
    ]);
    gridGroup.add(new THREE.Line(geometry, mediumMaterial));
  }

  for (let z = zStart + mediumStep; z < zEnd; z += coarseStep) {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, invert(yStart), z),
      new THREE.Vector3(0, invert(yEnd), z)
    ]);
    gridGroup.add(new THREE.Line(geometry, mediumMaterial));
  }

  // --- Feines Raster (1mm) ---
  if (fineStep < coarseStep) {
    for (let y = yStart; y <= yEnd; y += fineStep) {
      if (y % coarseStep === 0 || y % mediumStep === 0) continue;
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, invert(y), zStart),
        new THREE.Vector3(0, invert(y), zEnd)
      ]);
      gridGroup.add(new THREE.Line(geometry, fineMaterial));
    }

    for (let z = zStart; z <= zEnd; z += fineStep) {
      if (z % coarseStep === 0 || z % mediumStep === 0) continue;
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, invert(yStart), z),
        new THREE.Vector3(0, invert(yEnd), z)
      ]);
      gridGroup.add(new THREE.Line(geometry, fineMaterial));
    }
  }

  // 90° um Z drehen
  gridGroup.rotation.z = Math.PI / 2;

  scene.gridMM = gridGroup;
  scene.add(gridGroup);
};




