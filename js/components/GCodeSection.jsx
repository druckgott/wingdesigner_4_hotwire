// js/components/GCodeSection.jsx
const GCodeSection = ({ gcode, title = "GCode", isOpen, onToggle, fileName = "program.nc" }) => {

  const saveFile = () => {
    const blob = new Blob([gcode], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <ProfileBox title={title} color="#000" isActive={isOpen} onToggle={onToggle}>
      <button onClick={saveFile}>Speichern</button>

      <div style={{
        display: 'flex',
        gap: 16,
        fontSize: 12,
        fontFamily: 'monospace',
        whiteSpace: 'pre',
        overflow: 'auto',
        maxHeight: 200
      }}>
        <div>{gcode}</div>
      </div>
    </ProfileBox>
  );
};
