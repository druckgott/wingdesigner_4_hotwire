window.scaleProfile = function(pts, scale) {
  return pts.map(p => ({ ...p, x: p.x * scale, y: p.y * scale }));
};

window.matchPointCount = function(ptsA, ptsB) {
  const maxLen = Math.max(ptsA.length, ptsB.length);
  const resample = (pts, targetLen) => {
    const out = [];
    for (let i = 0; i < targetLen; i++) {
      const t = i / (targetLen - 1) * (pts.length - 1);
      const i0 = Math.floor(t), i1 = Math.ceil(t);
      const f = t - i0;
      const p0 = pts[i0] || { x: 0, y: 0 };
      const p1 = pts[i1] || { x: 0, y: 0 };
      out.push({ x: p0.x * (1 - f) + p1.x * f, y: p0.y * (1 - f) + p1.y * f, tag: p0.tag });
    }
    return out;
  };
  return [resample(ptsA, maxLen), resample(ptsB, maxLen)];
};

window.offsetOuterProfile = function(pts, verticalOffset, chordOffset) {
  return pts.map(p => ({ ...p, x: p.x + chordOffset, y: p.y + verticalOffset }));
};

window.rotatePoint = function(pt, angleRad) {
  const cosA = Math.cos(angleRad), sinA = Math.sin(angleRad);
  return {
    ...pt,
    x: pt.x * cosA - pt.y * sinA,
    y: pt.x * sinA + pt.y * cosA
  };
};

window.getHolePoints = function(diameter, xPercent, yPercent, profilePts, nPoints) {
  if (!profilePts || profilePts.length === 0) return [];
  const xs = profilePts.map(p => p.x);
  const ys = profilePts.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const centerX = minX + xPercent * (maxX - minX);
  const centerY = minY + yPercent * (maxY - minY);
  const radius = diameter / 2;
  const holePts = [];
  for (let i = 0; i < nPoints; i++) {
    const theta = (i / nPoints) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(theta);
    const y = centerY + radius * Math.sin(theta);
    holePts.push({ x, y, tag: "hole" });
  }
  return holePts;
};

window.findClosestHolePoint = function(profilePts, holePts) {
  let minDist = Infinity, closestHoleIdx = 0, closestProfileIdx = 0;
  profilePts.forEach(({ x: px, y: py }, i) => {
    holePts.forEach(({ x: hx, y: hy }, j) => {
      const dx = px - hx, dy = py - hy;
      const dist = dx*dx + dy*dy;
      if (dist < minDist) {
        minDist = dist;
        closestHoleIdx = j;
        closestProfileIdx = i;
      }
    });
  });
  return { closestHoleIdx, closestProfileIdx };
};

window.rotateHolePointsToStart = function(holePts, startIdx, reverse = false) {
  let pts = [...holePts.slice(startIdx), ...holePts.slice(0, startIdx)];
  if (reverse) pts.reverse();
  return pts;
};

window.createCutPoints = function(profilePt, holePt, n = 3) {
  const { x: px, y: py } = profilePt;
  const { x: hx, y: hy } = holePt;
  const points = [];
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1);
    const x = px + t * (hx - px);
    const y = py + t * (hy - py);
    points.push({ x, y });
  }
  return points;
};

window.insertHoleWithInOut = function(profilePts, holePts, nCutPoints = 3) {
  if (!profilePts.length || !holePts.length) return profilePts;
  const { closestProfileIdx: ipIdx, closestHoleIdx: ihIdx } = window.findClosestHolePoint(profilePts, holePts);
  const profilePt = profilePts[ipIdx];
  const holePt = holePts[ihIdx];
  const inOutProfilePt = { ...profilePt, tag: "profile" };
  const inOutHolePt = { ...holePt, tag: "hole" };
  const rotatedHolePts = window.rotateHolePointsToStart(holePts, ihIdx, true).map(p => ({ x: p.x, y: p.y, tag: "hole" }));
  const cutPts = window.createCutPoints(profilePt, holePt, nCutPoints).map(p => ({ x: p.x, y: p.y, tag: "hole" }));
  return [
    ...profilePts.slice(0, ipIdx + 1),
    inOutProfilePt,
    ...cutPts,
    inOutHolePt,
    ...rotatedHolePts.slice(1),
    inOutHolePt,
    ...cutPts.slice().reverse(),
    inOutProfilePt,
    ...profilePts.slice(ipIdx + 1)
  ];
};

window.smoothProfile = function(points, threshold = 2) {
  const smoothed = [{ ...points[0] }];
  for (let i = 1; i < points.length; i++) {
    const prev = smoothed[smoothed.length - 1];
    const pt = points[i];
    let y = pt.y;
    if (Math.abs(y - prev.y) > threshold) {
      y = prev.y + Math.sign(y - prev.y) * threshold;
    }
    smoothed.push({ ...pt, y });
  }
  return smoothed;
};

window.findTopAtX = function(profilePts, xCut) {
  const n = profilePts.length;
  const half = Math.ceil(n / 2);
  const topPts = profilePts.slice(0, half);
  for (let i = 0; i < topPts.length - 1; i++) {
    const { x: x1, y: y1 } = topPts[i];
    const { x: x2, y: y2 } = topPts[i + 1];
    if ((x1 <= xCut && x2 >= xCut) || (x2 <= xCut && x1 >= xCut)) {
      const t = (xCut - x1) / (x2 - x1);
      return y1 + t * (y2 - y1);
    }
  }
  return topPts[0].y;
};

