import * as THREE from 'three';

// Demo state
let currentDemo = 'wave-visualization';
let scene, camera, renderer, animationId;
let isRunning = false;
let startTime = 0;
let frameCount = 0;
let lastFpsUpdate = 0;
let currentFps = 0;

// Demo objects
let demoObjects = [];

// Initialize
function init() {
    const canvas = document.getElementById('renderCanvas');
    const container = document.getElementById('canvas-container');

    // Create renderer
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 1);

    // Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 10, 50);

    // Create camera
    camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Handle resize
    window.addEventListener('resize', onWindowResize);

    // Setup UI
    setupUI();

    // Load initial demo
    loadDemo(currentDemo);
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function setupUI() {
    // Demo selection
    document.querySelectorAll('.demo-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.demo-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            currentDemo = item.dataset.demo;
            loadDemo(currentDemo);
        });
    });

    // Control buttons
    document.getElementById('start-btn').addEventListener('click', startSimulation);
    document.getElementById('pause-btn').addEventListener('click', pauseSimulation);
    document.getElementById('reset-btn').addEventListener('click', resetSimulation);
}

function loadDemo(demoName) {
    // Clear previous demo
    demoObjects.forEach(obj => scene.remove(obj));
    demoObjects = [];

    // Show loading
    document.getElementById('loading').classList.add('active');

    setTimeout(() => {
        switch (demoName) {
            case 'wave-visualization':
                createWaveVisualization();
                break;
            case 'pendulum':
                createPendulum();
                break;
            case 'double-slit':
                createDoubleSlit();
                break;
            case 'particle-system':
                createParticleSystem();
                break;
            case 'racing-game':
                createRacingGame();
                break;
        }

        document.getElementById('loading').classList.remove('active');
    }, 500);
}

// Demo 1: Wave Visualization
function createWaveVisualization() {
    document.getElementById('demo-title').textContent = '🌊 Wave Visualization';
    document.getElementById('demo-description').textContent = 'Interactive quantum wave interference patterns with real-time rendering';

    // Create wave plane
    const gridSize = 64;
    const geometry = new THREE.PlaneGeometry(20, 20, gridSize - 1, gridSize - 1);

    const material = new THREE.MeshStandardMaterial({
        color: 0x4488ff,
        wireframe: false,
        side: THREE.DoubleSide,
        metalness: 0.3,
        roughness: 0.7
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);
    demoObjects.push(plane);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    scene.add(gridHelper);
    demoObjects.push(gridHelper);

    // Store for animation
    plane.userData.time = 0;
    plane.userData.geometry = geometry;

    // Setup controls
    const controlsHTML = `
        <div class="control-group">
            <label>Wave Speed: <span class="control-value" id="wave-speed-value">1.0</span></label>
            <input type="range" id="wave-speed" min="0.1" max="3" step="0.1" value="1.0">
        </div>
        <div class="control-group">
            <label>Wave Height: <span class="control-value" id="wave-height-value">2.0</span></label>
            <input type="range" id="wave-height" min="0.5" max="5" step="0.1" value="2.0">
        </div>
        <div class="control-group">
            <label>Frequency: <span class="control-value" id="frequency-value">2</span></label>
            <input type="range" id="frequency" min="1" max="5" step="1" value="2">
        </div>
    `;
    document.getElementById('controls-container').innerHTML = controlsHTML;

    // Control listeners
    document.getElementById('wave-speed').addEventListener('input', (e) => {
        document.getElementById('wave-speed-value').textContent = e.target.value;
    });
    document.getElementById('wave-height').addEventListener('input', (e) => {
        document.getElementById('wave-height-value').textContent = e.target.value;
    });
    document.getElementById('frequency').addEventListener('input', (e) => {
        document.getElementById('frequency-value').textContent = e.target.value;
    });

    // Animation function
    plane.userData.animate = (deltaTime) => {
        const speed = parseFloat(document.getElementById('wave-speed').value);
        const height = parseFloat(document.getElementById('wave-height').value);
        const frequency = parseInt(document.getElementById('frequency').value);

        plane.userData.time += deltaTime * speed;
        const positions = geometry.attributes.position;

        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getZ(i);
            const distance = Math.sqrt(x * x + z * z);
            const y = Math.sin(distance * frequency * 0.3 - plane.userData.time * 2) * height;
            positions.setY(i, y);
        }

        positions.needsUpdate = true;
        geometry.computeVertexNormals();
    };
}

