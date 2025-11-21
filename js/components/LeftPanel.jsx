// js/components/LeftPanel.jsx
window.LeftPanel = function LeftPanel(props) {
  // SICHERE Übersetzung – Babel im Browser liebt das!
  var t = function(key) {
    if (window.i18n && typeof window.i18n._ === 'function') {
      return window.i18n._(key);
    }
    return key;
  };

  // Aktuelle Sprache erkennen
  var currentLang = 'en';
  if (window.i18n && window.i18n.lang === window.langDE) {
    currentLang = 'de';
  }

  // Nur Buchstaben für Achsennamen
  var letterOnly = function(v) {
    return v.replace(/[^A-Za-z]/g, '').toUpperCase();
  };

  // Alle Props – exakt wie bei dir!
  var cameraPosRef = props.cameraPosRef;
  var cameraTargetRef = props.cameraTargetRef;
  var innerDAT = props.innerDAT;
  var setInnerDAT = props.setInnerDAT;
  var outerDAT = props.outerDAT;
  var setOuterDAT = props.setOuterDAT;
  var innerName = props.innerName;
  var setInnerName = props.setInnerName;
  var outerName = props.outerName;
  var setOuterName = props.setOuterName;
  var handleFile = props.handleFile;
  var span = props.span;
  var setSpan = props.setSpan;
  var profilePointsCount = props.profilePointsCount;
  var setProfilePointsCount = props.setProfilePointsCount;
  var innerColor = props.innerColor;
  var setInnerColor = props.setInnerColor;
  var innerScale = props.innerScale;
  var setInnerScale = props.setInnerScale;
  var thicknessScaleInner = props.thicknessScaleInner;
  var setThicknessScaleInner = props.setThicknessScaleInner;
  var rotationInner = props.rotationInner;
  var setRotationInner = props.setRotationInner;
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
  var holes = props.holes;
  var setHoles = props.setHoles;
  var ailerons = props.ailerons;
  var setAilerons = props.setAilerons;
  var trimEnabled = props.trimEnabled;
  var setTrimEnabled = props.setTrimEnabled;
  var trimLEmm = props.trimLEmm;
  var setTrimLEmm = props.setTrimLEmm;
  var trimTEmm = props.trimTEmm;
  var setTrimTEmm = props.setTrimTEmm;
  var activeTab = props.activeTab;
  var setActiveTab = props.setActiveTab;
  var debugOpen = props.debugOpen;
  var setDebugOpen = props.setDebugOpen;
  var debugPoints = props.debugPoints;
  var gcode = props.gcode;
  var gcodeOpen = props.gcodeOpen;
  var setGcodeOpen = props.setGcodeOpen;
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
  var foamActive = props.foamActive;
  var setFoamActive = props.setFoamActive;
  var foamLength = props.foamLength;
  var setFoamLength = props.setFoamLength;
  var foamWidth = props.foamWidth;
  var setFoamWidth = props.setFoamWidth;
  var foamHeight = props.foamHeight;
  var setFoamHeight = props.setFoamHeight;
  var foamOffset = props.foamOffset;
  var setFoamOffset = props.setFoamOffset;
  var surfaceVisible = props.surfaceVisible;
  var setSurfaceVisible = props.setSurfaceVisible;
  var gridVisible = props.gridVisible;
  var setGridVisible = props.setGridVisible;
  var hotwirePoint = props.hotwirePoint;
  var setHotwirePoint = props.setHotwirePoint;
  var mirrorWing = props.mirrorWing;
  var setMirrorWing = props.setMirrorWing;
  var mirrorGap = props.mirrorGap;
  var setMirrorGap = props.setMirrorGap;
  var machineEntryExit = props.machineEntryExit;
  var setMachineEntryExit = props.setMachineEntryExit;
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
  var exportImportIsOpen = props.exportImportIsOpen;
  var toggleExportImport = props.toggleExportImport;
  var simulateCut = props.simulateCut;
  var setSimulateCut = props.setSimulateCut;
  var speedMultiplier = props.speedMultiplier;
  var setSpeedMultiplier = props.setSpeedMultiplier;
  var tailLengthSimu = props.tailLengthSimu;
  var setTailLengthSimu = props.setTailLengthSimu;
  var trailLengthMax = props.trailLengthMax;
  var innerFrontDistance = props.innerFrontDistance;
  var setInnerFrontDistance = props.setInnerFrontDistance;
  var outerFrontDistance = props.outerFrontDistance;
  var setOuterFrontDistance = props.setOuterFrontDistance;
  var innerBackDistance = props.innerBackDistance;
  var setInnerBackDistance = props.setInnerBackDistance;
  var outerBackDistance = props.outerBackDistance;
  var setOuterBackDistance = props.setOuterBackDistance;

  return (
    <div style={{ flex: '0 0 500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* SPRACHWAHL – OBEN! */}
      <label>
        {t('language')}:
        <select value={currentLang} onChange={function(e) {
          window.i18n.setLang(e.target.value);
        }}>
          <option value="de">Deutsch</option>
          <option value="en">English</option>
        </select>
      </label>

      <div style={{ fontSize: 12, background: '#f7f7f7', padding: 8, border: '1px solid #ccc' }}>
        <b>{t('camera')}:</b> {cameraPosRef.current.x.toFixed(1)}, {cameraPosRef.current.y.toFixed(1)}, {cameraPosRef.current.z.toFixed(1)}<br/>
        <b>{t('target')}:</b> {cameraTargetRef.current.x.toFixed(1)}, {cameraTargetRef.current.y.toFixed(1)}, {cameraTargetRef.current.z.toFixed(1)}
      </div>

      <label>{t('innerDAT')} <input type="file" accept=".dat" onChange={function(e) { handleFile(e, setInnerDAT, setInnerName); }} /> {innerName}</label>
      <label>{t('outerDAT')} <input type="file" accept=".dat" onChange={function(e) { handleFile(e, setOuterDAT, setOuterName); }} /> {outerName}</label>

      <label>{t('span')} (mm)
        <input type="range" min="10" max="3000" value={span} onChange={function(e) { setSpan(Number(e.target.value)); }} />
        <input type="number" value={span} onChange={function(e) { setSpan(Number(e.target.value)); }} />
      </label>

      <label>
        {t('pointsPerProfile')}
        <input type="number" value={profilePointsCount} min="10" max="1000" onChange={function(e) { setProfilePointsCount(Number(e.target.value)); }} />
        <input type="range" min="10" max="1000" step="1" value={profilePointsCount} onChange={function(e) { setProfilePointsCount(Number(e.target.value)); }} />
      </label>

      <label>
        <input type="checkbox" checked={surfaceVisible} onChange={function(e) { setSurfaceVisible(e.target.checked); }} />
        {t('showSurface')}
      </label>

      <label>
        <input type="checkbox" checked={gridVisible} onChange={function(e) { setGridVisible(e.target.checked); }} />
        {t('showGrid')}
      </label>

      <label>
        <input type="checkbox" checked={hotwirePoint} onChange={function(e) { 
          var val = e.target.checked; 
          setHotwirePoint(val); 
          if (!val) { 
            setMirrorWing(false); 
            setMachineEntryExit(false); 
          } 
        }} />
        {t('wireEntryExit')}
      </label>

      <label style={{ opacity: hotwirePoint ? 1 : 0.5 }}>
        <input type="checkbox" checked={mirrorWing} onChange={function(e) { 
          if (hotwirePoint) setMirrorWing(e.target.checked); 
        }} disabled={!hotwirePoint} />
        {t('mirrorWing')}
      </label>

      <label style={{ opacity: hotwirePoint ? 1 : 0.5 }}>
        {t('mirrorGapText')}
        <input type="number" value={mirrorGap} onChange={function(e) { setMirrorGap(Number(e.target.value)); }} disabled={!hotwirePoint} />
        <input type="range" min="1" max="10" step="0.1" value={mirrorGap} onChange={function(e) { setMirrorGap(Number(e.target.value)); }} disabled={!hotwirePoint} />
      </label>

      <label style={{ opacity: hotwirePoint ? 1 : 0.5 }}>
        <input type="checkbox" checked={machineEntryExit} onChange={function(e) { 
          if (hotwirePoint) setMachineEntryExit(e.target.checked); 
        }} disabled={!hotwirePoint} />
        {t('machineEntryExit')}
      </label>

      <ProfileBox title={t('innerProfile')} color={innerColor} isActive={activeTab === 'inner'} onToggle={function() { 
        setActiveTab(activeTab === 'inner' ? null : 'inner');
      }}>
        <label>{t('color')} <input type="color" value={innerColor} onChange={function(e) { setInnerColor(e.target.value); }} /></label>
        <label>{t('length')} (mm)
          <input type="number" value={innerScale} onChange={function(e) { setInnerScale(Number(e.target.value)); }} />
          <input type="range" min="10" max="1000" value={innerScale} onChange={function(e) { setInnerScale(Number(e.target.value)); }} />
        </label>
        <label>{t('thickness')}
          <input type="number" step="0.01" min="0.5" max="1.5" value={thicknessScaleInner} onChange={function(e) { setThicknessScaleInner(Number(e.target.value)); }} />
								   
          <input type="range" min="0.5" max="1.5" step="0.01" value={thicknessScaleInner} onChange={function(e) { setThicknessScaleInner(Number(e.target.value)); }} />
        </label>
        <label>{t('rotation')} (°)
          <input type="number" step="0.01" min="-25" max="25" value={rotationInner * 180 / Math.PI} onChange={function(e) { setRotationInner(Number(e.target.value) * Math.PI / 180); }} />
          <input type="range" min="-25" max="25" value={rotationInner * 180 / Math.PI} onChange={function(e) { setRotationInner(Number(e.target.value) * Math.PI / 180); }} />
        </label>
      </ProfileBox>

      <ProfileBox title={t('outerProfile')} color={outerColor} isActive={activeTab === 'outer'} onToggle={function() { 
        setActiveTab(activeTab === 'outer' ? null : 'outer');
      }}>
        <label>{t('color')} <input type="color" value={outerColor} onChange={function(e) { setOuterColor(e.target.value); }} /></label>
        <label>{t('length')} (mm)
          <input type="number" value={outerScale} onChange={function(e) { setOuterScale(Number(e.target.value)); }} />
          <input type="range" min="10" max="1000" value={outerScale} onChange={function(e) { setOuterScale(Number(e.target.value)); }} />
								   
																																																  
        </label>
        <label>{t('thickness')}
          <input type="number" step="0.01" min="0.5" max="1.5" value={thicknessScaleOuter} onChange={function(e) { setThicknessScaleOuter(Number(e.target.value)); }} />
          <input type="range" min="0.5" max="1.5" step="0.01" value={thicknessScaleOuter} onChange={function(e) { setThicknessScaleOuter(Number(e.target.value)); }} />
        </label>
        <label>{t('rotation_outer')} (°)
          <input type="number" step="0.01" min="-25" max="25" value={rotationOuter * 180 / Math.PI} onChange={function(e) { setRotationOuter(Number(e.target.value) * Math.PI / 180); }} />
          <input type="range" min="-25" max="25" value={rotationOuter * 180 / Math.PI} onChange={function(e) { setRotationOuter(Number(e.target.value) * Math.PI / 180); }} />
        </label>
        <label>{t('vertical')} (mm)
          <input type="number" value={outerVerticalOffset} onChange={function(e) { setOuterVerticalOffset(Number(e.target.value)); }} />
          <input type="range" min="-500" max="500" value={outerVerticalOffset} onChange={function(e) { setOuterVerticalOffset(Number(e.target.value)); }} />
        </label>
        <label>{t('chord')} (mm)
          <input type="number" value={outerChordOffset} onChange={function(e) { setOuterChordOffset(Number(e.target.value)); }} />
          <input type="range" min="-1000" max="1000" value={outerChordOffset} onChange={function(e) { setOuterChordOffset(Number(e.target.value)); }} />
        </label>
      </ProfileBox>

      <HolesSection holes={holes} setHoles={setHoles} isActive={activeTab === 'holes'} onToggle={function() { 
        setActiveTab(activeTab === 'holes' ? null : 'holes');
      }} />

      <AileronsSection ailerons={ailerons} setAilerons={setAilerons} isActive={activeTab === 'ailerons'} onToggle={function() { 
        setActiveTab(activeTab === 'ailerons' ? null : 'ailerons');
      }} />

      <TrimSection
        trimEnabled={trimEnabled} setTrimEnabled={setTrimEnabled}
        trimLEmm={trimLEmm} setTrimLEmm={setTrimLEmm}
        trimTEmm={trimTEmm} setTrimTEmm={setTrimTEmm}
        innerFrontDistance={innerFrontDistance} setInnerFrontDistance={setInnerFrontDistance}
        outerFrontDistance={outerFrontDistance} setOuterFrontDistance={setOuterFrontDistance}
        innerBackDistance={innerBackDistance} setInnerBackDistance={setInnerBackDistance}
        outerBackDistance={outerBackDistance} setOuterBackDistance={setOuterBackDistance}
        isActive={activeTab === 'trim'} onToggle={function() { 
          setActiveTab(activeTab === 'trim' ? null : 'trim');
        }}
      />

      <div className="profile-box">
        <div className="profile-header" onClick={function() { 
          setActiveTab(activeTab === 'machine' ? null : 'machine');
        }}>{t('machineData')}</div>
        {activeTab === 'machine' && (
          <div className="profile-content">
            <label>X {t('left')}: <input maxLength={1} value={xName} onChange={function(e) { setXName(letterOnly(e.target.value)); }} /></label>
            <label>Y {t('left')}: <input maxLength={1} value={yName} onChange={function(e) { setYName(letterOnly(e.target.value)); }} /></label>
            <label>X {t('right')}: <input maxLength={1} value={aName} onChange={function(e) { setAName(letterOnly(e.target.value)); }} /></label>
            <label>Y {t('right')}: <input maxLength={1} value={zName} onChange={function(e) { setZName(letterOnly(e.target.value)); }} /></label>
            <label>{t('axisLengthX')} (mm): <input type="number" value={axisXmm} onChange={function(e) { setAxisXmm(Number(e.target.value)); }} /></label>
            <label>{t('axisLengthY')} (mm): <input type="number" value={axisYmm} onChange={function(e) { setAxisYmm(Number(e.target.value)); }} /></label>
            <label>{t('hotwireLength')} (mm): <input type="number" value={hotwireLength} onChange={function(e) { setHotwireLength(Number(e.target.value)); }} /></label>
            <label>{t('targetFeedrate')} (mm/min): <input type="number" value={speed} onChange={function(e) { setSpeed(Number(e.target.value)); }} /></label>
            <label>{t('maxFeedrate')} (mm/min): <input type="number" value={fMax} min={fMin} onChange={function(e) { setFMax(Number(e.target.value)); }} /></label>
            <label>{t('minFeedrate')} (mm/min): <input type="number" value={fMin} max={fMax} onChange={function(e) { setFMin(Number(e.target.value)); }} /></label>
            <label>{t('hotwirePower')}: <input type="number" value={hotWirePower} min={0} onChange={function(e) { setHotWirePower(Number(e.target.value)); }} /></label>
            <label>{t('wireDiameter')} (mm): <input type="number" step="0.01" value={wireDiameter} onChange={function(e) { setWireDiameter(Number(e.target.value)); }} /></label>
            <label>{t('kerfSide')}:
              <select value={kerfSide} onChange={function(e) { setKerfSide(e.target.value); }}>
                <option value="none">{t('none') || 'None'}</option>
                <option value="outer">{t('outer') || 'Outer'}</option>
              </select>
            </label>
          </div>
        )}
      </div>

      <div className="profile-box">
        <div className="profile-header" onClick={function() { 
          setActiveTab(activeTab === 'foam' ? null : 'foam');
        }}>{t('foamBlock')}</div>
        {activeTab === 'foam' && (
          <div className="profile-content">
            <label>
              <input type="checkbox" checked={foamActive} onChange={(e) => setFoamActive(e.target.checked)} />{t('showFoam')}
            </label>
            <label>{t('length_foam')} (mm): <input type="number" value={foamLength} onChange={function(e) { setFoamLength(Number(e.target.value)); }} /></label>
            <label>{t('width_foam')} (mm): <input type="number" value={foamWidth} onChange={function(e) { setFoamWidth(Number(e.target.value)); }} /></label>
            <label>{t('height_foam')} (mm): <input type="number" value={foamHeight} onChange={function(e) { setFoamHeight(Number(e.target.value)); }} /></label>
            <label>{t('offset_foam')} (mm): <input type="number" value={foamOffset} onChange={function(e) { setFoamOffset(Number(e.target.value)); }} /></label>
            <input type="range" min={(hotwireLength-foamWidth)/-2} max={(hotwireLength-foamWidth)/2} step="1" value={foamOffset} onChange={function(e) { setFoamOffset(Number(e.target.value)); }} />
            <span >[Min: {(hotwireLength - foamWidth) / -2} | Max: {(hotwireLength - foamWidth) / 2}]</span>
          </div>
        )}
      </div>

      <GCodeSection
        gcode={gcode}
        title={t('gcode')}
        isOpen={gcodeOpen}
        onToggle={function() { setGcodeOpen(!gcodeOpen); }}
        fileName="wing_program.nc"
        simulateCut={simulateCut} setSimulateCut={setSimulateCut}
        speedMultiplier={speedMultiplier} setSpeedMultiplier={setSpeedMultiplier}
        activeTab={activeTab} setActiveTab={setActiveTab}
        tailLengthSimu={tailLengthSimu} setTailLengthSimu={setTailLengthSimu}
        trailLengthMax={trailLengthMax}
      />

      <ExportImportSection
        innerDAT={innerDAT} setInnerDAT={setInnerDAT}
        outerDAT={outerDAT} setOuterDAT={setOuterDAT}
        xName={xName} setXName={setXName}
        yName={yName} setYName={setYName}
        zName={zName} setZName={setZName}
        aName={aName} setAName={setAName}
        axisXmm={axisXmm} setAxisXmm={setAxisXmm}
        axisYmm={axisYmm} setAxisYmm={setAxisYmm}
        hotwireLength={hotwireLength} setHotwireLength={setHotwireLength}
        speed={speed} setSpeed={setSpeed}
        fMax={fMax} setFMax={setFMax}
        fMin={fMin} setFMin={setFMin}
        hotWirePower={hotWirePower} setHotWirePower={setHotWirePower}
        wireDiameter={wireDiameter} setWireDiameter={setWireDiameter}
        kerfSide={kerfSide} setKerfSide={setKerfSide}
        innerName={innerName} setInnerName={setInnerName}
        innerColor={innerColor} setInnerColor={setInnerColor}
        innerScale={innerScale} setInnerScale={setInnerScale}
        thicknessScaleInner={thicknessScaleInner} setThicknessScaleInner={setThicknessScaleInner}
        rotationInner={rotationInner} setRotationInner={setRotationInner}
        outerName={outerName} setOuterName={setOuterName}
        outerColor={outerColor} setOuterColor={setOuterColor}
        outerScale={outerScale} setOuterScale={setOuterScale}
        thicknessScaleOuter={thicknessScaleOuter} setThicknessScaleOuter={setThicknessScaleOuter}
        rotationOuter={rotationOuter} setRotationOuter={setRotationOuter}
        outerVerticalOffset={outerVerticalOffset} setOuterVerticalOffset={setOuterVerticalOffset}
        outerChordOffset={outerChordOffset} setOuterChordOffset={setOuterChordOffset}
        span={span} setSpan={setSpan}
        trimEnabled={trimEnabled} setTrimEnabled={setTrimEnabled}
        trimLEmm={trimLEmm} setTrimLEmm={setTrimLEmm}
        trimTEmm={trimTEmm} setTrimTEmm={setTrimTEmm}
        foamLength={foamLength} setFoamLength={setFoamLength}
        foamWidth={foamWidth} setFoamWidth={setFoamWidth}
        foamHeight={foamHeight} setFoamHeight={setFoamHeight}
        foamOffset={foamOffset} setFoamOffset={setFoamOffset}
        holes={holes} setHoles={setHoles}
        ailerons={ailerons} setAilerons={setAilerons}
        isOpen={exportImportIsOpen} onToggle={toggleExportImport}
        mirrorWing={mirrorWing} setMirrorWing={setMirrorWing}
      />

      <DebugSection debugPoints={debugPoints} innerName={innerName} outerName={outerName} isOpen={debugOpen} onToggle={function() { 
        setDebugOpen(!debugOpen);
      }} />

    </div>
  );
};