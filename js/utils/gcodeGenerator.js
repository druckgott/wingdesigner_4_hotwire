//const tcpOffset = {x:0, y:0.5, z:0}; // Draht 1mm -> y = 0.5
// js/utils/gcodeGenerator.js

window.generateG93HeaderComments = function({
  innerName,
  outerName,
  innerScale,
  outerScale,
  rotationInner,
  rotationOuter,
  thicknessScaleInner,
  thicknessScaleOuter,
  outerChordOffset,
  outerVerticalOffset,
  span,
  speed,
  hotWirePower,
  axisNames,
  axisXmm,
  axisYmm,
  foamLength,
  foamWidth,
  foamHeight,
  wireDiameter,
  kerfSide
} = {}) {
  const lines = [
    `; Wing root airfoil: ${innerName}, scale: ${innerScale}%, rotation: ${rotationInner}°, thickness scale: ${thicknessScaleInner}`,
    `; Wing tip airfoil: ${outerName}, scale: ${outerScale}%, rotation: ${rotationOuter}°, thickness scale: ${thicknessScaleOuter}`,
    `; Wing tip chord offset: ${outerChordOffset} mm, vertical offset: ${outerVerticalOffset} mm`,
    `; Wing span length: ${span} mm`,
    `; Foam block width: ${foamWidth} mm`,
    `; Foam block height: ${foamHeight} mm`,
    `; Foam block length: ${foamLength} mm`,
    `; Machine ${axisNames.X || 'X'}/${axisNames.Y || 'Y'} axis length: ${axisXmm} / ${axisYmm} mm`,
    `; Cutting speed: ${speed} mm/min`,
    `; Hot wire relay control: ${hotWirePower > 0 ? 'ON' : 'OFF'}`,
    `; Wire diameter: ${wireDiameter} mm`,
    `; Kerf side: ${kerfSide}`
  ];

  return lines.join('\n');
};

// === Header-Funktion für G93 ===
window.generateG93Header = function({ hotWirePower } = {}, axisNames = {}) {

  const Xname = axisNames.X || 'X';
  const Yname = axisNames.Y || 'Y';
  const Zname = axisNames.Z || 'Z';
  const Aname = axisNames.A || 'A';

  const lines = [
    'G17 ; XY-Ebene auswählen',
    'G21 ; Millimetermaßsystem',
    'G90 ; Absolute Positionierung',
    'G40 ; Cutter Compensation aus',
    'G49 ; Tool Length Offset abbrechen',
    'G64 ; Pfadsteuerung (Path Control Mode)',
    `${Xname}0.00 ${Yname}0.00 ${Aname}0.00 ${Zname}0.00 ; Zurück zur Maschinen-Null`
  ];

  if (hotWirePower > 0) {
    lines.push(`M3 S${hotWirePower} ; HotWire-Heizleistung On S.... `); // HotWire Heizen einschalten
  }

  return lines.join('\n');
};

// === Footer-Funktion für G93 ===
window.generateG93Footer = function(axisNames = {}) {
  const Xname = axisNames.X || 'X';
  const Yname = axisNames.Y || 'Y';
  const Zname = axisNames.Z || 'Z';
  const Aname = axisNames.A || 'A';

  const lines = [
    `G1 ${Xname}0.00 ${Yname}0.00 ${Aname}0.00 ${Zname}0.00 ; Zurück zur Maschinen-Null`,
    'M5 ; HotWire Heizen ausschalten',
    'G94 ; Normaler Feedrate-Modus wieder aktiv',
    'M2 ; Programm Ende'
  ];

  return lines.join('\n');
};

