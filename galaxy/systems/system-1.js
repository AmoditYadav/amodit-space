function createSolarSystem(sectionId, scene, camera, controls) {
    // Simplex noise for sun
    const simplexNoise = `
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) { 
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            vec3 i  = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;
            i = mod289(i);
            vec4 p = permute(permute(permute(
                     i.z + vec4(0.0, i1.z, i2.z, 1.0))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            float n_ = 0.142857142857;
            vec3 ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            vec4 x = x_ * ns.x + ns.yyyy;
            vec4 y = y_ * ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        float fbm(vec3 p) {
            float v = 0.0;
            float a = 0.9;
            vec3 shift = vec3(100.0);
            for (int i = 0; i < 8; ++i) {
                v += a * snoise(p);
                p = p * 2.0 + shift;
                a *= 0.9;
            }
            return v;
        }

        float fbmDetail(vec3 p) {
            float v = 0.0;
            float a = 0.9;
            vec3 shift = vec3(50.0);
            for (int i = 0; i < 8; ++i) {
                v += a * snoise(p);
                p = p * 3.0 + shift;
                a *= 0.9;
            }
            return v;
        }
    `;

    const vertexShader = `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
            vUv = uv;
            vPosition = position;
            vNormal = normal;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        ${simplexNoise}
        uniform float time;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
            vec3 pos = vPosition * 0.9 + time * -0.05;
            float n1 = fbm(pos);
            n1 = n1 * 2.0 + 0.9;
            float n2 = fbm(pos + vec3(40.0));
            n2 = n2 * 0.9 + 0.9;
            float baseNoise = (n1 * 0.6 + n2 * 0.9);
            baseNoise = clamp(baseNoise, 0.0, 1.0);
            float detail = fbmDetail(pos * 5.0 + vec3(30.0));
            detail = detail * 0.5 + 0.5;
            baseNoise += detail * 0.15;
            baseNoise = clamp(baseNoise, 0.0, 1.0);
            vec3 viewDir = normalize(cameraPosition - vPosition);
            float rim = 1.0 - max(dot(vNormal, viewDir), 0.0);
            rim = pow(rim, 2.0);
            float glowFactor = rim;
            vec3 glowColor = vec3(1.0, 0.9, 0.6);
            vec3 radiantGlow = glowColor * glowFactor * 0.9;
            vec3 yellow = vec3(1.0, 0.55, 0.0);
            vec3 orange = vec3(1.0, 0.27, 0.0);
            vec3 red = vec3(0.8, 0.2, 0.0);
            vec3 color = mix(yellow, orange, baseNoise);
            color = mix(color, red, detail * 0.9);
            color += radiantGlow;
            gl_FragColor = vec4(color, 1.0);
        }
    `;

    // Enable shadow casting
    scene.receiveShadow = true;

    // Sun setup with point light for shadows
    const sunGroup = new THREE.Group();
    sunGroup.name = 'sun';
    scene.add(sunGroup);
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const shaderMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: { time: { value: 0 } },
    });
    const sunSphere = new THREE.Mesh(sphereGeometry, shaderMaterial);
    sunSphere.name = 'sunSphere';
    sunSphere.castShadow = true;
    sunGroup.add(sunSphere);

    // Add point light to sun
    const sunLight = new THREE.PointLight(0xffffff, 1.5, 500);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunGroup.add(sunLight);

    // Atmosphere creation function
    const createAtmosphere = (radius, colorStart, colorEnd, hasGlow = false) => {
        const atmosphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
        let atmosphereMaterial;
        if (hasGlow) {
            atmosphereMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    glowColor: { value: new THREE.Color(colorStart) },
                    glowIntensity: { value: 2 }
                },
                vertexShader: `
                    varying vec3 vNormal;
                    void main() {
                        vNormal = normalize(normalMatrix * normal);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform vec3 glowColor;
                    uniform float glowIntensity;
                    varying vec3 vNormal;
                    void main() {
                        float intensity = pow(0.8 - dot(vNormal, vec3(0, 0, 1)), 2.0);
                        gl_FragColor = vec4(glowColor * intensity * glowIntensity, intensity);
                    }
                `,
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending,
                transparent: true
            });
        } else {
            atmosphereMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    colorStart: { value: new THREE.Color(colorStart) },
                    colorEnd: { value: new THREE.Color(colorEnd) }
                },
                vertexShader: `
                    varying vec3 vPosition;
                    void main() {
                        vPosition = position;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform vec3 colorStart;
                    uniform vec3 colorEnd;
                    varying vec3 vPosition;
                    void main() {
                        float dist = length(vPosition) / ${radius.toFixed(2)};
                        vec3 color = mix(colorStart, colorEnd, dist);
                        explosives gl_FragColor = vec4(color, 0.8);
                    }
                `,
                side: THREE.BackSide,
                transparent: true
            });
        }
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        atmosphere.name = 'atmosphere';
        scene.add(atmosphere);
        return atmosphere;
    };

    // Sun atmospheres
    const pxToUnits = 0.1;
    const sphereRadius = 1;
    createAtmosphere(sphereRadius + 0.6 - 6 * pxToUnits, 0xFFFF00, 0xFFFF99, true);
    createAtmosphere(sphereRadius + 0.1 + 0.0054 * pxToUnits, 0xFFA500, 0xFF4500, true);
    createAtmosphere(sphereRadius + 0.7 * pxToUnits, 0xFF0000, 0xCC0000, true);

    // Habitable zone as a single plane
    const scalingFactor = 20 / 0.0485;
    const habitableZoneInner = 0.06 * scalingFactor;
    const habitableZoneOuter = 0.12 * scalingFactor;
    const habitableZoneGeometry = new THREE.RingGeometry(habitableZoneInner, habitableZoneOuter, 64);
    const habitableZoneMaterial = new THREE.MeshBasicMaterial({
        color: 0xADD8E6,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
    });
    const habitableZoneMesh = new THREE.Mesh(habitableZoneGeometry, habitableZoneMaterial);
    habitableZoneMesh.rotation.x = Math.PI / 2;
    habitableZoneMesh.name = 'habitableZone';
    scene.add(habitableZoneMesh);

    // Habitable zone toggle
    const habitableCheckbox = document.getElementById('habitable-checkbox');
    if (habitableCheckbox) {
        habitableZoneMesh.visible = habitableCheckbox.checked;
        habitableCheckbox.addEventListener('change', () => {
            habitableZoneMesh.visible = habitableCheckbox.checked;
        });
    } else {
        console.error('Habitable zone checkbox not found');
    }

    // Planet data including Moon
    const planets = [
        {
            name: 'Mercury',
            radius: 0.5,
            distance: 20,
            speed: 0.02,
            texture: 'textures/8k_mercury.jpg',
            rotationSpeed: 0.001,
            angleOffset: 0 * (2 * Math.PI / 10)
        },
        {
            name: 'Venus',
            radius: 1.2,
            distance: 30,
            speed: 0.015,
            texture: 'textures/8k_venus_surface.jpg',
            rotationSpeed: 0.0008,
            angleOffset: 1 * (2 * Math.PI / 10)
        },
        {
            name: 'Earth',
            radius: 1.5,
            distance: 40,
            speed: 0.01,
            texture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Whole_world_-_land_and_oceans.jpg/1280px-Whole_world_-_land_and_oceans.jpg',
            rotationSpeed: 0.001,
            angleOffset: 2 * (2 * Math.PI / 10)
        },
        {
            name: 'Moon',
            radius: 0.4,
            distance: 40,
            speed: 0.01,
            texture: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/lroc_color_poles_1k.jpg',
            rotationSpeed: 0.0005,
            angleOffset: 2 * (2 * Math.PI / 10),
            parent: 'Earth',
            offsetDistance: 3
        },
        {
            name: 'Mars',
            radius: 0.8,
            distance: 50,
            speed: 0.008,
            texture: 'textures/8k_mars.jpg',
            rotationSpeed: 0.001,
            angleOffset: 3 * (2 * Math.PI / 10),
            hasAtmosphere: true
        },
        {
            name: 'Jupiter',
            radius: 3.5,
            distance: 80,
            speed: 0.005,
            texture: 'textures/8k_jupiter.jpg',
            rotationSpeed: 0.002,
            angleOffset: 4 * (2 * Math.PI / 10)
        },
        {
            name: 'Saturn',
            radius: 3.0,
            distance: 110,
            speed: 0.004,
            texture: 'textures/8k_saturn.jpg',
            rotationSpeed: 0.002,
            angleOffset: 5 * (2 * Math.PI / 10),
            hasRings: true
        },
        {
            name: 'Uranus',
            radius: 2.0,
            distance: 140,
            speed: 0.003,
            texture: 'textures/2k_uranus.jpg',
            rotationSpeed: 0.0015,
            angleOffset: 6 * (2 * Math.PI / 10)
        },
        {
            name: 'Neptune',
            radius: 1.8,
            distance: 160,
            speed: 0.002,
            texture: 'textures/2k_neptune.jpg',
            rotationSpeed: 0.0015,
            angleOffset: 7 * (2 * Math.PI / 10)
        },
        {
            name: 'Pluto',
            radius: 0.3,
            distance: 180,
            speed: 0.001,
            texture: 'textures/Pluto-map-sept-16-2015.jpg',
            rotationSpeed: 0.0005,
            angleOffset: 8 * (2 * Math.PI / 10)
        }
    ];

    const planetGroups = [];
    const loader = new THREE.TextureLoader();
    const referenceTime = Date.now() / 1000;

    // Create Saturn's particle rings
    function createParticleRings(planetGroup, innerRadius, outerRadius, numParticles) {
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(numParticles * 3);
        const colors = new Float32Array(numParticles * 3);
        const sizes = new Float32Array(numParticles);
        const color = new THREE.Color(0xD2B48C);

        for (let i = 0; i < numParticles; i++) {
            const theta = Math.random() * Math.PI * 2;
            const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
            const x = Math.cos(theta) * radius;
            const z = Math.sin(theta) * radius;
            const y = (Math.random() - 0.5) * 0.05;
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
            sizes[i] = 0.05 + Math.random() * 0.05;
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const particleMaterial = new THREE.PointsMaterial({
            vertexColors: true,
            size: 0.1,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });

        const particleSystem = new THREE.Points(particles, particleMaterial);
        particleSystem.rotation.x = Math.PI / 2;
        particleSystem.castShadow = true;
        particleSystem.receiveShadow = true;
        planetGroup.add(particleSystem);
    }

    planets.forEach(planet => {
        const group = new THREE.Group();
        group.name = planet.name;
        const geometry = new THREE.SphereGeometry(planet.radius, 64, 64);
        const material = new THREE.MeshStandardMaterial({
            map: loader.load(planet.texture, undefined, undefined, (error) => {
                console.error(`Failed to load texture for ${planet.name}:`, error);
            })
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = `${planet.name}Sphere`;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);

        // Add white atmosphere for Mars
        if (planet.name === 'Mars' && planet.hasAtmosphere) {
            const atmosphereGeometry = new THREE.SphereGeometry(planet.radius * 1.05, 32, 32);
            const atmosphereMaterial = new THREE.ShaderMaterial({
                vertexShader: `
                    varying vec3 vNormal;
                    void main() {
                        vNormal = normalize(normalMatrix * normal);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    varying vec3 vNormal;
                    void main() {
                        float intensity = pow(0.8 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                        gl_FragColor = vec4(1.0, 1.0, 1.0, 0.5) * intensity;
                    }
                `,
                blending: THREE.AdditiveBlending,
                side: THREE.BackSide,
                transparent: true
            });
            const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
            group.add(atmosphere);
        }

        // Add atmosphere and clouds for Earth
        if (planet.name === 'Earth') {
            const atmosphereGeometry = new THREE.SphereGeometry(planet.radius * 1.05, 32, 32);
            const atmosphereMaterial = new THREE.ShaderMaterial({
                vertexShader: `
                    varying vec3 vNormal;
                    void main() {
                        vNormal = normalize(normalMatrix * normal);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    varying vec3 vNormal;
                    void main() {
                        float intensity = pow(0.8 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                        gl_FragColor = vec4(0.3, 0.6, 1.0, 0.5) * intensity;
                    }
                `,
                blending: THREE.AdditiveBlending,
                side: THREE.BackSide,
                transparent: true
            });
            const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
            group.add(atmosphere);

            const cloudGeometry = new THREE.SphereGeometry(planet.radius * 1.02, 32, 32);
            const cloudMaterial = new THREE.MeshBasicMaterial({
                map: loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png', undefined, undefined, (error) => {
                    console.error('Failed to load Earth clouds texture:', error);
                }),
                transparent: true,
                opacity: 0.6,
                blending: THREE.NormalBlending
            });
            const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
            group.add(cloudMesh);
        }

        // Add Saturn's 7 particle rings
        if (planet.name === 'Saturn' && planet.hasRings) {
            for (let i = 1; i <= 7; i++) {
                const innerRadius = planet.radius * (1.2 + i * 0.1);
                const outerRadius = planet.radius * (1.3 + i * 0.1);
                createParticleRings(group, innerRadius, outerRadius, 10000);
            }
        }

        // Add orbital path with misty effect
        if (!planet.parent) {
            const orbitGeometry = new THREE.BufferGeometry();
            const points = [];
            const segments = 100;
            for (let i = 0; i <= segments; i++) {
                const theta = (i / segments) * Math.PI * 2;
                points.push(new THREE.Vector3(
                    Math.cos(theta) * planet.distance,
                    0,
                    Math.sin(theta) * planet.distance
                ));
            }
            orbitGeometry.setFromPoints(points);

            const orbitVertexShader = `
                varying vec3 vPosition;
                void main() {
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `;

            const orbitFragmentShader = `
                varying vec3 vPosition;
                uniform float time;
                void main() {
                    vec3 color = vec3(0.5, 0.8, 1.0);
                    float dist = length(vPosition) / ${planet.distance.toFixed(2)};
                    float opacity = 0.3 * (1.0 - abs(sin(time * 0.5 + dist * 3.14159)));
                    gl_FragColor = vec4(color, opacity);
                }
            `;

            const orbitMaterial = new THREE.ShaderMaterial({
                vertexShader: orbitVertexShader,
                fragmentShader: orbitFragmentShader,
                uniforms: { time: { value: 0 } },
                transparent: true,
                blending: THREE.AdditiveBlending
            });
            const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
            scene.add(orbitLine);
            planet.orbitLine = orbitLine;
        }

        // Assign initial angle
        if (!planet.parent) {
            const orbitalPeriod = 1 / planet.speed;
            const initialAngle = (referenceTime / orbitalPeriod) * Math.PI * 2 + planet.angleOffset;
            group.userData.initialAngle = initialAngle % (Math.PI * 2);
        }

        scene.add(group);
        planetGroups.push({
            group,
            mesh,
            distance: planet.distance,
            speed: planet.speed,
            rotationSpeed: planet.rotationSpeed,
            parent: planet.parent,
            offsetDistance: planet.offsetDistance,
            initialAngle: planet.parent ? 0 : group.userData.initialAngle,
            orbitLine: planet.orbitLine
        });
    });

    // Raycaster for clicking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let selectedPlanet = null;
    let lastClickTime = 0;
    const doubleClickThreshold = 300;

    function handlePlanetSelection(planetGroup, currentTime = performance.now()) {
        if (currentTime - lastClickTime < doubleClickThreshold) {
            // Double click: focus on Sun and reset camera
            selectedPlanet = null;
            controls.target.set(0, 0, 0);
            camera.position.set(0, 15, 100);
            controls.minDistance = 1;
            controls.maxDistance = 500;
        } else {
            // Single click: zoom to a clear view and lock target
            selectedPlanet = planetGroup;
            controls.target.copy(planetGroup.position);
            const planetPos = planetGroup.position;
            let planetRadius = planetGroup.getObjectByName(`${planetGroup.name}Sphere`).geometry.parameters.radius || 1;
            const zoomDistance = planetRadius * 5;
            const direction = new THREE.Vector3(0, 0.5, 1).normalize();
            const targetPos = planetPos.clone().add(direction.multiplyScalar(zoomDistance));
            transitionTo({
                position: targetPos,
                target: planetPos,
                duration: 1000
            });
            controls.minDistance = planetRadius * 2;
            controls.maxDistance = planetRadius * 50;
            controls.autoRotate = false;
        }
        lastClickTime = currentTime;
    }

    function onClick(event) {
        event.preventDefault();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(planetGroups.map(p => p.mesh).concat(sunSphere));
        const currentTime = performance.now();

        if (intersects.length > 0) {
            const intersected = intersects[0].object;
            handlePlanetSelection(intersected.parent, currentTime);
        }
    }

    document.querySelector('.canvas-container').addEventListener('click', onClick);

     // Popup trigger button (click only)
