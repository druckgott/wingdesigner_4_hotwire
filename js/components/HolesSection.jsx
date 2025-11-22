// js/components/HolesSection.jsx
window.HolesSection = function HolesSection(props) {
  // Babel-sichere Übersetzung
  var t = function(key) {
    if (window.i18n && typeof window.i18n._ === 'function') {
      return window.i18n._(key);
    }
    return key;
  };

  var holes = props.holes;
  var setHoles = props.setHoles;
  var isActive = props.isActive;
  var onToggle = props.onToggle;

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
  var uniqueKey = 'holes-' + langVersion + '-' + holes.length;

  
  return (
    <ProfileBox title={t('holesSection')} color="#000" isActive={isActive} onToggle={onToggle}>
      {holes.map((h, i) => (
        <div key={i} style={{ border: '1px solid #ccc', marginBottom: 6, padding: 4 }}>
          <label>{t('diameter')} (mm)
            <input type="number" value={h.diameter} onChange={e => {
              const newHoles = [...holes];
              newHoles[i].diameter = Number(e.target.value);
              setHoles(newHoles);
            }} />
          </label>
          <label>{t('pointsCount')}
            <input type="number" min="3" value={h.nPoints} onChange={e => {
              const newHoles = [...holes];
              newHoles[i].nPoints = Number(e.target.value);
              setHoles(newHoles);
            }} />
          </label>
          <label>{t('horizontal')} (%)
            <input type="range" min="0" max="1" step="0.01" value={h.xPercent} onChange={e => {
              const newHoles = [...holes];
              newHoles[i].xPercent = parseFloat(e.target.value);
              setHoles(newHoles);
            }} />
            <input type="number" min="0" max="1" step="0.01" value={h.xPercent} onChange={e => {
              const newHoles = [...holes];
              newHoles[i].xPercent = parseFloat(e.target.value);
              setHoles(newHoles);
            }} />
          </label>
          <label>{t('vertical')} (%)
            <input type="range" min="0" max="1" step="0.01" value={h.yPercent} onChange={e => {
              const newHoles = [...holes];
              newHoles[i].yPercent = parseFloat(e.target.value);
              setHoles(newHoles);
            }} />
            <input type="number" min="0" max="1" step="0.01" value={h.yPercent} onChange={e => {
              const newHoles = [...holes];
              newHoles[i].yPercent = parseFloat(e.target.value);
              setHoles(newHoles);
            }} />
          </label>
          {/* Neu: HoleShapeFlag Dropdown */}
          <label>{t('shape')}
            <select value={h.HoleShapeFlag} onChange={e => {
              const newHoles = [...holes];
              newHoles[i].HoleShapeFlag = Number(e.target.value);
              setHoles(newHoles);
            }}>
              <option value={0}>{t('round')}</option>
              <option value={1}>{t('rectangle')}</option>
              <option value={2}>{t('triangle')}</option>
              <option value={3}>{t('hexagon')}</option>
            </select>
          </label>

          {/* HoleRotation Slider */}
          <label>{t('rotation')} (°)
            <input type="range" min="0" max="360" step="1" value={h.HoleRotation} onChange={e => {
              const newHoles = [...holes];
              newHoles[i].HoleRotation = parseFloat(e.target.value);
              setHoles(newHoles);
            }} />
          </label>

          <button onClick={() => setHoles(holes.filter((_, idx) => idx !== i))}>
            {t('delete')}
          </button>
        </div>
      ))}
      <button onClick={() => setHoles([...holes, { diameter: 5, xPercent: 0.5, yPercent: 0.5, nPoints: 30 }])}>
        {t('addHole')}
      </button>
    </ProfileBox>
  );
};