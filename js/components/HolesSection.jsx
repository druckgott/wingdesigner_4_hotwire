const HolesSection = ({ holes, setHoles, isActive, onToggle }) => {
  return (
    <ProfileBox title="Holes" color="#000" isActive={isActive} onToggle={onToggle}>
      {holes.map((h, i) => (
        <div key={i} style={{ border: '1px solid #ccc', marginBottom: 6, padding: 4 }}>
          <label>Durchmesser (mm)
            <input type="number" value={h.diameter} onChange={e => {
              const newHoles = [...holes];
              newHoles[i].diameter = Number(e.target.value);
              setHoles(newHoles);
            }} />
          </label>
          <label>Punkteanzahl
            <input type="number" min="3" value={h.nPoints} onChange={e => {
              const newHoles = [...holes];
              newHoles[i].nPoints = Number(e.target.value);
              setHoles(newHoles);
            }} />
          </label>
          <label>Horizontal (%)
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
          <label>Vertikal (%)
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
          <button onClick={() => setHoles(holes.filter((_, idx) => idx !== i))}>Löschen</button>
        </div>
      ))}
      <button onClick={() => setHoles([...holes, { diameter: 5, xPercent: 0.5, yPercent: 0.5, nPoints: 30 }])}>
        Neues Loch
      </button>
    </ProfileBox>
  );
};