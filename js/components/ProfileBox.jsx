const ProfileBox = ({ title, color, isActive, onToggle, children }) => {
  return (
    <div className="profile-box">
      <div className="profile-header" onClick={onToggle} style={{ color }}>
        {title}
      </div>
      {isActive && <div className="profile-content">{children}</div>}
    </div>
  );
};