// Demo 2: Foucault Pendulum
function createPendulum() {
    document.getElementById('demo-title').textContent = '🌍 Foucault Pendulum';
    document.getElementById('demo-description').textContent = "Demonstration of Earth's rotation using a Foucault pendulum";

    // Pendulum string
    const stringGeometry = new THREE.CylinderGeometry(0.05, 0.05, 10, 8);
    const stringMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const string = new THREE.Mesh(stringGeometry, stringMaterial);
    string.position.y = 5;
    scene.add(string);
    demoObjects.push(string);

    // Pendulum bob
    const bobGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const bobMaterial = new THREE.MeshStandardMaterial({
        color: 0xff4444,
        metalness: 0.7,
        roughness: 0.3
    });
    const bob = new THREE.Mesh(bobGeometry, bobMaterial);
    bob.position.y = 0;
    scene.add(bob);
    demoObjects.push(bob);

    // Pivot point
    const pivotGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const pivotMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const pivot = new THREE.Mesh(pivotGeometry, pivotMaterial);
    pivot.position.y = 10;
    scene.add(pivot);
    demoObjects.push(pivot);

    // Ground plane
    const groundGeometry = new THREE.CircleGeometry(15, 64);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -5;
    scene.add(ground);
    demoObjects.push(ground);

    // Pendulum state
    bob.userData.angle = 0.3;
    bob.userData.velocity = 0;
    bob.userData.precession = 0;
    bob.userData.length = 10;

    const controlsHTML = `
        <div class="control-group">
            <label>Latitude: <span class="control-value" id="latitude-value">45°</span></label>
            <input type="range" id="latitude" min="-90" max="90" step="5" value="45">
        </div>
        <div class="control-group">
            <label>Pendulum Length: <span class="control-value" id="length-value">10m</span></label>
            <input type="range" id="length" min="5" max="20" step="1" value="10">
        </div>
    `;
    document.getElementById('controls-container').innerHTML = controlsHTML;

    document.getElementById('latitude').addEventListener('input', (e) => {
        document.getElementById('latitude-value').textContent = e.target.value + '°';
    });
    document.getElementById('length').addEventListener('input', (e) => {
        document.getElementById('length-value').textContent = e.target.value + 'm';
        bob.userData.length = parseFloat(e.target.value);
    });

    bob.userData.animate = (deltaTime) => {
        const g = 9.81;
        const length = bob.userData.length;
        const latitude = parseFloat(document.getElementById('latitude').value) * Math.PI / 180;

        // Simple pendulum physics
        const acceleration = -(g / length) * Math.sin(bob.userData.angle);
        bob.userData.velocity += acceleration * deltaTime;
        bob.userData.angle += bob.userData.velocity * deltaTime;

        // Precession due to Earth's rotation
        const omegaEarth = 7.2921e-5; // Earth's angular velocity
        bob.userData.precession += omegaEarth * Math.sin(latitude) * deltaTime * 1000;

        // Update position
        const x = Math.sin(bob.userData.angle) * length * Math.cos(bob.userData.precession);
        const z = Math.sin(bob.userData.angle) * length * Math.sin(bob.userData.precession);
        const y = -Math.cos(bob.userData.angle) * length + 10;

        bob.position.set(x, y, z);

        // Update string
        string.position.set(x / 2, (y + 10) / 2, z / 2);
        string.lookAt(bob.position);
        string.rotateX(Math.PI / 2);
    };
}

