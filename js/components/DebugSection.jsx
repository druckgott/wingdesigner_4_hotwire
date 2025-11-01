function DebugSection({ debugOpen, setDebugOpen, debugPoints, innerName, outerName }) {

    const formatPoints = (points) =>
        points.map(p => `${p.x.toFixed(2).replace('.', ',')};${p.y.toFixed(2).replace('.', ',')}`).join('\n');

    const handleCopy = () => {
        const innerText = formatPoints(debugPoints.inner);
        const outerText = formatPoints(debugPoints.outer);
        const combinedText = `--- Inneres Profil ---\n${innerText}\n\n--- Äußeres Profil ---\n${outerText}`;

        navigator.clipboard.writeText(combinedText).then(() => {
            const btn = document.getElementById('debug-copy-btn');
            if (!btn) return;

            const originalText = btn.innerHTML;
            btn.innerHTML = '✓ Kopiert!';
            btn.style.backgroundColor = '#27ae60';

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.backgroundColor = '';
            }, 2000);
        });
    };

    const toggleOpen = () => setDebugOpen(prev => !prev);

    return (
        <div className="profile-box">
            <div className="profile-header" onClick={toggleOpen}>
                Debug Punkte
            </div>

            {debugOpen && (
                <div className="debug-section">
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'center',
                            padding: '8px'
                        }}
                    >
                        <button id="debug-copy-btn" className="btn" onClick={handleCopy}>
                            Copy to<br />Clipboard
                        </button>
                        <button className="btn btn-secondary btn-small" onClick={toggleOpen}>
                            Close
                        </button>
                    </div>

                    <div className="debug-panel">
                        <h4>{innerName || 'Inneres Profil'}</h4>
                        <pre className="debug-points">{formatPoints(debugPoints.inner)}</pre>
                    </div>

                    <div className="debug-panel">
                        <h4>{outerName || 'Äußeres Profil'}</h4>
                        <pre className="debug-points">{formatPoints(debugPoints.outer)}</pre>
                    </div>
                </div>
            )}
        </div>
    );
}
