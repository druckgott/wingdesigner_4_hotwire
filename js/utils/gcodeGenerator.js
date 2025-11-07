// js/utils/gcodeGenerator.js

//const tcpOffset = {x:0, y:0.5, z:0}; // Draht 1mm -> y = 0.5
/*window.generateG93FourAxis = function(innerPoints, outerPoints, feed = 100, machineLimits = {}, tcpOffset = {x:0,y:0}) {
  if (!Array.isArray(innerPoints) || !Array.isArray(outerPoints)) return '';
  if (innerPoints.length !== outerPoints.length) throw new Error("Inner und Outer Points müssen gleiche Länge haben!");
  if (innerPoints.length < 2) return '';

  const Xname = window.xName || 'X';
  const Yname = window.yName || 'Y';
  const Uname = window.uName || 'U';
  const Aname = window.aName || 'A';

  const inverseTimeUnits = 1.0;

  const Xmax = machineLimits.X > 0 ? machineLimits.X : 100;
  const Ymax = machineLimits.Y > 0 ? machineLimits.Y : 100;
  const Umax = machineLimits.U > 0 ? machineLimits.U : 100;
  const Amax = machineLimits.A > 0 ? machineLimits.A : 100;
  const Fmax = machineLimits.Fmax > 0 ? machineLimits.Fmax : 5000;
  const Fmin = machineLimits.Fmin > 0 ? machineLimits.Fmin : 1;

  // TCP-Offset nur auf innerPoints X/Y anwenden
  const applyTCPAndLimits = (p) => {
    let x = p.x + (tcpOffset.x || 0);
    let y = p.y + (tcpOffset.y || 0);

    // Verhältnis X/Y bestimmen
    let scaleX = 1, scaleY = 1;
    if (x < 0) scaleX = 0 / x;
    if (x > Xmax) scaleX = Xmax / x;
    if (y < 0) scaleY = 0 / y;
    if (y > Ymax) scaleY = Ymax / y;

    const scale = Math.min(scaleX, scaleY, 1); // die kritischere Achse bestimmt die Skalierung
    if (scale !== 1) {
      x *= scale;
      y *= scale;
      console.warn(`Punkt X/Y auf Limits geclippt: X=${x}, Y=${y}`);
    }

    return { x, y, tag: p.tag };
  };

  const clipRotary = (u, a) => {
    let corrected = false;
    if (u < 0) { u = 0; corrected = true; }
    if (u > Umax) { u = Umax; corrected = true; }
    if (a < 0) { a = 0; corrected = true; }
    if (a > Amax) { a = Amax; corrected = true; }
    if (corrected) console.warn(`Rotary auf Limits geclippt: U=${u}, A=${a}`);
    return { u, a };
  };

  const getRadialDistance = (start, end) => Math.abs(end - start) * (Math.PI / 180);

  const lines = [];
  lines.push('G90');
  lines.push('G93');

  for (let i = 1; i < innerPoints.length; i++) {
    const Istart = applyTCPAndLimits(innerPoints[i - 1]);
    const Iend   = applyTCPAndLimits(innerPoints[i]);
    const Ostart = outerPoints[i - 1];
    const Oend   = outerPoints[i];

    let { u: Ustart, a: Astart } = clipRotary(Ostart.x, Ostart.y);
    let { u: Uend,   a: Aend }   = clipRotary(Oend.x,   Oend.y);

    // Lineare Distanz X/Y
    const dx = Iend.x - Istart.x;
    const dy = Iend.y - Istart.y;
    const linearLength = Math.sqrt(dx*dx + dy*dy);

    // Rotatorische Distanz
    const radialU = getRadialDistance(Ustart, Uend);
    const radialA = getRadialDistance(Astart, Aend);

    const moveLength = Math.max(linearLength + radialU + radialA, 0.001);

    let F = feed / moveLength / inverseTimeUnits;
    if (F > Fmax) { console.warn(`Feedrate auf Fmax geclippt: ${F} → ${Fmax}`); F = Fmax; }
    if (F < Fmin) { console.warn(`Feedrate auf Fmin geclippt: ${F} → ${Fmin}`); F = Fmin; }

    const tagComment = [
      Istart.tag ? `Istart=${Istart.tag}` : '',
      Iend.tag   ? `Iend=${Iend.tag}`     : '',
      Ostart.tag ? `Ostart=${Ostart.tag}` : '',
      Oend.tag   ? `Oend=${Oend.tag}`     : ''
    ].filter(Boolean).join(' ; ');

    const line = `G1 ${Xname}${Iend.x.toFixed(3)} ${Yname}${Iend.y.toFixed(3)} ${Uname}${Uend.toFixed(3)} ${Aname}${Aend.toFixed(3)} F${F.toFixed(4)}${tagComment ? ' ; ' + tagComment : ''}`;
    lines.push(line);
  }

  lines.push('G94');
  return lines.join('\n');
};*/