const popupTrigger = document.getElementById('popup-trigger');
const popup = document.getElementById('popup');
if (popupTrigger && popup) {
    popupTrigger.addEventListener('click', (event) => {
        event.preventDefault();
        // Toggle popup visibility using active class
        const isActive = popup.classList.toggle('active');
        popup.style.display = isActive ? 'flex' : 'none'; // Sync style with class
        if (isActive) {
            // Clear existing content
            popup.innerHTML = '';
            // Populate planet names
            planets.forEach((planet) => {
                const link = document.createElement('a');
                link.href = '#';
                link.textContent = planet.name;
                link.dataset.planet = planet.name;
                popup.appendChild(link);
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const planetName = e.target.dataset.planet;
                    const planetGroup = planetGroups.find(p => p.group.name === planetName).group;
                    handlePlanetSelection(planetGroup);
                    popup.classList.remove('active');
                    popup.style.display = 'none';
                });
            });
        }
    });
} else {
    console.error('Popup trigger or popup not found');
}

    // View button for solar system overview (view-btn-2)
    const viewBtn2 = document.getElementById('view-btn-2');
    if (viewBtn2) {
        viewBtn2.addEventListener('click', () => {
            if (scene !== window.galaxyScene) {
                selectedPlanet = null;
                let maxDistance = 0;
                planetGroups.forEach(planet => {
                    if (planet.distance > maxDistance) maxDistance = planet.distance;
                });
                const viewDistance = maxDistance * 2;
                const xAngle = Math.PI / 4;
                const yAngle = 15 * Math.PI / 180;
                const cameraPos = new THREE.Vector3(
                    viewDistance * Math.cos(yAngle) * Math.cos(xAngle),
                    viewDistance * Math.sin(xAngle),
                    viewDistance * Math.cos(yAngle) * Math.sin(xAngle)
                );
                transitionTo({
                    position: cameraPos,
                    target: new THREE.Vector3(0, 0, 0),
                    duration: 1000
                });
                controls.target.set(0, 0, 0);
                controls.minDistance = maxDistance * 0.5;
                controls.maxDistance = maxDistance * 3;
                controls.update();
            }
        });
    } else {
        console.error('View button 2 not found');
    }

    // View button for sun
    const viewBtn3 = document.getElementById('view-btn-3');
    if (viewBtn3) {
        viewBtn3.addEventListener('click', () => {
            if (scene !== window.galaxyScene) {
                selectedPlanet = null;
                const sunPos = new THREE.Vector3(0, 0, 0);
                const distanceFromSun = 0.6;
                const direction = camera.position.clone().sub(sunPos).normalize();
                const cameraTargetPos = sunPos.clone().add(direction.multiplyScalar(distanceFromSun));
                transitionTo({
                    position: cameraTargetPos,
                    target: sunPos,
                    duration: 1000
                });
                handlePlanetSelection(sunGroup);
            }
        });
    } else {
        console.error('View button 3 not found');
    }

    // Animation function
    scene.userData.animate = (time) => {
        shaderMaterial.uniforms.time.value = time;
        planetGroups.forEach(planet => {
            if (!planet.parent) {
                const theta = time * planet.speed + planet.initialAngle;
                planet.group.position.set(
                    Math.cos(theta) * planet.distance,
                    0,
                    Math.sin(theta) * planet.distance
                );
            } else {
                const parentGroup = planetGroups.find(p => p.group.name === planet.parent).group;
                const theta = time * planet.speed + planet.initialAngle;
                planet.group.position.copy(parentGroup.position).add(
                    new THREE.Vector3(
                        Math.cos(theta) * planet.offsetDistance,
                        0,
                        Math.sin(theta) * planet.offsetDistance
                    )
                );
            }
            planet.mesh.rotation.y += planet.rotationSpeed;
            if (planet.orbitLine) {
                planet.orbitLine.material.uniforms.time.value = time;
            }
        });

        if (selectedPlanet) {
            controls.target.copy(selectedPlanet.position);
            controls.update();
        }
    };
}