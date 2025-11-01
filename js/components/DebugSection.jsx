const DebugSection = ({ debugPoints, innerName, outerName, isOpen, onToggle }) => {
  return (
    <ProfileBox title="Debug Punkte" color="#000" isActive={isOpen} onToggle={onToggle}>
      <button onClick={() => {
        const format = pts => pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`.replace('.', ',')).join('\n');
        const text = `--- Inneres Profil ---\n${format(debugPoints.inner)}\n\n--- Äußeres Profil ---\n${format(debugPoints.outer)}`;
        navigator.clipboard.writeText(text).then(() => alert('In Zwischenablage kopiert!'));
      }}>
        Kopieren
      </button>
      <div style={{ display: 'flex', gap: 16, fontSize: 12, fontFamily: 'monospace', whiteSpace: 'pre', overflow: 'auto', maxHeight: 200 }}>
        <div>
          <strong>{innerName}</strong><br/>
          {debugPoints.inner.map(p => 
            `${p.x.toFixed(2)},${p.y.toFixed(2)}${p.tag ? ` (${p.tag})` : ''}`.replace('.', ',')
          ).join('\n')}
        </div>
        <div>
          <strong>{outerName}</strong><br/>
          {debugPoints.outer.map(p => 
            `${p.x.toFixed(2)},${p.y.toFixed(2)}${p.tag ? ` (${p.tag})` : ''}`.replace('.', ',')
          ).join('\n')}
        </div>
      </div>
    </ProfileBox>
  );
};