window.scaleProfile = function(pts, scale) {
  return pts.map(p => ({ ...p, x: p.x * scale, y: p.y * scale }));
};

window.matchPointCount = function(ptsA, ptsB) {
  const maxLen = Math.max(ptsA.length, ptsB.length);

  const resampleWithTags = (pts, targetLen) => {
    // Alle neutralen Punkte sammeln (ohne Tag)
    const neutralPts = pts.filter(p => !p.tag);
    const taggedPts = pts.filter(p => p.tag);

    const resampledNeutral = [];
    for (let i = 0; i < targetLen; i++) {
      const t = i / (targetLen - 1) * (neutralPts.length - 1);
      const i0 = Math.floor(t);
      const i1 = Math.ceil(t);
      const f = t - i0;

      const p0 = neutralPts[i0] || { x: 0, y: 0, z: 0 };
      const p1 = neutralPts[i1] || { x: 0, y: 0, z: 0 };

      resampledNeutral.push({
        x: p0.x * (1 - f) + p1.x * f,
        y: p0.y * (1 - f) + p1.y * f,
        z: (p0.z || 0) * (1 - f) + (p1.z || 0) * f,
        tag: null
      });
    }

    // Jetzt die getaggten Punkte wieder an den gleichen Index einfügen
    const result = [];
    let neutralIndex = 0;
    for (let i = 0; i < pts.length; i++) {
      if (pts[i].tag) {
        result.push(pts[i]); // Tagged Point unverändert
      } else {
        result.push(resampledNeutral[neutralIndex]);
        neutralIndex++;
      }
    }

    return result;
  };

  return [resampleWithTags(ptsA, maxLen), resampleWithTags(ptsB, maxLen)];
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
    holePts.push({ x, y, tag: "HOLE" });
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

  const inOutProfilePtStart = { ...profilePt, tag: window.PointTag.HOLE_END };
  const inOutProfilePtEnd = { ...profilePt, tag: window.PointTag.HOLE_END };
  const inOutHolePt = { ...holePt, tag: window.PointTag.HOLE };

  const rotatedHolePts = window.rotateHolePointsToStart(holePts, ihIdx, true)
    .map(p => ({ x: p.x, y: p.y, tag: window.PointTag.HOLE }));

  const cutPts = window.createCutPoints(profilePt, holePt, nCutPoints)
    .map(p => ({ x: p.x, y: p.y, tag: window.PointTag.HOLE }));

  const newProfile = [
  ...profilePts.slice(0, ipIdx), // alle Punkte **bis zum Insert-Punkt**, ohne Tag
  inOutProfilePtStart,                     // erster spezieller Punkt mit Tag
  ...cutPts,                           // Cut-Punkte mit Tag
  inOutHolePt,                         // Start-Hole-Punkt
  ...rotatedHolePts.slice(1),          // alle weiteren Hole-Punkte außer dem ersten (doppeltes vermeiden)
  inOutHolePt,                         // End-Hole-Punkt
  ...cutPts.slice().reverse(),        // Cut-Punkte wieder zurück
  inOutProfilePtEnd,                      // letzter spezieller Punkt mit Tag
  ...profilePts.slice(ipIdx)       // Rest des Profils ab Insert-Punkt
];

  return newProfile;
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

/*window.addBottomPath = function(profilePts, xPercent = 0.5, gap = 2, forwardAngleDeg = 10, backwardAngleDeg = 10) {
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

  // Neue Punkte mit Tag
  const apexPt = { x: xCut, y: apexY, tag: window.PointTag.AILERON };
  const backPt = { x: xCut - dxBack, y: yBottom, tag: window.PointTag.AILERON };
  const fwdPt = { x: xCut + dxFwd, y: yBottom, tag: window.PointTag.AILERON };

  const half = Math.ceil(profilePts.length / 2);
  const bottomPts = profilePts.slice(half);

  fwdPt.y = window.projectToProfile(bottomPts, fwdPt.x);
  backPt.y = window.projectToProfile(bottomPts, backPt.x);

  // Bestehende Punkte links/rechts unverändert übernehmen
  const left = bottomPts.filter(p => p.x < backPt.x);
  const right = bottomPts.filter(p => p.x > fwdPt.x);

  const newBottom = [...left, backPt, apexPt, fwdPt, ...right];

  return [...profilePts.slice(0, half), ...newBottom];
};*/

window.addBottomPath = function(profilePts, xPercent = 0.5, gap = 2, forwardAngleDeg = 10, backwardAngleDeg = 10) {
  const forwardAngle = forwardAngleDeg * Math.PI / 180;
  const backwardAngle = backwardAngleDeg * Math.PI / 180;

  // X-Schnittpunkt für den Apex
  const xs = profilePts.map(p => p.x);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const xCut = minX + xPercent * (maxX - minX);

  // Y-Werte Top/Bottom
  const yBottom = window.findBottomAtX(profilePts, xCut);
  const yTop = window.findTopAtX(profilePts, xCut);
  const apexY = yTop - gap;
  const VHeight = apexY - yBottom;

  // X-Verschiebung für Vorwärts- und Rückwärtspunkte
  const dxBack = Math.tan(backwardAngle) * VHeight;
  const dxFwd = Math.tan(forwardAngle) * VHeight;

  // Neue Punkte
  const apexPt = { x: xCut, y: apexY, tag: window.PointTag.AILERON };
  const backPt = { x: xCut - dxBack, y: yBottom, tag: window.PointTag.AILERON };
  const fwdPt = { x: xCut + dxFwd, y: yBottom, tag: window.PointTag.AILERON };

  // Untere Profilhälfte
  const half = Math.ceil(profilePts.length / 2);
  const bottomPts = profilePts.slice(half);

  // Y-Koordinaten an Fwd & Back auf Profil projizieren
  fwdPt.y = window.projectToProfile(bottomPts, fwdPt.x);
  backPt.y = window.projectToProfile(bottomPts, backPt.x);

  // 1️⃣ Punkte links vom Apex projizieren
  let betweenLeft = bottomPts.filter(p => p.x >= backPt.x && p.x < xCut)
    .map(p => {
      const t = (p.x - backPt.x) / (xCut - backPt.x);
      return {
        ...p,
        y: backPt.y + t * (apexPt.y - backPt.y),
        tag: window.PointTag.AILERON
      };
    });

  // 2️⃣ Punkte rechts vom Apex projizieren
  let betweenRight = bottomPts.filter(p => p.x > xCut && p.x <= fwdPt.x)
    .map(p => {
      const t = (p.x - xCut) / (fwdPt.x - xCut);
      return {
        ...p,
        y: apexPt.y + t * (fwdPt.y - apexPt.y),
        tag: window.PointTag.AILERON
      };
    });

  // Externe Punkte links/rechts behalten
  const left = bottomPts.filter(p => p.x < backPt.x);
  const right = bottomPts.filter(p => p.x > fwdPt.x);

  // Neuer unterer Profilstrang
  const newBottom = [
    ...left,
    backPt,
    ...betweenLeft,
    apexPt,
    ...betweenRight,
    fwdPt,
    ...right
  ];

  return [
    ...profilePts.slice(0, half),
    ...newBottom
  ];
};


/*window.trimAirfoilFront = function(points, trimLEmm) {
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
};*/

window.trimAirfoilFront = function(points, trimLEmm) {
  if (!points || points.length < 2 || trimLEmm <= 0) return points;

  const xMin = Math.min(...points.map(p => p.x));
  const xLimit = xMin + trimLEmm;

  let topIndex = null;
  let bottomIndex = null;

  // Finde die Indizes für Top und Bottom im Trim-Bereich
  for (let i = points.length - 1; i >= 0; i--) {
    if (points[i].x <= xLimit) {
      topIndex = i;
      break;
    }
  }
  for (let i = 0; i < points.length; i++) {
    if (points[i].x <= xLimit) {
      bottomIndex = i;
      break;
    }
  }

  if (topIndex === null || bottomIndex === null) return points;

  // Alle Punkte links vom Trim-Bereich bleiben unverändert
  const left = points.slice(0, bottomIndex);

  // Punkte im Trim-Bereich: X auf xLimit projizieren
  const middle = points.slice(bottomIndex, topIndex + 1).map(p => ({
    ...p,
    x: xLimit
  }));

  // Eckpunkte taggen
  if (middle.length > 0) {
    middle[0].tag = window.PointTag.FRONT_TRIM;
    middle[middle.length - 1].tag = window.PointTag.FRONT_TRIM;
  }

  // Punkte rechts vom Trim-Bereich bleiben unverändert
  const right = points.slice(topIndex + 1);

  return [...left, ...middle, ...right];
};


/*window.trimAirfoilBack = function(points, trimTEmm) {
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
      upper.push({ x: xLimit, y: points[0].y, tag: "START_POINT" });
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
      lower.push({ x: xLimit, y: points[0].y, tag: "END_POINT" });
      lowerDone = true;
    }
  }
  return [...upper, ...lower];
};*/

window.trimAirfoilBack = function(points, trimTEmm) {
  if (!points || points.length < 2 || trimTEmm <= 0) return points;

  const xMax = Math.max(...points.map(p => p.x));
  const xLimit = xMax - trimTEmm;

  // Alle Punkte projizieren und gleichzeitig die projizierten Punkte sammeln
  const projected = [];
  const trimPoints = [];
  
  points.forEach(p => {
    const newP = { ...p, x: p.x > xLimit ? xLimit : p.x };
    projected.push(newP);
    if (newP.x === xLimit) trimPoints.push(newP);
  });

  // Tag für erste und letzte projizierte Punkte
  //if (trimPoints.length > 0) {
  //  trimPoints[0].tag = window.PointTag.BACK_TRIM;
  //  trimPoints[trimPoints.length - 1].tag = window.PointTag.BACK_TRIM;
  //}

  return projected;
};

// Funktion: Punkte gleichmäßig entlang der Kurve verteilen (Objekte {x, y})

window.resampleArcLength = function(points, targetLen) {
  if (!points || points.length < 2 || targetLen < 2) return points;

  // 1) kumulative Abstände
  const distances = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    distances.push(distances[i - 1] + Math.hypot(dx, dy));
  }
  const totalLength = distances[distances.length - 1] || 1;

  // 2) Berechne gewünschte Abstände (target distances) für jeden Output-Index
  const targetDistances = new Array(targetLen);
  for (let i = 0; i < targetLen; i++) targetDistances[i] = (i / (targetLen - 1)) * totalLength;

  // 3) Reserviere Slots für getaggte Originalpunkte
  const reserved = new Array(targetLen).fill(null); // reserved[i] = originalIndex oder null
  const used = new Array(targetLen).fill(false);

  // Für jeden Originalpunkt mit Tag -> bestimme gewünschten Slot
  for (let oi = 0; oi < points.length; oi++) {
    const p = points[oi];
    if (!p || !p.tag) continue;
    const d = distances[oi];
    let slot = Math.round((d / totalLength) * (targetLen - 1));
    // in range clampen
    slot = Math.max(0, Math.min(targetLen - 1, slot));

    // Falls belegt, suche den nächsten freien Slot (vorzugsweise nach außen suchen)
    if (!used[slot]) {
      reserved[slot] = oi;
      used[slot] = true;
    } else {
      // Suche nach nächstem freien Slot (links/rechts abwechselnd)
      let offset = 1;
      let placed = false;
      while (!placed) {
        const left = slot - offset;
        const right = slot + offset;
        if (left >= 0 && !used[left]) {
          reserved[left] = oi;
          used[left] = true;
          placed = true;
          break;
        }
        if (right < targetLen && !used[right]) {
          reserved[right] = oi;
          used[right] = true;
          placed = true;
          break;
        }
        offset++;
        if (left < 0 && right >= targetLen) {
          // Kein Platz (sehr unwahrscheinlich) -> abbruch
          placed = true;
          break;
        }
      }
    }
  }

  // 4) Erzeuge Output: für reservierte Slots kopiere exakt den Originalpunkt (inkl. Tag)
  const out = new Array(targetLen).fill(null);

  // Hilfsfunktion: kopiere Originalpunkt (inkl. evtl. z und andere Felder)
  const clonePoint = p => ({ ...p });

  for (let i = 0; i < targetLen; i++) {
    if (reserved[i] !== null) {
      out[i] = clonePoint(points[reserved[i]]);
      continue;
    }
    out[i] = null; // wird später gefüllt per Interpolation
  }

  // 5) Fülle die restlichen Slots per Interpolation entlang des Original-Polylines
  // Wir iterieren die Ziel-Distanzen und finden Segment j mit distances[j] <= s <= distances[j+1]
  let j = 0;
  for (let i = 0; i < targetLen; i++) {
    if (out[i]) continue; // bereits reserviert (tagged)
    const s = targetDistances[i];

    // advance j bis zum Segment passend
    while (j < distances.length - 2 && distances[j + 1] < s) j++;

    const i0 = j;
    const i1 = Math.min(points.length - 1, j + 1);
    const d0 = distances[i0];
    const d1 = distances[i1];

    const segLen = (d1 - d0) || 1;
    const f = (s - d0) / segLen;

    // Linear interpieren und keine Tags setzen
    const p0 = points[i0];
    const p1 = points[i1];

    const x = p0.x * (1 - f) + p1.x * f;
    const y = p0.y * (1 - f) + p1.y * f;

    // Erzeuge Objekt ohne Tag (null)
    out[i] = { x, y, tag: null };
  }

  return out;
};

