function HolesSection({ holes, setHoles, activeTab, setActiveTab }) {
    const isActive = activeTab === 'holes';

    const toggleTab = () => setActiveTab(isActive ? null : 'holes');

    const updateHole = (index, field, value) => {
        const updated = [...holes];
        updated[index][field] = Number(value);
        setHoles(updated);
    };

    const addHole = () => {
        setHoles([...holes, { diameter: 5, xPercent: 0.5, yPercent: 0.5, nPoints: 30 }]);
    };

    const deleteHole = (index) => {
        setHoles(holes.filter((_, i) => i !== index));
    };

    return (
        <div className="profile-box">
            <div className={`profile-header ${isActive ? 'active' : ''}`} onClick={toggleTab}>
                Holes
            </div>

            {isActive && (
                <div className="profile-content">
                    {holes.map((hole, index) => (
                        <div key={index} className="hole-item">
                            <div className="item-header">Hole {index + 1}</div>

                            <div className="form-group">
                                <label>Diameter (mm)</label>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.1"
                                    value={hole.diameter}
                                    onChange={e => updateHole(index, 'diameter', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Punkteanzahl</label>
                                <input
                                    type="number"
                                    min="3"
                                    step="1"
                                    value={hole.nPoints}
                                    onChange={e => updateHole(index, 'nPoints', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Horizontal Position (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={hole.xPercent}
                                    onChange={e => updateHole(index, 'xPercent', e.target.value)}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={hole.xPercent}
                                    onChange={e => updateHole(index, 'xPercent', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Vertical Position (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={hole.yPercent}
                                    onChange={e => updateHole(index, 'yPercent', e.target.value)}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={hole.yPercent}
                                    onChange={e => updateHole(index, 'yPercent', e.target.value)}
                                />
                            </div>

                            <button
                                className="btn btn-danger btn-small"
                                onClick={() => deleteHole(index)}
                            >
                                Delete Hole
                            </button>
                        </div>
                    ))}

                    <button className="btn" onClick={addHole}>
                        Add New Hole
                    </button>
                </div>
            )}
        </div>
    );
}