window.generateG93FourAxis = function(innerPoints, outerPoints, feed = 100, machineLimits = {}, axisNames = {}, tcpOffset = {x:0,y:0}, wireDiameter = 0, kerfSide = 'none' ) {
  if (!Array.isArray(innerPoints) || !Array.isArray(outerPoints)) return '';
  if (innerPoints.length !== outerPoints.length) throw new Error("Inner und Outer Points müssen gleiche Länge haben!");
  if (innerPoints.length < 2) return '';

  const Xname = axisNames.X || 'X';
  const Yname = axisNames.Y || 'Y';
  const Zname = axisNames.Z || 'Z';
  const Aname = axisNames.A || 'A';

  const inverseTimeUnits = 1.0;

  const Xmax = machineLimits.X > 0 ? machineLimits.X : 100;
  const Ymax = machineLimits.Y > 0 ? machineLimits.Y : 100;
  const Zmax = machineLimits.Z > 0 ? machineLimits.Z : 100;
  const Amax = machineLimits.A > 0 ? machineLimits.A : 100;
  const Fmax = machineLimits.Fmax > 0 ? machineLimits.Fmax : 1000;
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
      //console.warn(`Punkt X/Y auf Limits geclippt: X=${x}, Y=${y}`);
    }

    return { x, y, tag: p.tag };
  };

  const clipRotary = (z, a) => {
    let corrected = false;
    if (z < 0) { z = 0; corrected = true; }
    if (z > Zmax) { z = Zmax; corrected = true; }
    if (a < 0) { a = 0; corrected = true; }
    if (a > Amax) { a = Amax; corrected = true; }
    //if (corrected) console.warn(`Rotary auf Limits geclippt: Z=${z}, A=${a}`);
    return { z, a };
  };

  const getRadialDistance = (start, end) => Math.abs(end - start) * (Math.PI / 180);

  // =======================
  // Kerf Hilfsfunktionen
  // =======================
  const computeNormal = (p0, p1) => {
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const length = Math.sqrt(dx*dx + dy*dy);
    if (length === 0) return {x:0,y:0};
    return { x: -dy/length, y: dx/length }; // Normal nach links
  };

  const applyKerfOffset = (p, normal, side, wireDiameter) => {
    if (side === 'none') return { ...p };
    const offset = wireDiameter / 2;
    const factor = (side === 'outer') ? -1 : 1;
    return {
      x: p.x + normal.x * offset * factor,
      y: p.y + normal.y * offset * factor,
      tag: p.tag
    };
  };

  // =======================
  // G-Code Generierung
  // =======================
  const lines = [];
  lines.push('G93 ; Inverse Time Feedrate aktivieren');

  let lastF = feed;
  const maxDeltaF = 30;

  
  for (let i = 1; i < innerPoints.length; i++) {

        // raw Inputpunkte
    const rawIstart = innerPoints[i - 1];
    const rawIend   = innerPoints[i];
    const rawOstart = outerPoints[i - 1];
    const rawOend   = outerPoints[i];

    // Normalen berechnen
    const normalInner = computeNormal(rawIstart, rawIend);
    const normalOuter = computeNormal(rawOstart, rawOend);

        // Kerf anwenden
    const Istart = applyTCPAndLimits(applyKerfOffset(rawIstart, normalInner, kerfSide, wireDiameter));
    const Iend   = applyTCPAndLimits(applyKerfOffset(rawIend,   normalInner, kerfSide, wireDiameter));
    const Ostart = applyTCPAndLimits(applyKerfOffset(rawOstart, normalOuter, kerfSide, wireDiameter));
    const Oend   = applyTCPAndLimits(applyKerfOffset(rawOend,   normalOuter, kerfSide, wireDiameter));

    /*const Istart = applyTCPAndLimits(innerPoints[i - 1]);
    const Iend   = applyTCPAndLimits(innerPoints[i]);
    const Ostart = outerPoints[i - 1];
    const Oend   = outerPoints[i];*/

    // Korrektur: Z und A Werte richtig zuweisen
    let { z: Zstart, a: Astart } = clipRotary(Ostart.y, Ostart.x);
    let { z: Zend,   a: Aend }   = clipRotary(Oend.y,   Oend.x);

    const dx = Iend.x - Istart.x;
    const dy = Iend.y - Istart.y;
    const linearLength = Math.sqrt(dx*dx + dy*dy);

    const radialZ = getRadialDistance(Zstart, Zend);
    const radialA = getRadialDistance(Astart, Aend);

    const moveLength = Math.max(linearLength + radialZ + radialA, 0.001);

    let F = feed / moveLength / inverseTimeUnits;
    if (F > Fmax) F = Fmax;
    if (F < Fmin) F = Fmin;

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

    const line = `G1 ${Xname}${Iend.x.toFixed(3)} ${Yname}${Iend.y.toFixed(3)} ${Aname}${Aend.toFixed(3)} ${Zname}${Zend.toFixed(3)} F${F.toFixed(4)}${tagComment ? ' ; ' + tagComment : ''}`;
    lines.push(line);
  }

  lines.push('G94');
  return lines.join('\n');
};

window.parseAndExtractGcodePoints = function(gcodeText, hotwireLength = 10, debug = false) {
  const inner = [];
  const outer = [];

  const lines = gcodeText.split(/\r?\n/);

  for (const raw of lines) {
    if (!raw.startsWith("G1")) continue;

    let X = 0, Y = 0, Z = 0, A = 0;

    const matches = raw.matchAll(/([XYZA])([-+]?\d*\.?\d+)/ig);
    for (const m of matches) {
      const axis = m[1].toUpperCase();
      const value = parseFloat(m[2]);
      if (axis === 'X') X = value;
      else if (axis === 'Y') Y = value;
      else if (axis === 'Z') Z = value;
      else if (axis === 'A') A = value;
    }

    inner.push({ x: X, y: Y, z: -hotwireLength / 2 });
    outer.push({ x: A, y: Z, z: hotwireLength / 2 });
  }

  return { inner, outer };
};