function addPoint(arr, p, isLastSegment = false) {
  const last = arr[arr.length - 1];
  const eps = 1e-10;
  if (!last || Math.abs(last.x - p.x) >= eps || Math.abs(last.y - p.y) >= eps) {
    arr.push(p);
  } else {
    if (isLastSegment) {
      arr.push({
        x: p.x + 1,   // 1 mm nach vorne
        y: p.y - 5,   // 5 mm nach unten
        tag: p.tag || null
      });
    }
  }
}

/*function interpolateSegment(seg, n, skipLast = false) {
  if (seg.length <= 1) return [ { ...seg[0] } ];

  const out = [];
  const steps = skipLast ? n : n + 1;
  for (let i = 0; i < steps; i++) {
    const t = i / n;
    const idxF = t * (seg.length - 1);
    const idx0 = Math.floor(idxF);
    const idx1 = Math.ceil(idxF);
    const f = idxF - idx0;

    const tag =
      i === 0 ? seg[0].tag :
      (!skipLast && i === n) ? seg[seg.length - 1].tag :
      null;

    const x = seg[idx0].x * (1 - f) + seg[idx1].x * f;
    const y = seg[idx0].y * (1 - f) + seg[idx1].y * f;

    out.push({ x, y, tag });
  }
  return out;
}*/

