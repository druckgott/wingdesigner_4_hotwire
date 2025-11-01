window.PointTag = {
  PROFILE: "profile",
  START: "START_POINT",
  END: "END_POINT",
  LE: "LE",
  TE: "TE",
  HOLE: "hole",
  AILERON: "aileron"
};

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
    pts[0].tag = PointTag.START;
    pts[pts.length - 1].tag = PointTag.END;
  }
  return pts;
};