function AileronsSection({ ailerons, setAilerons, activeTab, setActiveTab }) {
    const isActive = activeTab === 'ailerons';

    const toggleTab = () => setActiveTab(isActive ? null : 'ailerons');

    const updateAileron = (index, field, value) => {
        const updated = [...ailerons];
        updated[index][field] = Number(value);
        setAilerons(updated);
    };

    const addAileron = () => {
        setAilerons([
            ...ailerons,
            { thicknessTop: 2, xPercent: 0.7, frontAngleDeg: 15, rearAngleDeg: 15 }
        ]);
    };

    const deleteAileron = (index) => {
        setAilerons(ailerons.filter((_, i) => i !== index));
    };

    return (
        <div className="profile-box">
            <div className={`profile-header ${isActive ? 'active' : ''}`} onClick={toggleTab}>
                Aileron Cut
            </div>

            {isActive && (
                <div className="profile-content">
                    {ailerons.map((aileron, index) => (
                        <div key={index} className="aileron-item">
                            <div className="item-header">Aileron {index + 1}</div>

                            <div className="form-group">
                                <label>Restdicke Oberseite (mm)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={aileron.thicknessTop}
                                    onChange={e => updateAileron(index, 'thicknessTop', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Position von hinten (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={aileron.xPercent}
                                    onChange={e => updateAileron(index, 'xPercent', e.target.value)}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={aileron.xPercent}
                                    onChange={e => updateAileron(index, 'xPercent', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Front V-Winkel (°)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="60"
                                    step="1"
                                    value={aileron.frontAngleDeg}
                                    onChange={e => updateAileron(index, 'frontAngleDeg', e.target.value)}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="60"
                                    step="1"
                                    value={aileron.frontAngleDeg}
                                    onChange={e => updateAileron(index, 'frontAngleDeg', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Rear V-Winkel (°)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="60"
                                    step="1"
                                    value={aileron.rearAngleDeg}
                                    onChange={e => updateAileron(index, 'rearAngleDeg', e.target.value)}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="60"
                                    step="1"
                                    value={aileron.rearAngleDeg}
                                    onChange={e => updateAileron(index, 'rearAngleDeg', e.target.value)}
                                />
                            </div>

                            <button
                                className="btn btn-danger btn-small"
                                onClick={() => deleteAileron(index)}
                            >
                                Delete Aileron
                            </button>
                        </div>
                    ))}

                    <button className="btn" onClick={addAileron}>
                        Add New Aileron
                    </button>
                </div>
            )}
        </div>
    );
}