function interpolateSegment(seg, n, skipLast = false) {
  if (!seg.length) return [];
  if (seg.length === 1) return [{ ...seg[0] }];

  n = Math.max(1, n); // n darf nie 0 sein

  const steps = skipLast ? n : n + 1;
  const out = [];

  for (let i = 0; i < steps; i++) {
    const t = i / n;
    const idxF = t * (seg.length - 1);
    const idx0 = Math.floor(idxF);
    const idx1 = Math.ceil(idxF);
    const f = idxF - idx0;

    const tag =
      i === 0 ? seg[0].tag :
      (!skipLast && i === n) ? seg[seg.length - 1].tag :
      null;

    const x = seg[idx0].x * (1 - f) + seg[idx1].x * f;
    const y = seg[idx0].y * (1 - f) + seg[idx1].y * f;

    out.push({ x, y, tag });
  }
  return out;
}

function removeUntaggedFromEnd(arr, count) {
  let removed = 0;
  while (removed < count && arr.length > 0) {
    let i = arr.length - 1;
    while (i >= 0 && arr[i].tag) i--;
    if (i < 0) break;
    arr.splice(i, 1);
    removed++;
  }
  return removed;
}

function padByDuplicatingEnd(arr, targetLength) {
  if (!arr.length) return;
  const last = arr[arr.length - 1];
  while (arr.length < targetLength) arr.push({ ...last });
}

