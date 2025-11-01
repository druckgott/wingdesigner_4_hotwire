(function() {
    const PointTag = window.PointTag;

    window.matchPointCount = function(ptsA, ptsB) {
        const maxLen = Math.max(ptsA.length, ptsB.length);

        const resample = (pts, targetLen) => {
            const out = [];
            for (let i = 0; i < targetLen; i++) {
                const t = i / (targetLen - 1) * (pts.length - 1);
                const i0 = Math.floor(t);
                const i1 = Math.ceil(t);
                const f = t - i0;

                const p0 = pts[i0] || { x: 0, y: 0 };
                const p1 = pts[i1] || { x: 0, y: 0 };

                const x = p0.x * (1 - f) + p1.x * f;
                const y = p0.y * (1 - f) + p1.y * f;

                out.push({ 
                    x, 
                    y, 
                    ...(p0.tag ? { tag: p0.tag } : {}) 
                });
            }
            return out;
        };

        return [resample(ptsA, maxLen), resample(ptsB, maxLen)];
    };

    window.scaleProfile = function(pts, scale) {
        return pts.map(p => ({
            ...p,
            x: p.x * scale,
            y: p.y * scale
        }));
    };

    window.offsetOuterProfile = function(pts, verticalOffset, chordOffset) {
        return pts.map(p => ({
            ...p,
            x: p.x + chordOffset,
            y: p.y + verticalOffset
        }));
    };

    window.smoothProfile = function(points, threshold = 2) {
        const smoothed = [{ ...points[0] }];
        for (let i = 1; i < points.length; i++) {
            const prev = smoothed[smoothed.length - 1];
            const pt = points[i];
            let x = pt.x;
            let y = pt.y;
            if (Math.abs(y - prev.y) > threshold) {
                y = prev.y + Math.sign(y - prev.y) * threshold;
            }
            smoothed.push({ ...pt, x, y });
        }
        return smoothed;
    };

    window.getHolePoints = function(diameter, xPercent, yPercent, profilePts, nPoints) {
        if (!profilePts || profilePts.length === 0) return [];

        const xs = profilePts.map(p => p.x);
        const ys = profilePts.map(p => p.y);

        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const centerX = minX + xPercent * (maxX - minX);
        const centerY = minY + yPercent * (maxY - minY);

        const radius = diameter / 2;
        const holePts = [];

        for (let i = 0; i < nPoints; i++) {
            const theta = (i / nPoints) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(theta);
            const y = centerY + radius * Math.sin(theta);
            holePts.push({ x, y, tag: window.PointTag.HOLE });
        }

        return holePts;
    };

    function findClosestHolePoint(profilePts, holePts) {
        let minDist = Infinity;
        let closestHoleIdx = 0;
        let closestProfileIdx = 0;

        profilePts.forEach(({ x: px, y: py }, i) => {
            holePts.forEach(({ x: hx, y: hy }, j) => {
                const dx = px - hx;
                const dy = py - hy;
                const dist = dx*dx + dy*dy;
                if (dist < minDist) {
                    minDist = dist;
                    closestHoleIdx = j;
                    closestProfileIdx = i;
                }
            });
        });

        return { closestProfileIdx, closestHoleIdx };
    }

    function rotateHolePointsToStart(holePts, startIdx, reverse = false) {
        let pts = [...holePts.slice(startIdx), ...holePts.slice(0, startIdx)];
        if (reverse) pts.reverse();
        return pts;
    }

    function createCutPoints(profilePt, holePt, n = 3) {
        const { x: px, y: py } = profilePt;
        const { x: hx, y: hy } = holePt;
        const points = [];
        for (let i = 1; i <= n; i++) {
            const t = i / (n + 1);
            const x = px + t * (hx - px);
            const y = py + t * (hy - py);
            points.push({ x, y });
        }
        return points;
    }

    window.insertHoleWithInOut = function(profilePts, holePts, nCutPoints = 3) {
        if (!profilePts.length || !holePts.length) return profilePts;

        const { closestProfileIdx: ipIdx, closestHoleIdx: ihIdx } = findClosestHolePoint(profilePts, holePts);

        const profilePt = profilePts[ipIdx];
        const holePt = holePts[ihIdx];
        const inOutProfilePt = { ...profilePt, tag: window.PointTag.PROFILE };
        const inOutHolePt = { ...holePt, tag: window.PointTag.HOLE };

        const rotatedHolePts = rotateHolePointsToStart(holePts, ihIdx, true).map(p => ({
            x: p.x,
            y: p.y,
            tag: window.PointTag.HOLE
        }));

        const cutPts = createCutPoints(profilePt, holePt, nCutPoints).map(p => ({
            x: p.x,
            y: p.y,
            tag: window.PointTag.HOLE
        }));

        return [
            ...profilePts.slice(0, ipIdx + 1),
            inOutProfilePt,
            ...cutPts,
            inOutHolePt,
            ...rotatedHolePts.slice(1),
            inOutHolePt,
            ...cutPts.slice().reverse(),
            inOutProfilePt,
            ...profilePts.slice(ipIdx + 1)
        ];
    };

    window.addBottomPath = function(profilePts, xPercent = 0.5, gap = 2, forwardAngleDeg = 10, backwardAngleDeg = 10) {
        const forwardAngle = forwardAngleDeg * Math.PI / 180;
        const backwardAngle = backwardAngleDeg * Math.PI / 180;

        const xs = profilePts.map(p => p.x);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const xCut = minX + xPercent * (maxX - minX);

        const yBottom = findBottomAtX(profilePts, xCut);
        const yTop = findTopAtX(profilePts, xCut);

        const apexY = yTop - gap;
        const VHeight = apexY - yBottom;

        const dxBack = Math.tan(backwardAngle) * VHeight;
        const dxFwd = Math.tan(forwardAngle) * VHeight;

        const apexPt = { x: xCut, y: apexY, tag: window.PointTag.AILERON };
        const backPt = { x: xCut - dxBack, y: yBottom, tag: window.PointTag.AILERON };
        const fwdPt = { x: xCut + dxFwd, y: yBottom, tag: window.PointTag.AILERON };

        const half = Math.ceil(profilePts.length / 2);
        const bottomPts = profilePts.slice(half);

        fwdPt.y = projectToProfile(bottomPts, fwdPt.x);
        backPt.y = projectToProfile(bottomPts, backPt.x);

        const left = bottomPts.filter(p => p.x < backPt.x);
        const right = bottomPts.filter(p => p.x > fwdPt.x);

        const newBottom = [
            ...left,
            backPt,
            apexPt,
            fwdPt,
            ...right
        ];

        return [
            ...profilePts.slice(0, half),
            ...newBottom
        ];
    };

    window.trimAirfoilFront = function(points, trimLEmm) {
        if (!points || points.length < 2 || trimLEmm <= 0) return points;
        const xMin = Math.min(...points.map(p => p.x));
        const xLimit = xMin + trimLEmm;
        let topPoint = null, bottomPoint = null;
        let topIndex = null, bottomIndex = null;

        for (let i = points.length - 1; i >= 0; i--) {
            if (points[i].x <= xLimit) { topPoint = { ...points[i], x: xLimit }; topIndex = i; break; }
        }
        for (let i = 0; i < points.length; i++) {
            if (points[i].x <= xLimit) { bottomPoint = { ...points[i], x: xLimit }; bottomIndex = i; break; }
        }
        if (!topPoint || !bottomPoint) return points;

        return [...points.slice(0, bottomIndex), bottomPoint, topPoint, ...points.slice(topIndex + 1)];
    };


    window.trimAirfoilBack = function(points, trimTEmm) {
        if (!points || points.length < 2 || trimTEmm <= 0) return points;

        const xMax = Math.max(...points.map(p => p.x));
        const xLimit = xMax - trimTEmm;

        // ---------------- Interpolation ----------------
        const interpY = (p1, p2, x) => {
            if (!p1 || !p2 || p1.x === p2.x) return p1 ? p1.y : 0;
            return p1.y + (p2.y - p1.y) * (x - p1.x) / (p2.x - p1.x);
        };

        // ---------------- Oberseite ----------------
        const upper = [];
        let upperDone = false;
        for (let i = 0; i < points.length; i++) {
            const p = points[i];                              
            if (p.x <= xLimit) {                                           
                upper.push({ ...p });                 
            }
            if (!upperDone && p.y > 0 && points[i+1].x <= xLimit) {
            const yProfile = interpY(points[i+1], p, xLimit);
            upper.push({ x: xLimit, y: points[0].y });
            upper.push({ x: xLimit, y: yProfile });
            //upper.push([xLimit, yProfile]);
            upperDone = true;
            }
        }

        // ---------------- Unterseite ----------------
        const lower = [];
        let lowerDone = false;
        // Wir laufen von hinten nach vorne, aber nutzen die echten Unterseitenpunkte zur Interpolation
        for (let i = points.length - 1; i >= 0; i--) {
            const p = points[i];
                                    
            if (!lowerDone && p.y < 0 && points[i-1].x <= xLimit) {
                // letzter Unterseitenpunkt vor xLimit
                const yProfile = interpY(p, points[i-1], xLimit);
                // Profilpunkt auf Schnittlinie
                lower.push({ x: xLimit, y: yProfile });
                lower.push({ x: xLimit, y: points[0].y });
                lowerDone = true;
            }
        }

        return [...upper, ...lower];
    };

    window.rotatePoint = function(pt, angleRad) {
        const cosA = Math.cos(angleRad);
        const sinA = Math.sin(angleRad);
        return {
            ...pt,
            x: pt.x * cosA - pt.y * sinA,
            y: pt.x * sinA + pt.y * cosA
        };
    };

    window.createLine = function(pts, yOffset, color) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        pts.forEach(p => vertices.push(p.x, yOffset, p.y));
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color }));
    };

    function findTopAtX(profilePts, xCut) {
        const half = Math.ceil(profilePts.length / 2);
        const topPts = profilePts.slice(0, half);
        for (let i = 0; i < topPts.length - 1; i++) {
            const {x:x1,y:y1} = topPts[i], {x:x2,y:y2} = topPts[i+1];
            if ((x1 <= xCut && x2 >= xCut) || (x2 <= xCut && x1 >= xCut)) return y1 + (xCut-x1)/(x2-x1)*(y2-y1);
        }
        if (xCut <= topPts[0].x) return topPts[0].y;
        if (xCut >= topPts[topPts.length-1].x) return topPts[topPts.length-1].y;
        return topPts[0].y;
    }

    function findBottomAtX(profilePts, xCut) {
        const half = Math.ceil(profilePts.length / 2);
        const bottomPts = profilePts.slice(half);
        for (let i = 0; i < bottomPts.length-1; i++) {
            const {x:x1,y:y1} = bottomPts[i], {x:x2,y:y2} = bottomPts[i+1];
            if ((x1 <= xCut && x2 >= xCut) || (x2 <= xCut && x1 >= xCut)) return y1 + (xCut-x1)/(x2-x1)*(y2-y1);
        }
        if (xCut <= bottomPts[0].x) return bottomPts[0].y;
        if (xCut >= bottomPts[bottomPts.length-1].x) return bottomPts[bottomPts.length-1].y;
        return bottomPts[0].y;
    }

    function projectToProfile(profilePts, x) {
        for (let i = 0; i < profilePts.length - 1; i++) {
            const {x:x0,y:y0} = profilePts[i], {x:x1,y:y1} = profilePts[i+1];
            if (x >= x0 && x <= x1) return y0 + (x-x0)/(x1-x0)*(y1-y0);
        }
        return profilePts[profilePts.length-1].y;
    }

})();
