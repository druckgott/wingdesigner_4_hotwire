window.parseDAT = function(datText) {
  const lines = datText.split(/\r?\n/).map(l => l.trim());
  const pts = [];
  for (const l of lines) {
    const parts = l.split(/\s+/);
    if (parts.length >= 2) {
      const x = parseFloat(parts[0]);
      const y = parseFloat(parts[1]);
      if (!isNaN(x) && !isNaN(y)) {
        pts.push({ x, y, tag: "profile" });
      }
    }
  }
  if (pts.length > 1) {
    pts[0].tag = "start";
    pts[pts.length - 1].tag = "end";
  }
  return pts;
};