// Neue Subfunktion proportional nach Segmentlängen
function computePointsPerSegment(innerPts, outerPts, tagIndices, totalPoints) {
  const segLengths = [];
  let prevTag = 0;

  for (let tagIdx of tagIndices) {
    const innerSeg = innerPts.slice(prevTag, tagIdx + 1);
    const outerSeg = outerPts.slice(prevTag, tagIdx + 1);

    function length(arr) {
      let L = 0;
      for (let i = 1; i < arr.length; i++) {
        const dx = arr[i].x - arr[i - 1].x;
        const dy = arr[i].y - arr[i - 1].y;
        L += Math.hypot(dx, dy);
      }
      return L;
    }

    const L_inner = length(innerSeg);
    const L_outer = length(outerSeg);
    const L_seg = Math.max(L_inner, L_outer); // max statt avg

    segLengths.push(L_seg);
    prevTag = tagIdx;
  }

  const totalLength = segLengths.reduce((a, b) => a + b, 0);

  let points = segLengths.map(L =>
    Math.max(1, Math.round((L / totalLength) * totalPoints)) // mindestens 1 Punkt
  );

  // Rundungsfehler ausgleichen
  let diff = totalPoints - points.reduce((a, b) => a + b, 0);
  points[points.length - 1] += diff; // Differenz aufs letzte Segment

  return points;
}

