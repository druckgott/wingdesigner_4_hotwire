// js/components/GCodeSection.jsx
window.GCodeSection = function GCodeSection(props) {
  // Babel-sichere Übersetzung
  var t = function(key) {
    if (window.i18n && typeof window.i18n._ === 'function') {
      return window.i18n._(key);
    }
    return key;
  };

  var gcode = props.gcode;
  var title = props.title || t('gcodeSection');
  var isOpen = props.isOpen;
  var onToggle = props.onToggle;
  var fileName = props.fileName || "program.nc";
  var simulateCut = props.simulateCut;
  var setSimulateCut = props.setSimulateCut;
  var speedMultiplier = props.speedMultiplier;
  var setSpeedMultiplier = props.setSpeedMultiplier;
  var activeTab = props.activeTab;
  var setActiveTab = props.setActiveTab;
  var tailLengthSimu = props.tailLengthSimu;
  var setTailLengthSimu = props.setTailLengthSimu;
  var trailLengthMax = props.trailLengthMax;

  // WICHTIG: Reagiere auf Sprachwechsel!
  var langVersion = props.langVersion || 0;
  var forceUpdate = React.useReducer(function(x) { return x + 1; }, 0)[1];

  React.useEffect(function() {
    var handler = function() {
      forceUpdate(); // zwingt komplettes Re-Render
    };
    window.addEventListener('i18n-change', handler);
    return function() {
      window.removeEventListener('i18n-change', handler);
    };
  }, []);

  // Key mit Sprache → zwingt React, alles neu zu bauen
  var uniqueKey = 'gcode-' + langVersion;

  const [running, setRunning] = React.useState(false);

  var saveFile = function() {
    var blob = new Blob([gcode], { type: "text/plain;charset=utf-8" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  //simulation
  const toggleRunning = () => {
    setRunning(r => !r);
    if (setSimulateCut) {
      setSimulateCut(prev => !prev); // Simulation starten/stoppen
    }
  };

  return <ProfileBox title={title} color="#000" isActive={isOpen} onToggle={onToggle} key={uniqueKey}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button onClick={saveFile}>{t('save')}</button>
    </div>

    {(activeTab === 'foam' || activeTab === 'machine') && (
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={toggleRunning}>{running ? t('stop') || "Stop" : t('start') || "Start"}</button>
        </div>
        <div className="profile-content">
          <label>{t('speedMultiplier')} (-) {speedMultiplier.toFixed(2)}x</label>
          <input type="range" min="0.01" max="5" step="0.01" value={speedMultiplier} onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))} />
        </div>
        {/*<div className="profile-content">
          <label>{t('tailLength')} </label>
          <input type="range" min="1" max={trailLengthMax} step="1" value={tailLengthSimu} onChange={(e) => setTailLengthSimu(parseInt(e.target.value))}/>
          <span>{tailLengthSimu}</span> {trailLengthMax}
        </div> */}
      </div>
    )}

    <div style={{display:'flex', gap:16, fontSize:12, fontFamily:'monospace', whiteSpace:'pre', overflow:'auto', maxHeight:200}}>
      <div>{gcode}</div>
    </div>
</ProfileBox>;

};
