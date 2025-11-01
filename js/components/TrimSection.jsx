function TrimSection({
    trimEnabled,
    setTrimEnabled,
    trimLEmm,
    setTrimLEmm,
    trimTEmm,
    setTrimTEmm,
    activeTab,
    setActiveTab
}) {
    const isActive = activeTab === 'trim';

    const toggleTab = () => setActiveTab(isActive ? null : 'trim');
    const handleTrimLEChange = (value) => setTrimLEmm(Number(value));
    const handleTrimTEChange = (value) => setTrimTEmm(Number(value));

    return (
        <div className="profile-box">
            <div
                className={`profile-header ${isActive ? 'active' : ''}`}
                onClick={toggleTab}
            >
                Trim Airfoil
            </div>

            {isActive && (
                <div className="profile-content">
                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            checked={trimEnabled}
                            onChange={e => setTrimEnabled(e.target.checked)}
                        />
                        <label>Enable Trim</label>
                    </div>

                    <div className="form-group">
                        <label>Nasenleiste Trim (LE) [mm]</label>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={trimLEmm}
                            onChange={e => handleTrimLEChange(e.target.value)}
                            disabled={!trimEnabled}
                        />
                        <input
                            type="range"
                            min="0"
                            max="20"
                            step="0.1"
                            value={trimLEmm}
                            onChange={e => handleTrimLEChange(e.target.value)}
                            disabled={!trimEnabled}
                        />
                    </div>

                    <div className="form-group">
                        <label>Endleiste Trim (TE) [mm]</label>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={trimTEmm}
                            onChange={e => handleTrimTEChange(e.target.value)}
                            disabled={!trimEnabled}
                        />
                        <input
                            type="range"
                            min="0"
                            max="20"
                            step="0.1"
                            value={trimTEmm}
                            onChange={e => handleTrimTEChange(e.target.value)}
                            disabled={!trimEnabled}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
