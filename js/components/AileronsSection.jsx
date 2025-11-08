const AileronsSection = ({ ailerons, setAilerons, isActive, onToggle }) => {
  return (
    <ProfileBox title="Aileron Cut" color="#000" isActive={isActive} onToggle={onToggle}>
      {ailerons.map((a, idx) => (
        <div key={idx} style={{ border: '1px solid #aaa', marginBottom: 6, padding: 4 }}>
          <label>Restdicke oben (mm)
            <input type="number" min="0" step="0.1" value={a.thicknessTop} onChange={e => {
              const newAilerons = [...ailerons];
              newAilerons[idx].thicknessTop = Number(e.target.value);
              setAilerons(newAilerons);
            }} />
          </label>
          <label>Position von hinten (%)
            <input type="range" min="0" max="1" step="0.01" value={a.xPercent} onChange={e => {
              const newAilerons = [...ailerons];
              newAilerons[idx].xPercent = parseFloat(e.target.value);
              setAilerons(newAilerons);
            }} />
            <input type="number" min="0" max="1" step="0.01" value={a.xPercent} onChange={e => {
              const newAilerons = [...ailerons];
              newAilerons[idx].xPercent = parseFloat(e.target.value);
              setAilerons(newAilerons);
            }} />
          </label>
          <label>Front V-Winkel (°)
            <input type="range" min="0" max="60" step="1" value={a.frontAngleDeg} onChange={e => {
              const newAilerons = [...ailerons];
              newAilerons[idx].frontAngleDeg = Number(e.target.value);
              setAilerons(newAilerons);
            }} />
            <input type="number" min="0" max="60" step="1" value={a.frontAngleDeg} onChange={e => {
              const newAilerons = [...ailerons];
              newAilerons[idx].frontAngleDeg = Number(e.target.value);
              setAilerons(newAilerons);
            }} />
          </label>
          <label>Rear V-Winkel (°)
            <input type="range" min="0" max="60" step="1" value={a.rearAngleDeg} onChange={e => {
              const newAilerons = [...ailerons];
              newAilerons[idx].rearAngleDeg = Number(e.target.value);
              setAilerons(newAilerons);
            }} />
            <input type="number" min="0" max="60" step="1" value={a.rearAngleDeg} onChange={e => {
              const newAilerons = [...ailerons];
              newAilerons[idx].rearAngleDeg = Number(e.target.value);
              setAilerons(newAilerons);
            }} />
          </label>
          <button onClick={() => setAilerons(ailerons.filter((_, i) => i !== idx))}>Löschen</button>
        </div>
      ))}
      <button onClick={() => setAilerons([...ailerons, { thicknessTop: 2, xPercent: 0.7, frontAngleDeg: 15, rearAngleDeg: 15 }])}>
        Neuer Aileron
      </button>
    </ProfileBox>
  );
};