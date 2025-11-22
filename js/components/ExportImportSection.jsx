// js/components/ExportImportSection.jsx
window.ExportImportSection = function ExportImportSection(props) {
  // Babel-sichere Übersetzung
  var t = function(key) {
    if (window.i18n && typeof window.i18n._ === 'function') {
      return window.i18n._(key);
    }
    return key;
  };

  // Alle Props einzeln holen (wegen Babel!)
  var version = props.version;
  var innerDAT = props.innerDAT;
  var setInnerDAT = props.setInnerDAT;
  var outerDAT = props.outerDAT;
  var setOuterDAT = props.setOuterDAT;
  var xName = props.xName;
  var setXName = props.setXName;
  var yName = props.yName;
  var setYName = props.setYName;
  var zName = props.zName;
  var setZName = props.setZName;
  var aName = props.aName;
  var setAName = props.setAName;
  var axisXmm = props.axisXmm;
  var setAxisXmm = props.setAxisXmm;
  var axisYmm = props.axisYmm;
  var setAxisYmm = props.setAxisYmm;
  var hotwireLength = props.hotwireLength;
  var setHotwireLength = props.setHotwireLength;
  var speed = props.speed;
  var setSpeed = props.setSpeed;
  var fMax = props.fMax;
  var setFMax = props.setFMax;
  var fMin = props.fMin;
  var setFMin = props.setFMin;
  var hotWirePower = props.hotWirePower;
  var setHotWirePower = props.setHotWirePower;
  var wireDiameter = props.wireDiameter;
  var setWireDiameter = props.setWireDiameter;
  var kerfSide = props.kerfSide;
  var setKerfSide = props.setKerfSide;
  var innerName = props.innerName;
  var setInnerName = props.setInnerName;
  var innerColor = props.innerColor;
  var setInnerColor = props.setInnerColor;
  var innerScale = props.innerScale;
  var setInnerScale = props.setInnerScale;
  var thicknessScaleInner = props.thicknessScaleInner;
  var setThicknessScaleInner = props.setThicknessScaleInner;
  var rotationInner = props.rotationInner;
  var setRotationInner = props.setRotationInner;
  var outerName = props.outerName;
  var setOuterName = props.setOuterName;
  var outerColor = props.outerColor;
  var setOuterColor = props.setOuterColor;
  var outerScale = props.outerScale;
  var setOuterScale = props.setOuterScale;
  var thicknessScaleOuter = props.thicknessScaleOuter;
  var setThicknessScaleOuter = props.setThicknessScaleOuter;
  var rotationOuter = props.rotationOuter;
  var setRotationOuter = props.setRotationOuter;
  var outerVerticalOffset = props.outerVerticalOffset;
  var setOuterVerticalOffset = props.setOuterVerticalOffset;
  var outerChordOffset = props.outerChordOffset;
  var setOuterChordOffset = props.setOuterChordOffset;
  var span = props.span;
  var setSpan = props.setSpan;
  var trimEnabled = props.trimEnabled;
  var setTrimEnabled = props.setTrimEnabled;
  var trimLEmm = props.trimLEmm;
  var setTrimLEmm = props.setTrimLEmm;
  var trimTEmm = props.trimTEmm;
  var setTrimTEmm = props.setTrimTEmm;
  var foamLength = props.foamLength;
  var setFoamLength = props.setFoamLength;
  var foamWidth = props.foamWidth;
  var setFoamWidth = props.setFoamWidth;
  var foamHeight = props.foamHeight;
  var setFoamHeight = props.setFoamHeight;
  var holes = props.holes;
  var setHoles = props.setHoles;
  var ailerons = props.ailerons;
  var setAilerons = props.setAilerons;
  var isOpen = props.isOpen;
  var onToggle = props.onToggle;
  var mirrorWing = props.mirrorWing;
  var setMirrorWing = props.setMirrorWing;

  // JSON Download Funktion
  var downloadJSON = function(data, filename) {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export-Funktionen
  var exportAll = function() {
    var data = {
      machine: { version: version, xName: xName, yName: yName, zName: zName, aName: aName, axisXmm: axisXmm, axisYmm: axisYmm, hotwireLength: hotwireLength, speed: speed, fMax: fMax, fMin: fMin, hotWirePower: hotWirePower, wireDiameter: wireDiameter, kerfSide: kerfSide },
      wing: { version: version, innerName: innerName, innerColor: innerColor, innerScale: innerScale, thicknessScaleInner: thicknessScaleInner, rotationInner: rotationInner, outerName: outerName, outerColor: outerColor, outerScale: outerScale, thicknessScaleOuter: thicknessScaleOuter, rotationOuter: rotationOuter, outerVerticalOffset: outerVerticalOffset, outerChordOffset: outerChordOffset, span: span, trimEnabled: trimEnabled, trimLEmm: trimLEmm, trimTEmm: trimTEmm, holes: holes, ailerons: ailerons, mirrorWing: mirrorWing },
      profil: { version: version, innerDAT: innerDAT, outerDAT: outerDAT },
      foam: { version: version, foamLength: foamLength, foamWidth: foamWidth, foamHeight: foamHeight }
    };
    downloadJSON(data, 'wing_project.json');
  };

  var exportMachineFoam = function() {
    var data = {
      machine: { version: version, xName: xName, yName: yName, zName: zName, aName: aName, axisXmm: axisXmm, axisYmm: axisYmm, hotwireLength: hotwireLength, speed: speed, fMax: fMax, fMin: fMin, hotWirePower: hotWirePower, wireDiameter: wireDiameter, kerfSide: kerfSide },
      foam: { version: version, foamLength: foamLength, foamWidth: foamWidth, foamHeight: foamHeight }
    };
    downloadJSON(data, 'machine_foam.json');
  };

  var exportProfile = function() {
    var data = {
      wing: { version: version, innerName: innerName, innerColor: innerColor, innerScale: innerScale, thicknessScaleInner: thicknessScaleInner, rotationInner: rotationInner,
              outerName: outerName, outerColor: outerColor, outerScale: outerScale, thicknessScaleOuter: thicknessScaleOuter, rotationOuter: rotationOuter,
              outerVerticalOffset: outerVerticalOffset, outerChordOffset: outerChordOffset,
              span: span, trimEnabled: trimEnabled, trimLEmm: trimLEmm, trimTEmm: trimTEmm,
              holes: holes, ailerons: ailerons, mirrorWing: mirrorWing },
      profil: { version: version, innerDAT: innerDAT, outerDAT: outerDAT }
    };
    downloadJSON(data, 'profile_data.json');
  };

  // Import-Funktion
  var importData = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function() {
      try {
        var data = JSON.parse(reader.result);

        if (data.machine) {
          setXName(data.machine.xName || '');
          setYName(data.machine.yName || '');
          setZName(data.machine.zName || '');
          setAName(data.machine.aName || '');
          setAxisXmm(data.machine.axisXmm || 0);
          setAxisYmm(data.machine.axisYmm || 0);
          setHotwireLength(data.machine.hotwireLength || 0);
          setSpeed(data.machine.speed || 0);
          setFMax(data.machine.fMax || 0);
          setFMin(data.machine.fMin || 0);
          setHotWirePower(data.machine.hotWirePower || 0);
          setWireDiameter(data.machine.wireDiameter || 0);
          setKerfSide(data.machine.kerfSide || 'none');
        }
        if (data.wing) {
          setInnerName(data.wing.innerName || '');
          setInnerColor(data.wing.innerColor || '#ff0000');
          setInnerScale(data.wing.innerScale || 100);
          setThicknessScaleInner(data.wing.thicknessScaleInner || 1);
          setRotationInner(data.wing.rotationInner || 0);
          setOuterName(data.wing.outerName || '');
          setOuterColor(data.wing.outerColor || '#00ff00');
          setOuterScale(data.wing.outerScale || 100);
          setThicknessScaleOuter(data.wing.thicknessScaleOuter || 1);
          setRotationOuter(data.wing.rotationOuter || 0);
          setOuterVerticalOffset(data.wing.outerVerticalOffset || 0);
          setOuterChordOffset(data.wing.outerChordOffset || 0);
          setSpan(data.wing.span || 1000);
          setTrimEnabled(data.wing.trimEnabled || false);
          setTrimLEmm(data.wing.trimLEmm || 0);
          setTrimTEmm(data.wing.trimTEmm || 0);
          setHoles(data.wing.holes || []);
          setAilerons(data.wing.ailerons || []);
          setMirrorWing(data.wing.mirrorWing || false)
        }
        if (data.profil) {
          setInnerDAT(data.profil.innerDAT || null);
          setOuterDAT(data.profil.outerDAT || null);
        }
        if (data.foam) {
          setFoamLength(data.foam.foamLength || 1000);
          setFoamWidth(data.foam.foamWidth || 300);
          setFoamHeight(data.foam.foamHeight || 100);
        }
        alert(t('importSuccess') || 'Import abgeschlossen!');
      } catch (err) {
        alert(t('importError') || 'Ungültige JSON-Datei');
      }
    };
    reader.readAsText(file);
  };

  return (
    <ProfileBox title={t('exportImport')} color="#3366cc" isActive={isOpen} onToggle={onToggle}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={exportAll}>{t('exportAll')}</button>
        <button onClick={exportMachineFoam}>{t('exportMachineFoam')}</button>
        <button onClick={exportProfile}>{t('exportProfile')}</button>
        <label>
          {t('importJSON')}:
          <input type="file" accept=".json" onChange={importData} style={{ marginLeft: 8 }} />
        </label>
      </div>
    </ProfileBox>
  );
};