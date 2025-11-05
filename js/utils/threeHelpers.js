window.createLine = function(pts, yOffset, color, dashed = false, opacity = 1) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    pts.forEach(p => vertices.push(p.x, yOffset, p.y));
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    let material;
    if (dashed) {
        material = new THREE.LineDashedMaterial({
            color: color,
            dashSize: 1,     // Länge der Striche
            gapSize: 0.5,    // Abstand zwischen Strichen
            linewidth: 1,
            transparent: true,
            opacity: opacity
        });
    } else {
        material = new THREE.LineBasicMaterial({
            color: color,
            transparent: opacity < 1,
            opacity: opacity
        });
    }

    const line = new THREE.Line(geometry, material);

    if (dashed) line.computeLineDistances(); // Wichtig für gestrichelte Linien

    return line;
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

window.createProjectedSurface = function(scene, innerProjected, outerProjected, innerColor = 0x00ff00, outerColor = 0x88ff88, opacity = 0.5) {
  if (!innerProjected || !outerProjected || innerProjected.length !== outerProjected.length) {
    console.warn("createProjectedSurface: Arrays fehlen oder haben unterschiedliche Länge");
    return;
  }

  // Vorherige Fläche entfernen
  if (scene.projectedSurface) {
    scene.remove(scene.projectedSurface);
    scene.projectedSurface.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
    delete scene.projectedSurface;
  }

  const group = new THREE.Group();

  for (let i = 0; i < innerProjected.length - 1; i++) {
    const p1 = innerProjected[i];
    const p2 = outerProjected[i];
    const p3 = outerProjected[i + 1];
    const p4 = innerProjected[i + 1];

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      p1.x, p1.z, p1.y,
      p2.x, p2.z, p2.y,
      p3.x, p3.z, p3.y,

      p3.x, p3.z, p3.y,
      p4.x, p4.z, p4.y,
      p1.x, p1.z, p1.y,
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    // Außenfläche: leichtes Grün, transparent, kaum Glanz
    const outerMaterial = new THREE.MeshPhongMaterial({
      color: outerColor,
      side: THREE.FrontSide,
      transparent: true,
      opacity: opacity,
      shininess: 10,
      specular: 0x00ff00, // leicht grünlicher Glanz
    });

    // Innenfläche: sattes Grün, wie vorher
    const innerMaterial = new THREE.MeshPhongMaterial({
      color: innerColor,
      side: THREE.BackSide,
      transparent: true,
      opacity: opacity,
      shininess: 80,
      specular: 0xffffff,
    });

    group.add(new THREE.Mesh(geometry, outerMaterial));
    group.add(new THREE.Mesh(geometry, innerMaterial));
  }

  scene.projectedSurface = group;
  scene.add(group);

  // Licht prüfen / hinzufügen
  if (!scene.userData.projectedSurfaceLight) {
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(500, 500, 1000);
    const fill = new THREE.DirectionalLight(0xffffff, 0.3);
    fill.position.set(-500, -500, -500);
    scene.add(ambient, directional, fill);
    scene.userData.projectedSurfaceLight = { ambient, directional, fill };
  }
};







