// js/components/TrimSection.jsx
window.TrimSection = function TrimSection(props) {
  // Babel-sichere Übersetzung
  var t = function(key) {
    if (window.i18n && typeof window.i18n._ === 'function') {
      return window.i18n._(key);
    }
    return key;
  };

  var trimEnabled = props.trimEnabled;
  var setTrimEnabled = props.setTrimEnabled;
  var trimLEmm = props.trimLEmm;
  var setTrimLEmm = props.setTrimLEmm;
  var trimTEmm = props.trimTEmm;
  var setTrimTEmm = props.setTrimTEmm;
  var isActive = props.isActive;
  var onToggle = props.onToggle;  
  var innerFrontDistance = props.innerFrontDistance;
  var setInnerFrontDistance = props.setInnerFrontDistance;
  var outerFrontDistance = props.outerFrontDistance;
  var setOuterFrontDistance = props.setOuterFrontDistance;
  var innerBackDistance = props.innerBackDistance;
  var setInnerBackDistance = props.setInnerBackDistance;
  var outerBackDistance = props.outerBackDistance;
  var setOuterBackDistance = props.setOuterBackDistance;

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
  var uniqueKey = 'trim-' + langVersion;

  return (
    <ProfileBox 
      title={t('trimSection')} 
      color="#000" 
      isActive={isActive} 
      onToggle={onToggle}
      key={uniqueKey}
    >
      <label>
        <input type="checkbox" checked={trimEnabled} onChange={e => setTrimEnabled(e.target.checked)} />
        {t('trimEnabled')}
      </label>

      <label>{t('trimLE')} [mm]
        <input type="number" min="0" step="0.1" value={trimLEmm} onChange={e => setTrimLEmm(Number(e.target.value))} disabled={!trimEnabled} />
        {/* Anzeige der Distanzen */}
        <div>
          <span>{t('leadingEdgeHeightInner')}: {innerFrontDistance.toFixed(2)} mm</span> &nbsp;|&nbsp;
          <span>{t('leadingEdgeHeightOuter')}: {outerFrontDistance.toFixed(2)} mm</span>
        </div>
        <input type="range" min="0" max="20" step="0.1" value={trimLEmm} onChange={e => setTrimLEmm(Number(e.target.value))} disabled={!trimEnabled} />
      </label>

      <label>{t('trimTE')} [mm]
        <input type="number" min="0" step="0.1" value={trimTEmm} onChange={e => setTrimTEmm(Number(e.target.value))} disabled={!trimEnabled} />
        {/* Anzeige der Distanzen */}
        <div>
          <span>{t('trailingEdgeHeightInner')}: {innerBackDistance.toFixed(2)} mm</span> &nbsp;|&nbsp;
          <span>{t('trailingEdgeHeightOuter')}: {outerBackDistance.toFixed(2)} mm</span>
        </div>
        <input type="range" min="0" max="20" step="0.1" value={trimTEmm} onChange={e => setTrimTEmm(Number(e.target.value))} disabled={!trimEnabled} />
      </label>
    </ProfileBox>
  );
};