function movePoints(arr, taggedIndices) {
  if (arr.length <= 1) return;

  // 1. Länge des Segments berechnen
  const segLengths = [0];
  let totalLength = 0;
  for (let i = 1; i < arr.length; i++) {
    const dx = arr[i].x - arr[i - 1].x;
    const dy = arr[i].y - arr[i - 1].y;
    totalLength += Math.hypot(dx, dy);
    segLengths.push(totalLength);
  }

  // 2. Schrittweite für gleichmäßige Verteilung
  const step = totalLength / (arr.length - 1);
  let segIdx = 0;

  for (let i = 0; i < arr.length; i++) {
    const targetDist = i * step;

    // Vorwärts zum richtigen Segment
    while (segIdx < segLengths.length - 1 && segLengths[segIdx + 1] < targetDist) {
      segIdx++;
    }

    // Tagged Point nicht verschieben
    if (taggedIndices.includes(segIdx)) continue;

    // Interpolation zwischen segIdx und segIdx+1
    const t = (targetDist - segLengths[segIdx]) / (segLengths[segIdx + 1] - segLengths[segIdx]);
    arr[i] = {
      x: arr[segIdx].x + (arr[segIdx + 1].x - arr[segIdx].x) * t,
      y: arr[segIdx].y + (arr[segIdx + 1].y - arr[segIdx].y) * t
    };
  }
}