// Demo 3: Double Slit
function createDoubleSlit() {
    document.getElementById('demo-title').textContent = "⚛️ Young's Double Slit";
    document.getElementById('demo-description').textContent = 'Famous quantum experiment showing wave-particle duality';

    // Barrier with slits
    const barrierGeometry = new THREE.BoxGeometry(0.2, 10, 10);
    const barrierMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
    barrier.position.z = 0;
    scene.add(barrier);
    demoObjects.push(barrier);

    // Screen
    const screenGeometry = new THREE.PlaneGeometry(10, 10);
    const screenMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = 10;
    scene.add(screen);
    demoObjects.push(screen);

    // Slits (visual indicators)
    const slitGeometry = new THREE.PlaneGeometry(0.1, 1);
    const slitMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 });

    const slit1 = new THREE.Mesh(slitGeometry, slitMaterial);
    slit1.position.set(0.11, 1, 0);
    scene.add(slit1);
    demoObjects.push(slit1);

    const slit2 = new THREE.Mesh(slitGeometry, slitMaterial);
    slit2.position.set(0.11, -1, 0);
    scene.add(slit2);
    demoObjects.push(slit2);

    // Particle emitter
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = -15;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

        velocities[i * 3] = 5;
        velocities[i * 3 + 1] = 0;
        velocities[i * 3 + 2] = 0;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.userData.velocities = velocities;

    const particlesMaterial = new THREE.PointsMaterial({
        color: 0xff00ff,
        size: 0.1,
        transparent: true,
        opacity: 0.8
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    demoObjects.push(particles);

    const controlsHTML = `
        <div class="control-group">
            <label>Slit Separation: <span class="control-value" id="slit-sep-value">2.0mm</span></label>
            <input type="range" id="slit-sep" min="0.5" max="5" step="0.1" value="2.0">
        </div>
        <div class="control-group">
            <label>Wavelength: <span class="control-value" id="wavelength-value">500nm</span></label>
            <input type="range" id="wavelength" min="400" max="700" step="10" value="500">
        </div>
    `;
    document.getElementById('controls-container').innerHTML = controlsHTML;

    document.getElementById('slit-sep').addEventListener('input', (e) => {
        document.getElementById('slit-sep-value').textContent = e.target.value + 'mm';
        const sep = parseFloat(e.target.value);
        slit1.position.y = sep / 2;
        slit2.position.y = -sep / 2;
    });

    document.getElementById('wavelength').addEventListener('input', (e) => {
        document.getElementById('wavelength-value').textContent = e.target.value + 'nm';
        const wavelength = parseFloat(e.target.value);
        const hue = (wavelength - 400) / 300;
        particlesMaterial.color.setHSL(hue, 1, 0.5);
    });

    particles.userData.animate = (deltaTime) => {
        const positions = particlesGeometry.attributes.position.array;
        const velocities = particlesGeometry.userData.velocities;

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] += velocities[i * 3] * deltaTime;

            // Reset if particle goes past screen
            if (positions[i * 3] > 12) {
                positions[i * 3] = -15;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
            }
        }

        particlesGeometry.attributes.position.needsUpdate = true;
    };
}

// Demo 4: Particle System
function createParticleSystem() {
    document.getElementById('demo-title').textContent = '✨ Particle System';
    document.getElementById('demo-description').textContent = 'GPU-accelerated particle simulation with physics';

    const particleCount = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = Math.random() * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

        velocities[i * 3] = (Math.random() - 0.5) * 2;
        velocities[i * 3 + 1] = Math.random() * -2;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 2;

        colors[i * 3] = Math.random();
        colors[i * 3 + 1] = Math.random();
        colors[i * 3 + 2] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.userData.velocities = velocities;

    const material = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    demoObjects.push(particles);

    const controlsHTML = `
        <div class="control-group">
            <label>Gravity: <span class="control-value" id="gravity-value">9.81</span></label>
            <input type="range" id="gravity" min="0" max="20" step="0.5" value="9.81">
        </div>
        <div class="control-group">
            <label>Particle Count: <span class="control-value" id="count-value">5000</span></label>
            <input type="range" id="count" min="1000" max="10000" step="500" value="5000">
        </div>
    `;
    document.getElementById('controls-container').innerHTML = controlsHTML;

    document.getElementById('gravity').addEventListener('input', (e) => {
        document.getElementById('gravity-value').textContent = e.target.value;
    });
    document.getElementById('count').addEventListener('input', (e) => {
        document.getElementById('count-value').textContent = e.target.value;
    });

    particles.userData.animate = (deltaTime) => {
        const positions = geometry.attributes.position.array;
        const velocities = geometry.userData.velocities;
        const gravity = parseFloat(document.getElementById('gravity').value);

        for (let i = 0; i < particleCount; i++) {
            velocities[i * 3 + 1] -= gravity * deltaTime;

            positions[i * 3] += velocities[i * 3] * deltaTime;
            positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime;
            positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime;

            // Bounce off ground
            if (positions[i * 3 + 1] < -5) {
                positions[i * 3 + 1] = -5;
                velocities[i * 3 + 1] *= -0.8;
            }

            // Reset if too far
            if (positions[i * 3 + 1] < -10) {
                positions[i * 3 + 1] = 20;
                velocities[i * 3 + 1] = 0;
            }
        }

        geometry.attributes.position.needsUpdate = true;
    };
}

