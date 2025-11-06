// js/components/LeftPanel.jsx

// Wir legen die Komponente global an:
window.LeftPanel = function LeftPanel(props) {
  const { 
    cameraPosRef, cameraTargetRef,
    innerDAT, outerDAT, innerName, outerName, handleFile,
    span, setSpan, profilePointsCount, setProfilePointsCount,
    innerColor, setInnerColor, innerScale, setInnerScale, thicknessScaleInner, setThicknessScaleInner, rotationInner, setRotationInner,
    outerColor, setOuterColor, outerScale, setOuterScale, thicknessScaleOuter, setThicknessScaleOuter, rotationOuter, setRotationOuter,
    outerVerticalOffset, setOuterVerticalOffset, outerChordOffset, setOuterChordOffset,
    holes, setHoles, ailerons, setAilerons, trimEnabled, setTrimEnabled, trimLEmm, setTrimLEmm, trimTEmm, setTrimTEmm,
    activeTab, setActiveTab, debugOpen, setDebugOpen, debugPoints,
    //Maschine
    isActive, onToggle,
    xName, setXName,
    yName, setYName,
    uName, setUName,
    aName, setAName,
    axisXmm, setAxisXmm,
    axisYmm, setAxisYmm,
    hotwireLength, setHotwireLength,
    speed, setSpeed,
    //Foamblock:
    foamLength, setFoamLength,
    foamWidth, setFoamWidth,
    foamHeight, setFoamHeight,
    foamOffset, setFoamOffset,
    foamActive, setFoamActive,
    //Surface
    surfaceVisible, setSurfaceVisible,
    //spiegeln und Ausfahrpunkte
    hotwirePoint, setHotwirePoint,
    mirrorWing, setMirrorWing,
    mirrorGap, setMirrorGap,
    machineEntryExit, setMachineEntryExit
  } = props;

  const letterOnly = (v) => v.replace(/[^A-Za-z]/g, '').toUpperCase();

  return (
    <div style={{ flex: '0 0 500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 12, background: '#f7f7f7', padding: 8, border: '1px solid #ccc' }}>
        <b>Kamera:</b> {cameraPosRef.current.x.toFixed(1)}, {cameraPosRef.current.y.toFixed(1)}, {cameraPosRef.current.z.toFixed(1)}<br/>
        <b>Ziel:</b> {cameraTargetRef.current.x.toFixed(1)}, {cameraTargetRef.current.y.toFixed(1)}, {cameraTargetRef.current.z.toFixed(1)}
      </div>

      <label>Inner DAT <input type="file" accept=".dat" onChange={e => handleFile(e, props.setInnerDAT, props.setInnerName)} /> {innerName}</label>
      <label>Outer DAT <input type="file" accept=".dat" onChange={e => handleFile(e, props.setOuterDAT, props.setOuterName)} /> {outerName}</label>

      <label>Spannweite (mm)
        <input type="range" min="10" max="3000" value={span} onChange={e => setSpan(Number(e.target.value))} />
        <input type="number" value={span} onChange={e => setSpan(Number(e.target.value))} />
      </label>

      <label>
        Anzahl Punkte pro Profil
        <input type="number" value={profilePointsCount} min="10" max="1000" onChange={e => setProfilePointsCount(Number(e.target.value))} />
        <input type="range" min="10" max="1000" step="1" value={profilePointsCount} onChange={e => setProfilePointsCount(Number(e.target.value))} />
      </label>

      <label>
        <input type="checkbox" checked={surfaceVisible} onChange={e => setSurfaceVisible(e.target.checked)} />
        Surface anzeigen
      </label>

      <label>
        <input type="checkbox" checked={hotwirePoint} onChange={e => { const val = e.target.checked; setHotwirePoint(val); if (!val) { setMirrorWing(false); setMachineEntryExit(false); } }} /> 
        Hotwire Ein-/Ausfahrpunkt erzeugen
      </label>

      <label style={{ opacity: hotwirePoint ? 1 : 0.5 }}>
        <input type="checkbox" checked={mirrorWing} onChange={e => { if (hotwirePoint) setMirrorWing(e.target.checked); if (!e.target.checked) setMachineEntryExit(false); }} disabled={!hotwirePoint} /> 
        Tragfläche spiegeln
      </label>

      <label style={{ opacity: mirrorWing && hotwirePoint ? 1 : 0.5 }}>Abstand Ober-/Unterfläche (mm) 
        <input type="number" value={mirrorGap} onChange={e => setMirrorGap(Number(e.target.value))} disabled={!mirrorWing || !hotwirePoint} /> 
        <input type="range" min="1" max="10" step="0.1" value={mirrorGap} onChange={e => setMirrorGap(Number(e.target.value))} disabled={!mirrorWing || !hotwirePoint} />
      </label>

      <label style={{ opacity: mirrorWing && hotwirePoint ? 1 : 0.5 }}>
        <input type="checkbox" checked={machineEntryExit} onChange={e => { if (mirrorWing && hotwirePoint) setMachineEntryExit(e.target.checked); }} disabled={!mirrorWing || !hotwirePoint} /> 
        Maschine ein-/ausfahren
      </label>
  
      <ProfileBox title="Inner Profil" color={innerColor} isActive={activeTab === 'inner'} onToggle={() => setActiveTab(activeTab === 'inner' ? null : 'inner')}>
        <label>Farbe <input type="color" value={innerColor} onChange={e => setInnerColor(e.target.value)} /></label>

        <label>Länge (mm)
          <input type="number" value={innerScale} onChange={e => setInnerScale(Number(e.target.value))} />
          <input type="range" min="10" max="1000" value={innerScale} onChange={e => setInnerScale(Number(e.target.value))} />
        </label>

        <label>Dicke
          <input type="number" step="0.01" min="0.5" max="1.5" value={thicknessScaleInner} onChange={e => setThicknessScaleInner(Number(e.target.value))} />
          <input type="range" min="0.5" max="1.5" step="0.01" value={thicknessScaleInner} onChange={e => setThicknessScaleInner(Number(e.target.value))} />
        </label>

        <label>Rotation (°)
          <input type="number" step="1" min="-25" max="25" value={rotationInner * 180 / Math.PI} onChange={e => setRotationInner(Number(e.target.value) * Math.PI / 180)} />
          <input type="range" min="-25" max="25" value={rotationInner * 180 / Math.PI} onChange={e => setRotationInner(e.target.value * Math.PI / 180)} />
        </label>
      </ProfileBox>

      <ProfileBox title="Outer Profil" color={outerColor} isActive={activeTab === 'outer'} onToggle={() => setActiveTab(activeTab === 'outer' ? null : 'outer')}>
        <label>Farbe <input type="color" value={outerColor} onChange={e => setOuterColor(e.target.value)} /></label>

        <label>Länge (mm)
          <input type="number" value={outerScale} onChange={e => setOuterScale(Number(e.target.value))} />
          <input type="range" min="10" max="1000" value={outerScale} onChange={e => setOuterScale(Number(e.target.value))} />
        </label>

        <label>Dicke
          <input type="number" step="0.01" min="0.5" max="1.5" value={thicknessScaleOuter} onChange={e => setThicknessScaleOuter(Number(e.target.value))} />
          <input type="range" min="0.5" max="1.5" step="0.01" value={thicknessScaleOuter} onChange={e => setThicknessScaleOuter(Number(e.target.value))} />
        </label>

        <label>Rotation (°)
          <input type="number" step="1" min="-25" max="25" value={rotationOuter * 180 / Math.PI} onChange={e => setRotationOuter(Number(e.target.value) * Math.PI / 180)} />
          <input type="range" min="-25" max="25" value={rotationOuter * 180 / Math.PI} onChange={e => setRotationOuter(e.target.value * Math.PI / 180)} />
        </label>

        <label>Vertikal (mm)
          <input type="number" value={outerVerticalOffset} onChange={e => setOuterVerticalOffset(Number(e.target.value))} />
          <input type="range" min="-500" max="500" value={outerVerticalOffset} onChange={e => setOuterVerticalOffset(Number(e.target.value))} />
        </label>

        <label>Chord (mm)
          <input type="number" value={outerChordOffset} onChange={e => setOuterChordOffset(Number(e.target.value))} />
          <input type="range" min="-1000" max="1000" value={outerChordOffset} onChange={e => setOuterChordOffset(Number(e.target.value))} />
        </label>
      </ProfileBox>

      <HolesSection holes={holes} setHoles={setHoles} isActive={activeTab === 'holes'} onToggle={() => setActiveTab(activeTab === 'holes' ? null : 'holes')} />
      <AileronsSection ailerons={ailerons} setAilerons={setAilerons} isActive={activeTab === 'ailerons'} onToggle={() => setActiveTab(activeTab === 'ailerons' ? null : 'ailerons')} />
      <TrimSection
        trimEnabled={trimEnabled} setTrimEnabled={setTrimEnabled}
        trimLEmm={trimLEmm} setTrimLEmm={setTrimLEmm}
        trimTEmm={trimTEmm} setTrimTEmm={setTrimTEmm}
        isActive={activeTab === 'trim'} onToggle={() => setActiveTab(activeTab === 'trim' ? null : 'trim')}
      />

      <div className="profile-box">
          <div className="profile-header" onClick={() => setActiveTab(activeTab === 'machine' ? null : 'machine')}>Maschinendaten</div>
        {activeTab === 'machine' && (
          <div className="profile-content">
            <label>X links:
              <input maxLength={1} value={xName} onChange={e => setXName(letterOnly(e.target.value))} />
            </label>

            <label>Y links:
              <input maxLength={1} value={yName} onChange={e => setYName(letterOnly(e.target.value))} />
            </label>

            <label>X rechts:
              <input maxLength={1} value={uName} onChange={e => setUName(letterOnly(e.target.value))} />
            </label>

            <label>Y rechts:
              <input maxLength={1} value={aName} onChange={e => setAName(letterOnly(e.target.value))} />
            </label>

            <label>Achslänge X (mm):
              <input type="number" value={axisXmm} onChange={e => setAxisXmm(Number(e.target.value))} />
            </label>

            <label>Achslänge Y (mm):
              <input type="number" value={axisYmm} onChange={e => setAxisYmm(Number(e.target.value))} />
            </label>

            <label>Hotwire-Länge (mm):
              <input type="number" value={hotwireLength} onChange={e => setHotwireLength(Number(e.target.value))} />
            </label>

            <label>Schneidgeschwindigkeit (mm/min):
              <input type="number" value={speed} onChange={e => setSpeed(Number(e.target.value))} />
            </label>
          </div>
        )}
      </div>

      <div className="profile-box">
      <div className="profile-header" onClick={() => setActiveTab(activeTab === 'foam' ? null : 'foam')}>Foam Block</div>
      {activeTab === 'foam' && (
        <div className="profile-content">
          <label>Länge (mm):
            <input type="number" value={foamLength} onChange={e => setFoamLength(Number(e.target.value))} />
          </label>

          <label>Breite (mm):
            <input type="number" value={foamWidth} onChange={e => setFoamWidth(Number(e.target.value))} />
          </label>

          <label>Höhe (mm):
            <input type="number" value={foamHeight} onChange={e => setFoamHeight(Number(e.target.value))} />
          </label>

          <label>Offset (mm):
            <input type="number" value={foamOffset} onChange={e => setFoamOffset(Number(e.target.value))} />
          </label>
        </div>
      )}
    </div>


      <DebugSection debugPoints={debugPoints} innerName={innerName} outerName={outerName} isOpen={debugOpen} onToggle={() => setDebugOpen(!debugOpen)} />
    </div>
  );
};