window.findBottomAtX = function(profilePts, xCut) {
  const n = profilePts.length;
  const half = Math.ceil(n / 2);
  const bottomPts = profilePts.slice(half);
  for (let i = 0; i < bottomPts.length - 1; i++) {
    const { x: x1, y: y1 } = bottomPts[i];
    const { x: x2, y: y2 } = bottomPts[i + 1];
    if ((x1 <= xCut && x2 >= xCut) || (x2 <= xCut && x1 >= xCut)) {
      const t = (xCut - x1) / (x2 - x1);
      return y1 + t * (y2 - y1);
    }
  }
  return bottomPts[0].y;
};

window.projectToProfile = function(profilePts, x) {
  for (let i = 0; i < profilePts.length - 1; i++) {
    const { x: x0, y: y0 } = profilePts[i];
    const { x: x1, y: y1 } = profilePts[i + 1];
    if (x >= x0 && x <= x1) {
      const t = (x - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return profilePts[profilePts.length - 1].y;
};

window.addBottomPath = function(profilePts, xPercent = 0.5, gap = 2, forwardAngleDeg = 10, backwardAngleDeg = 10) {
  const forwardAngle = forwardAngleDeg * Math.PI / 180;
  const backwardAngle = backwardAngleDeg * Math.PI / 180;
  const xs = profilePts.map(p => p.x);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const xCut = minX + xPercent * (maxX - minX);
  const yBottom = window.findBottomAtX(profilePts, xCut);
  const yTop = window.findTopAtX(profilePts, xCut);
  const apexY = yTop - gap;
  const VHeight = apexY - yBottom;
  const dxBack = Math.tan(backwardAngle) * VHeight;
  const dxFwd = Math.tan(forwardAngle) * VHeight;
  const apexPt = { x: xCut, y: apexY, tag: "aileron" };
  const backPt = { x: xCut - dxBack, y: yBottom, tag: "aileron" };
  const fwdPt = { x: xCut + dxFwd, y: yBottom, tag: "aileron" };
  const half = Math.ceil(profilePts.length / 2);
  const bottomPts = profilePts.slice(half);
  fwdPt.y = window.projectToProfile(bottomPts, fwdPt.x);
  backPt.y = window.projectToProfile(bottomPts, backPt.x);
  const left = bottomPts.filter(p => p.x < backPt.x);
  const right = bottomPts.filter(p => p.x > fwdPt.x);
  const newBottom = [...left, backPt, apexPt, fwdPt, ...right];
  return [...profilePts.slice(0, half), ...newBottom];
};

window.trimAirfoilFront = function(points, trimLEmm) {
  if (!points || points.length < 2 || trimLEmm <= 0) return points;
  const xMin = Math.min(...points.map(p => p.x));
  const xLimit = xMin + trimLEmm;
  let topPoint = null, bottomPoint = null, topIndex = null, bottomIndex = null;
  for (let i = points.length - 1; i >= 0; i--) {
    if (points[i].x <= xLimit) {
      topPoint = { ...points[i], x: xLimit };
      topIndex = i;
      break;
    }
  }
  for (let i = 0; i < points.length; i++) {
    if (points[i].x <= xLimit) {
      bottomPoint = { ...points[i], x: xLimit };
      bottomIndex = i;
      break;
    }
  }
  if (!topPoint || !bottomPoint) return points;
  return [...points.slice(0, bottomIndex), bottomPoint, topPoint, ...points.slice(topIndex + 1)];
};

window.trimAirfoilBack = function(points, trimTEmm) {
  if (!points || points.length < 2 || trimTEmm <= 0) return points;
  const xMax = Math.max(...points.map(p => p.x));
  const xLimit = xMax - trimTEmm;
  const interpY = (p1, p2, x) => {
    if (!p1 || !p2 || p1.x === p2.x) return p1 ? p1.y : 0;
    return p1.y + (p2.y - p1.y) * (x - p1.x) / (p2.x - p1.x);
  };
  const upper = [];
  let upperDone = false;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.x <= xLimit) upper.push({ ...p });
    if (!upperDone && p.y > 0 && points[i+1]?.x <= xLimit) {
      const yProfile = interpY(points[i+1], p, xLimit);
      upper.push({ x: xLimit, y: points[0].y });
      upper.push({ x: xLimit, y: yProfile });
      upperDone = true;
    }
  }
  const lower = [];
  let lowerDone = false;
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i];
    if (!lowerDone && p.y < 0 && points[i-1]?.x <= xLimit) {
      const yProfile = interpY(p, points[i-1], xLimit);
      lower.push({ x: xLimit, y: yProfile });
      lower.push({ x: xLimit, y: points[0].y });
      lowerDone = true;
    }
  }
  return [...upper, ...lower];
};

// Funktion: Punkte gleichmäßig entlang der Kurve verteilen
// Funktion: Punkte gleichmäßig entlang der Kurve verteilen (Objekte {x, y})
window.resampleArcLength = function(points, targetLen) {
  if (!points || points.length < 2 || targetLen < 2) return points;

  // kumulative Abstände berechnen
  const distances = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    distances.push(distances[i - 1] + Math.hypot(dx, dy));
  }
  const totalLength = distances[distances.length - 1];

  // resample
  const out = [];
  for (let i = 0; i < targetLen; i++) {
    const t = (i / (targetLen - 1)) * totalLength;

    // Segment finden
    let j = 1;
    while (j < distances.length && distances[j] < t) j++;
    const i0 = j - 1;
    const i1 = j;

    const f = (distances[i1] - distances[i0]) === 0 ? 0 : (t - distances[i0]) / (distances[i1] - distances[i0]);
    const x = points[i0].x * (1 - f) + points[i1].x * f;
    const y = points[i0].y * (1 - f) + points[i1].y * f;

    out.push({ x, y });
  }

  return out;
};
