window.createLine = function(pts, yOffset, color) {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  pts.forEach(p => vertices.push(p.x, yOffset, p.y));
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color }));
};