// js/utils/gcodeGenerator.js

window.generateG93FourAxis = function(innerPoints, outerPoints, feed = 100, machineLimits = {}, tcpOffset = {x:0,y:0}) {
  if (!Array.isArray(innerPoints) || !Array.isArray(outerPoints)) return '';
  if (innerPoints.length !== outerPoints.length) throw new Error("Inner und Outer Points müssen gleiche Länge haben!");
  if (innerPoints.length < 2) return '';

  const Xname = window.xName || 'X';
  const Yname = window.yName || 'Y';
  const Uname = window.uName || 'U';
  const Aname = window.aName || 'A';

  const inverseTimeUnits = 1.0;

  const Xmax = machineLimits.X > 0 ? machineLimits.X : 100;
  const Ymax = machineLimits.Y > 0 ? machineLimits.Y : 100;
  const Umax = machineLimits.U > 0 ? machineLimits.U : 100;
  const Amax = machineLimits.A > 0 ? machineLimits.A : 100;
  const Fmax = machineLimits.Fmax > 0 ? machineLimits.Fmax : 5000;
  const Fmin = machineLimits.Fmin > 0 ? machineLimits.Fmin : 1;

  const applyTCPAndLimits = (p) => {
    let x = p.x + (tcpOffset.x || 0);
    let y = p.y + (tcpOffset.y || 0);

    let scaleX = 1, scaleY = 1;
    if (x < 0) scaleX = 0 / x;
    if (x > Xmax) scaleX = Xmax / x;
    if (y < 0) scaleY = 0 / y;
    if (y > Ymax) scaleY = Ymax / y;

    const scale = Math.min(scaleX, scaleY, 1);
    if (scale !== 1) {
      x *= scale;
      y *= scale;
      console.warn(`Punkt X/Y auf Limits geclippt: X=${x}, Y=${y}`);
    }

    return { x, y, tag: p.tag };
  };

  const clipRotary = (u, a) => {
    let corrected = false;
    if (u < 0) { u = 0; corrected = true; }
    if (u > Umax) { u = Umax; corrected = true; }
    if (a < 0) { a = 0; corrected = true; }
    if (a > Amax) { a = Amax; corrected = true; }
    if (corrected) console.warn(`Rotary auf Limits geclippt: U=${u}, A=${a}`);
    return { u, a };
  };

  const getRadialDistance = (start, end) => Math.abs(end - start) * (Math.PI / 180);

  const lines = [];
  lines.push('G90');
  lines.push('G93');

  let lastF = feed;          // letzte Feedrate
  const maxDeltaF = 30;      // max Änderung pro Schritt

  for (let i = 1; i < innerPoints.length; i++) {
    const Istart = applyTCPAndLimits(innerPoints[i - 1]);
    const Iend   = applyTCPAndLimits(innerPoints[i]);
    const Ostart = outerPoints[i - 1];
    const Oend   = outerPoints[i];

    let { u: Ustart, a: Astart } = clipRotary(Ostart.x, Ostart.y);
    let { u: Uend,   a: Aend }   = clipRotary(Oend.x,   Oend.y);

    const dx = Iend.x - Istart.x;
    const dy = Iend.y - Istart.y;
    const linearLength = Math.sqrt(dx*dx + dy*dy);

    const radialU = getRadialDistance(Ustart, Uend);
    const radialA = getRadialDistance(Astart, Aend);

    const moveLength = Math.max(linearLength + radialU + radialA, 0.001);

    let F = feed / moveLength / inverseTimeUnits;

    // Clip auf max/min
    if (F > Fmax) F = Fmax;
    if (F < Fmin) F = Fmin;

    // Smooth: delta begrenzen
    const deltaF = F - lastF;
    if (deltaF > maxDeltaF) F = lastF + maxDeltaF;
    if (deltaF < -maxDeltaF) F = lastF - maxDeltaF;

    lastF = F;

    const tagComment = [
      Istart.tag ? `Istart=${Istart.tag}` : '',
      Iend.tag   ? `Iend=${Iend.tag}`     : '',
      Ostart.tag ? `Ostart=${Ostart.tag}` : '',
      Oend.tag   ? `Oend=${Oend.tag}`     : ''
    ].filter(Boolean).join(' ; ');

    const line = `G1 ${Xname}${Iend.x.toFixed(3)} ${Yname}${Iend.y.toFixed(3)} ${Uname}${Uend.toFixed(3)} ${Aname}${Aend.toFixed(3)} F${F.toFixed(4)}${tagComment ? ' ; ' + tagComment : ''}`;
    lines.push(line);
  }

  lines.push('G94');
  return lines.join('\n');
};
