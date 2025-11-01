// PointTag als globale Variable
window.PointTag = {
    PROFILE: "profile",
    START: "start",
    END: "end",
    LE: "LE",
    TE: "TE",
    HOLE: "hole",
    AILERON: "aileron"
};

// parseDAT als globale Funktion
window.parseDAT = function(datText) {
    const lines = datText.split(/\r?\n/).map(l => l.trim());
    const pts = [];
    
    for (const line of lines) {
        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
            const x = parseFloat(parts[0]);
            const y = parseFloat(parts[1]);
            if (!isNaN(x) && !isNaN(y)) {
                pts.push({
                    x,
                    y,
                    tag: window.PointTag.PROFILE,
                    fixedGeom: false,
                    fixedIndex: null,
                    pairId: null,
                    sectionId: null
                });
            }
        }
    }
    
    // Mark start & end points
    if (pts.length > 1) {
        pts[0].tag = window.PointTag.START;
        pts[pts.length - 1].tag = window.PointTag.END;
    }
    
    return pts;
};