function redistributeSegment(points) {
  if (points.length <= 2) return points; // nichts zu tun

  // 1) kumulative Abstände
  const distances = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    distances.push(distances[i - 1] + Math.hypot(dx, dy));
  }
  const totalLength = distances[distances.length - 1];

  // 2) neue Positionen entlang der vorhandenen Punkte berechnen
  const targetDistances = distances.map((_, i) => (i / (points.length - 1)) * totalLength);

  // 3) Punkte proportional verschieben (linear)
  const newPoints = points.map((p, i) => {
    const t = targetDistances[i] / totalLength;
    const idxF = t * (points.length - 1);
    const idx0 = Math.floor(idxF);
    const idx1 = Math.min(Math.ceil(idxF), points.length - 1);
    const f = idxF - idx0;
    return {
      x: points[idx0].x * (1 - f) + points[idx1].x * f,
      y: points[idx0].y * (1 - f) + points[idx1].y * f,
      tag: points[i].tag || null
    };
  });

  return newPoints;
}

window.syncTaggedPointsNoDuplicates = function(innerPts, outerPts, totalTargetPoints = 300) {

  const innerTags = innerPts.map((p, i) => p.tag ? i : null).filter(v => v !== null);
  const outerTags = outerPts.map((p, i) => p.tag ? i : null).filter(v => v !== null);

  let allTagIndices = [...new Set([...innerTags, ...outerTags])];
  const maxIdx = Math.max(innerPts.length - 1, outerPts.length - 1);
  if (!allTagIndices.includes(maxIdx)) allTagIndices.push(maxIdx);
  allTagIndices.sort((a, b) => a - b);

  // Die Zielpunkte hier rein!
  const pointsPerSeg = computePointsPerSegment(innerPts, outerPts, allTagIndices, totalTargetPoints);

  const innerNew = [];
  const outerNew = [];
  let prevTag = 0;

  allTagIndices.forEach((tagIdx, segmentIdx) => {
    const innerSeg = innerPts.slice(prevTag, tagIdx + 1);
    const outerSeg = outerPts.slice(prevTag, tagIdx + 1);

    const startTag = innerSeg[0].tag || outerSeg[0].tag || null;
    const endTag = innerSeg[innerSeg.length - 1].tag || outerSeg[outerSeg.length - 1].tag || null;
    const nPoints = pointsPerSeg[segmentIdx];

    // ✅ Skip segments where start and end tags are identical
    if (startTag === endTag && innerSeg.length <= 1 && outerSeg.length <= 1) {
      //console.log(`Skipping zero-length segment ${segmentIdx}: startTag = ${startTag}`);
      prevTag = tagIdx;
      return; // alten Punkt einfach behalten
    }

    //console.log(`Segment ${segmentIdx}: startTag = ${startTag}, endTag = ${endTag}, points = ${nPoints}`);

    const isLast = segmentIdx === allTagIndices.length - 1;
    const n = nPoints - 1;

    const innerInterp = interpolateSegment(innerSeg, n, isLast);
    const outerInterp = interpolateSegment(outerSeg, n, isLast);

    innerInterp.forEach(p => {
      addPoint(innerNew, p);
      //addPoint(innerNew, p, isLast);
    });

    outerInterp.forEach(p => {
      addPoint(outerNew, p);
      //addPoint(outerNew, p, isLast);
    });

    if (isLast) {
      addPoint(innerNew, { ...innerPts[innerPts.length - 1], tag: 'END_POINT' });
      addPoint(outerNew, { ...outerPts[outerPts.length - 1], tag: 'END_POINT' });
    }

    prevTag = tagIdx;
  });

  if (innerNew.length !== outerNew.length) {
    const diff = Math.abs(innerNew.length - outerNew.length);
    if (innerNew.length > outerNew.length) {
      const removed = removeUntaggedFromEnd(innerNew, diff);
      if (removed < diff) padByDuplicatingEnd(outerNew, innerNew.length);
    } else {
      const removed = removeUntaggedFromEnd(outerNew, diff);
      if (removed < diff) padByDuplicatingEnd(innerNew, outerNew.length);
    }
  }

  const finalMin = Math.min(innerNew.length, outerNew.length);
  innerNew.length = finalMin;
  outerNew.length = finalMin;

  return { innerNew, outerNew };
};


