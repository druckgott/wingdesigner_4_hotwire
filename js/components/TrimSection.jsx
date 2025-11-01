const TrimSection = ({ trimEnabled, setTrimEnabled, trimLEmm, setTrimLEmm, trimTEmm, setTrimTEmm, isActive, onToggle }) => {
  return (
    <ProfileBox title="Trim Airfoil" color="#000" isActive={isActive} onToggle={onToggle}>
      <label>
        <input type="checkbox" checked={trimEnabled} onChange={e => setTrimEnabled(e.target.checked)} />
        Trim aktivieren
      </label>
      <label>Nasenleiste (LE) [mm]
        <input type="number" min="0" step="0.1" value={trimLEmm} onChange={e => setTrimLEmm(Number(e.target.value))} disabled={!trimEnabled} />
        <input type="range" min="0" max="20" step="0.1" value={trimLEmm} onChange={e => setTrimLEmm(Number(e.target.value))} disabled={!trimEnabled} />
      </label>
      <label>Endleiste (TE) [mm]
        <input type="number" min="0" step="0.1" value={trimTEmm} onChange={e => setTrimTEmm(Number(e.target.value))} disabled={!trimEnabled} />
        <input type="range" min="0" max="20" step="0.1" value={trimTEmm} onChange={e => setTrimTEmm(Number(e.target.value))} disabled={!trimEnabled} />
      </label>
    </ProfileBox>
  );
};