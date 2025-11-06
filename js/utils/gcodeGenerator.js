// js/utils/gcodeGenerator.js
window.generateG93FourAxis = function(leftPoints, rightPoints, machineLimits = {}) {
  if (!Array.isArray(leftPoints) || !Array.isArray(rightPoints)) return '';
  if (leftPoints.length !== rightPoints.length) {
    throw new Error("Left und Right Points müssen gleiche Länge haben!");
  }
  if (leftPoints.length < 2) return ''; // mindestens 2 Punkte für Bewegung nötig

  // Default Limits
  const Xmax = machineLimits.X > 0 ? machineLimits.X : 100;
  const Ymax = machineLimits.Y > 0 ? machineLimits.Y : 100;
  const Umax = machineLimits.U > 0 ? machineLimits.U : 100;
  const Amax = machineLimits.A > 0 ? machineLimits.A : 100;

  // Achsennamen global verfügbar oder Default
  const Xname = window.xName || 'X';
  const Yname = window.yName || 'Y';
  const Uname = window.uName || 'U';
  const Aname = window.aName || 'A';

  const lines = [];
  lines.push('G90'); // Absolut
  lines.push('G93'); // Inverse-Time Mode

  for (let i = 1; i < leftPoints.length; i++) {
    const Lstart = leftPoints[i - 1];
    const Lend = leftPoints[i];
    const Rstart = rightPoints[i - 1];
    const Rend = rightPoints[i];

    // Berechne Zeiten pro Achse
    const tX = Xmax ? Math.abs(Lend.x - Lstart.x) / Xmax : 0;
    const tY = Ymax ? Math.abs(Lend.y - Lstart.y) / Ymax : 0;
    const tU = Umax ? Math.abs(Rend.x - Rstart.x) / Umax : 0;
    const tA = Amax ? Math.abs(Rend.y - Rstart.y) / Amax : 0;

    const T = Math.max(tX, tY, tU, tA, 0.001); // mindestens kleine Zeit
    const F = 1 / T;

    // G93 G1 Zeile für alle 4 Achsen
    const line = `G1 ${Xname}${Lend.x.toFixed(3)} ${Yname}${Lend.y.toFixed(3)} ${Uname}${Rend.x.toFixed(3)} ${Aname}${Rend.y.toFixed(3)} F${F.toFixed(4)}`;
    lines.push(line);
  }

  lines.push('G94'); // zurück auf normales Feedrate
  return lines.join('\n');
};
