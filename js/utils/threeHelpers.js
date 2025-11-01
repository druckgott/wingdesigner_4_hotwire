(function() {

    window.initThreeScene = function(canvas, span, cameraPos, cameraTarget) {
        if (!canvas) return null;

        const setup = () => {
            if (!document.body) return null; // Body noch nicht verfügbar

            const width = canvas.clientWidth || 800;
            const height = canvas.clientHeight || 600;

            // Scene
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0xf0f0f0);
            canvas.scene = scene;

            // Camera
            const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
            camera.position.set(600, -span / 2, span);
            camera.up.set(0, 0, 1);
            camera.lookAt(0, 0, 0);
            canvas.camera = camera;

            // Renderer
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(width, height);
            canvas.innerHTML = "";
            canvas.appendChild(renderer.domElement);
            canvas.renderer = renderer;

            // Controls
            const controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.1;
            controls.enableZoom = true;
            controls.enablePan = true;
            controls.target.set(0, 0, 0);
            canvas.controls = controls;

            // Axes helper
            const axes = new THREE.AxesHelper(span);
            scene.add(axes);

            // Marker sprite
            const material = new THREE.SpriteMaterial({ color: 0x000000 });
            const sprite = new THREE.Sprite(material);
            sprite.scale.set(10, 10, 1);
            sprite.visible = false;
            scene.add(sprite);
            canvas.marker = sprite;

            // Store lines reference
            scene.lines = { innerLine: null, outerLine: null };

            // Animation loop
            const animate = () => {
                requestAnimationFrame(animate);
                controls.update();

                if (cameraPos) {
                    cameraPos.x = camera.position.x;
                    cameraPos.y = camera.position.y;
                    cameraPos.z = camera.position.z;
                }

                if (cameraTarget) {
                    cameraTarget.x = controls.target.x;
                    cameraTarget.y = controls.target.y;
                    cameraTarget.z = controls.target.z;
                }

                renderer.render(scene, camera);
            };
            animate();

            // Handle resize
            const handleResize = () => {
                if (!canvas) return;
                const newWidth = canvas.clientWidth || 800;
                const newHeight = canvas.clientHeight || 600;
                camera.aspect = newWidth / newHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(newWidth, newHeight);
            };
            window.addEventListener('resize', handleResize);

            return { scene, camera, renderer, controls };
        };

        // Immer DOMContentLoaded abwarten
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            return setup();
        } else {
            let result = null;
            document.addEventListener('DOMContentLoaded', () => { result = setup(); });
            return result;
        }
    };

    window.setupMouseInteraction = function(canvas, tooltip, cameraPos, cameraTarget, scene, camera, controls) {
        if (!canvas || !scene || !camera || !controls) return {};

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const tagMarkers = [];

        const updateTagMarkers = () => {
            tagMarkers.forEach(m => scene.remove(m));
            tagMarkers.length = 0;

            const greenMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const sphereGeom = new THREE.SphereGeometry(0.2, 8, 8);

            [scene.lines.innerLine, scene.lines.outerLine].forEach(line => {
                if (!line) return;
                const positions = line.geometry.attributes.position.array;
                const tags = (line.geometry.attributes.tag && line.geometry.attributes.tag.array) || [];

                for (let i = 0; i < positions.length; i += 3) {
                    const tag = tags[i / 3];
                    if (tag === 0 || tag === 1 || tag === 2) { // START, END, PROFILE
                        const marker = new THREE.Mesh(sphereGeom, greenMaterial);
                        marker.position.set(positions[i], positions[i+1], positions[i+2]);
                        marker.visible = false;
                        scene.add(marker);
                        tagMarkers.push(marker);
                    }
                }
            });
        };

        const onMouseMove = (event) => {
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            const lines = [scene.lines.innerLine, scene.lines.outerLine];
            let closestPoint = null;
            let minDist = Infinity;
            let pointIndex = -1;
            let lineColor = '';

            lines.forEach(line => {
                if (!line) return;
                const positions = line.geometry.attributes.position.array;

                for (let i = 0; i < positions.length; i += 3) {
                    const px = positions[i], py = positions[i+1], pz = positions[i+2];
                    const point = new THREE.Vector3(px, py, pz);
                    const dist = raycaster.ray.distanceToPoint(point);

                    if (dist < minDist) {
                        minDist = dist;
                        closestPoint = point;
                        pointIndex = i / 3;
                        lineColor = line.material.color.getStyle();
                    }
                }
            });

            const hovering = closestPoint && minDist < 10;

            if (tooltip) {
                tooltip.style.display = hovering ? 'block' : 'none';
                if (hovering) {
                    tooltip.style.left = event.clientX + 10 + 'px';
                    tooltip.style.top = event.clientY + 10 + 'px';
                    tooltip.innerHTML = `Index: ${pointIndex}<br>x: ${closestPoint.x.toFixed(2)}<br>y: ${closestPoint.z.toFixed(2)}<br>Color: ${lineColor}`;
                }
            }

            if (canvas.marker) {
                canvas.marker.visible = hovering;
                if (hovering) canvas.marker.position.copy(closestPoint);
            }

            tagMarkers.forEach(m => m.visible = hovering);
        };

        const domCanvas = canvas.querySelector('canvas') || canvas;
        domCanvas.addEventListener('mousemove', onMouseMove);

        const observer = new MutationObserver(updateTagMarkers);
        observer.observe(scene, { attributes: true, subtree: true, attributeFilter: ['lines'] });

        return { raycaster, mouse, tagMarkers, onMouseMove };
    };

})();
