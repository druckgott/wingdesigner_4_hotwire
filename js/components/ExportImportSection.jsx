const ExportImportSection = ({ 
  innerDAT, outerDAT, setInnerDAT, setOuterDAT,  
  xName, setXName, yName, setYName, zName, setZName, aName, setAName,
  axisXmm, setAxisXmm, axisYmm, setAxisYmm,
  hotwireLength, setHotwireLength, speed, setSpeed, fMax, setFMax, fMin, setFMin, hotWirePower, setHotWirePower,
  innerName, setInnerName, innerColor, setInnerColor, innerScale, setInnerScale, thicknessScaleInner, setThicknessScaleInner, rotationInner, setRotationInner,
  outerName, setOuterName, outerColor, setOuterColor, outerScale, setOuterScale, thicknessScaleOuter, setThicknessScaleOuter, rotationOuter, setRotationOuter,
  outerVerticalOffset, setOuterVerticalOffset, outerChordOffset, setOuterChordOffset,
  span, setSpan, trimEnabled, setTrimEnabled, trimLEmm, setTrimLEmm, trimTEmm, setTrimTEmm,
  foamLength, setFoamLength, foamWidth, setFoamWidth, foamHeight, setFoamHeight,
  holes, setHoles, ailerons, setAilerons,
  isOpen, onToggle
}) => {

  const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAll = () => {
    const data = {
      machine: { xName, yName, zName, aName, axisXmm, axisYmm, hotwireLength, speed, fMax, fMin, hotWirePower },
      wing: { innerName, innerColor, innerScale, thicknessScaleInner, rotationInner, outerName, outerColor, outerScale, thicknessScaleOuter, rotationOuter, outerVerticalOffset, outerChordOffset, span, trimEnabled, trimLEmm, trimTEmm, holes, ailerons },
      profil: { innerDAT, outerDAT },
      foam: { foamLength, foamWidth, foamHeight }
    };
    downloadJSON(data, 'wing_project.json');
  };

  const exportMachineFoam = () => {
    const data = {
      machine: { xName, yName, zName, aName, axisXmm, axisYmm, hotwireLength, speed, fMax, fMin, hotWirePower },
      foam: { foamLength, foamWidth, foamHeight }
    };
    downloadJSON(data, 'machine_foam.json');
  };

  const exportProfile = () => {
    const data = {
      wing: { innerName, innerColor, innerScale, thicknessScaleInner, rotationInner,
      outerName, outerColor, outerScale, thicknessScaleOuter, rotationOuter,
      outerVerticalOffset, outerChordOffset,
      span, trimEnabled, trimLEmm, trimTEmm,
      holes, ailerons },
      profil: { innerDAT, outerDAT },
    };
    downloadJSON(data, 'profile_data.json');
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.machine) {
          setXName(data.machine.xName);
          setYName(data.machine.yName);
          setZName(data.machine.zName);
          setAName(data.machine.aName);
          setAxisXmm(data.machine.axisXmm);
          setAxisYmm(data.machine.axisYmm);
          setHotwireLength(data.machine.hotwireLength);
          setSpeed(data.machine.speed);
          setFMax(data.machine.fMax);
          setFMin(data.machine.fMin);
          setHotWirePower(data.machine.hotWirePower);
        }
        if (data.wing) {
          setInnerName(data.wing.innerName);
          setInnerColor(data.wing.innerColor);
          setInnerScale(data.wing.innerScale);
          setThicknessScaleInner(data.wing.thicknessScaleInner);
          setRotationInner(data.wing.rotationInner);

          setOuterName(data.wing.outerName);
          setOuterColor(data.wing.outerColor);
          setOuterScale(data.wing.outerScale);
          setThicknessScaleOuter(data.wing.thicknessScaleOuter);
          setRotationOuter(data.wing.rotationOuter);
          setOuterVerticalOffset(data.wing.outerVerticalOffset);
          setOuterChordOffset(data.wing.outerChordOffset);

          setSpan(data.wing.span);
          setTrimEnabled(data.wing.trimEnabled);
          setTrimLEmm(data.wing.trimLEmm);
          setTrimTEmm(data.wing.trimTEmm);
          setHoles(data.wing.holes || []);
          setAilerons(data.wing.ailerons || []);
        }
        if (data.profil) {
             setInnerDAT(data.profil.innerDAT);
             setOuterDAT(data.profil.outerDAT);
        }
        if (data.foam) {
          setFoamLength(data.foam.foamLength);
          setFoamWidth(data.foam.foamWidth);
          setFoamHeight(data.foam.foamHeight);
        }

        alert('Import abgeschlossen!\n');

      } catch (e) {
        alert('Ungültige JSON-Datei');
      }
    };
    reader.readAsText(file);
  };

  return (
    <ProfileBox title="Export / Import" color="#000" isActive={isOpen} onToggle={onToggle}>
      <button onClick={exportAll}>Export JSON</button>
      <button onClick={exportMachineFoam}>Maschine + Foam exportieren</button>
      <button onClick={exportProfile}>Profiildaten exportieren</button>
      <input type="file" accept=".json" onChange={importData} />
    </ProfileBox>
  );
};