// Demo 5: Racing Game
function createRacingGame() {
    document.getElementById('demo-title').textContent = '🏎️ Banking Track Challenge';
    document.getElementById('demo-description').textContent = 'NASCAR physics racing game with banked turns';

    // Track
    const trackGeometry = new THREE.TorusGeometry(10, 2, 16, 100);
    const trackMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.9
    });
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = Math.PI / 2;
    scene.add(track);
    demoObjects.push(track);

    // Car
    const carGeometry = new THREE.BoxGeometry(0.5, 0.3, 1);
    const carMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.set(10, 0, 0);
    scene.add(car);
    demoObjects.push(car);

    // Track markers
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const markerGeometry = new THREE.ConeGeometry(0.2, 0.8, 8);
        const markerMaterial = new THREE.MeshStandardMaterial({
            color: i % 2 === 0 ? 0xff0000 : 0xffffff
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(
            Math.cos(angle) * 10,
            0.4,
            Math.sin(angle) * 10
        );
        scene.add(marker);
        demoObjects.push(marker);
    }

    car.userData.angle = 0;
    car.userData.speed = 5;
    car.userData.lapTime = 0;
    car.userData.laps = 0;

    const controlsHTML = `
        <div class="control-group">
            <label>Speed: <span class="control-value" id="speed-value">5.0</span></label>
            <input type="range" id="speed" min="1" max="15" step="0.5" value="5">
        </div>
        <div class="control-group">
            <label>Banking Angle: <span class="control-value" id="banking-value">30°</span></label>
            <input type="range" id="banking" min="0" max="60" step="5" value="30">
        </div>
        <div class="control-group">
            <label>Laps: <span class="control-value" id="laps-value">0</span></label>
        </div>
    `;
    document.getElementById('controls-container').innerHTML = controlsHTML;

    document.getElementById('speed').addEventListener('input', (e) => {
        document.getElementById('speed-value').textContent = e.target.value;
        car.userData.speed = parseFloat(e.target.value);
    });
    document.getElementById('banking').addEventListener('input', (e) => {
        document.getElementById('banking-value').textContent = e.target.value + '°';
    });

    car.userData.animate = (deltaTime) => {
        car.userData.angle += (car.userData.speed / 10) * deltaTime;
        car.userData.lapTime += deltaTime;

        // Check lap completion
        if (car.userData.angle > Math.PI * 2) {
            car.userData.angle -= Math.PI * 2;
            car.userData.laps++;
            document.getElementById('laps-value').textContent = car.userData.laps;
        }

        const radius = 10;
        car.position.x = Math.cos(car.userData.angle) * radius;
        car.position.z = Math.sin(car.userData.angle) * radius;

        // Face direction of movement
        car.rotation.y = -car.userData.angle + Math.PI / 2;

        // Banking effect
        const banking = parseFloat(document.getElementById('banking').value) * Math.PI / 180;
        car.rotation.z = banking;
    };
}

// Animation loop
function animate() {
    if (!isRunning) return;

    animationId = requestAnimationFrame(animate);

    const deltaTime = 0.016; // ~60 FPS
    frameCount++;

    // Update FPS
    const now = performance.now();
    if (now - lastFpsUpdate > 500) {
        currentFps = Math.round((frameCount / (now - startTime)) * 1000);
        document.getElementById('fps').textContent = currentFps;
        lastFpsUpdate = now;
    }

    // Update stats
    const elapsed = (now - startTime) / 1000;
    document.getElementById('elapsed').textContent = elapsed.toFixed(1) + 's';
    document.getElementById('frames').textContent = frameCount;

    // Animate demo objects
    demoObjects.forEach(obj => {
        if (obj.userData.animate) {
            obj.userData.animate(deltaTime);
        }
    });

    // Render
    renderer.render(scene, camera);
}

function startSimulation() {
    if (isRunning) return;

    isRunning = true;
    startTime = performance.now();
    frameCount = 0;
    lastFpsUpdate = startTime;

    document.getElementById('start-btn').disabled = true;
    document.getElementById('pause-btn').disabled = false;

    animate();
}

function pauseSimulation() {
    isRunning = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    document.getElementById('start-btn').disabled = false;
    document.getElementById('pause-btn').disabled = true;
}

function resetSimulation() {
    pauseSimulation();
    frameCount = 0;
    document.getElementById('elapsed').textContent = '0.0s';
    document.getElementById('frames').textContent = '0';
    document.getElementById('fps').textContent = '0';

    loadDemo(currentDemo);
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', init);
