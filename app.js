let scene, camera, renderer, controls;
let engine = new PhysicsEngine();
let visualScale = 1e-9; // Escala para Three.js (metros a unidades de escena)
let isPaused = false;
let timeScale = 10000;
let meshes = {};
let spacecraft = null;

// Inicialización
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, 500, 500);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    
    // Luces
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 2, 10000);
    scene.add(pointLight);

    initSolarSystem();
    
    setupUI();
    animate();
}

function initSolarSystem() {
    engine.bodies = [];
    meshes = {};
    while(scene.children.length > 2) { scene.remove(scene.children[scene.children.length - 1]); }

    SOLAR_SYSTEM.forEach(data => {
        let body = {
            id: data.name,
            mass: data.mass,
            radius: data.radius,
            x: data.distance,
            y: 0,
            z: 0,
            vx: 0,
            vy: 0,
            vz: data.velocity,
            ax: 0, ay: 0, az: 0
        };
        engine.addBody(body);

        // Representación visual
        let geoSize = data.name === "Sol" ? data.radius * visualScale * 20 : data.radius * visualScale * 500; // Escala visual exagerada
        let geometry = new THREE.SphereGeometry(geoSize, 32, 32);
        let material = new THREE.MeshBasicMaterial({ color: data.color });
        let mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { id: data.name };
        scene.add(mesh);
        meshes[data.name] = mesh;
        
        // Dibujar órbita (estática visual)
        if(data.distance > 0) {
            let orbitGeo = new THREE.RingGeometry(data.distance*visualScale - 0.5, data.distance*visualScale + 0.5, 64);
            let orbitMat = new THREE.MeshBasicMaterial({ color: 0x444444, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
            let orbit = new THREE.Mesh(orbitGeo, orbitMat);
            orbit.rotation.x = Math.PI / 2;
            scene.add(orbit);
        }
    });

    engine.calculateForces();
    engine.initialEnergy = engine.getTotalEnergy();
}

function launchSpacecraft(vRelative, angleDeg) {
    let earth = engine.bodies.find(b => b.id === "Tierra");
    let angleRad = angleDeg * (Math.PI / 180);
    
    // vRelative en km/s a m/s
    let vRel_ms = vRelative * 1000;
    
    let ship = {
        id: "Nave",
        mass: 5000,
        radius: 10,
        x: earth.x + (earth.radius + 1000000), // Ligeramente fuera de la Tierra
        y: 0,
        z: earth.z,
        vx: earth.vx + (vRel_ms * Math.cos(angleRad)),
        vy: earth.vy,
        vz: earth.vz + (vRel_ms * Math.sin(angleRad)),
        ax: 0, ay: 0, az: 0
    };
    
    engine.addBody(ship);
    spacecraft = ship;

    let geometry = new THREE.SphereGeometry(2, 8, 8);
    let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    let mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshes["Nave"] = mesh;
    
    document.getElementById('mission-desc').innerText = "¡Nave lanzada! Observa su trayectoria física calculada mediante la gravedad del Sol y los planetas.";
}

function setupUI() {
    document.getElementById('btn-pause').onclick = () => isPaused = true;
    document.getElementById('btn-play').onclick = () => isPaused = false;
    document.getElementById('time-scale').onchange = (e) => timeScale = parseInt(e.target.value);
    
    document.getElementById('nav-reset').onclick = initSolarSystem;
    
    let sliderVel = document.getElementById('slider-vel');
    let sliderAngle = document.getElementById('slider-angle');
    sliderVel.oninput = () => document.getElementById('val-vel').innerText = sliderVel.value;
    sliderAngle.oninput = () => document.getElementById('val-angle').innerText = sliderAngle.value;

    document.getElementById('nav-launch').onclick = () => {
        document.getElementById('launch-panel').classList.remove('hidden');
    };
    document.getElementById('btn-close-launch').onclick = () => {
        document.getElementById('launch-panel').classList.add('hidden');
    };
    document.getElementById('btn-launch').onclick = () => {
        launchSpacecraft(parseFloat(sliderVel.value), parseFloat(sliderAngle.value));
        document.getElementById('launch-panel').classList.add('hidden');
    };

    // Raycaster para seleccionar planetas
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    window.addEventListener('click', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children);
        
        if(intersects.length > 0) {
            let obj = intersects[0].object;
            if(obj.userData.id) {
                showInfo(obj.userData.id);
            }
        }
    });

    document.getElementById('btn-close-info').onclick = () => document.getElementById('info-panel').classList.add('hidden');
}

function showInfo(id) {
    let body = engine.bodies.find(b => b.id === id);
    if(!body) return;
    
    document.getElementById('info-name').innerText = body.id;
    document.getElementById('info-mass').innerText = body.mass.toExponential(2);
    document.getElementById('info-radius').innerText = body.radius;
    document.getElementById('info-dist').innerText = (Math.sqrt(body.x**2 + body.y**2 + body.z**2) / CONSTANTS.AU).toFixed(4);
    
    let vel = Math.sqrt(body.vx**2 + body.vy**2 + body.vz**2) / 1000;
    document.getElementById('info-vel').innerText = vel.toFixed(2);
    
    document.getElementById('info-panel').classList.remove('hidden');
    
    if(id === "Tierra" && document.getElementById('mission-desc').innerText.includes("Misión 1")) {
        document.getElementById('mission-desc').innerText = "Misión completada. Misión 2: Abre el panel de lanzamiento e intenta escapar de la órbita de la Tierra modificando la velocidad y el ángulo.";
    }
}

function updatePhysics() {
    if (isPaused) return;
    
    // Sub-steps para estabilidad numérica en integradores
    const dt = (1/60) * timeScale; 
    const subSteps = 10;
    const stepDt = dt / subSteps;
    
    for(let i=0; i<subSteps; i++) {
        engine.step(stepDt);
    }

    // Actualizar Mallas 3D
    engine.bodies.forEach(b => {
        if(meshes[b.id]) {
            meshes[b.id].position.set(b.x * visualScale, b.y * visualScale, b.z * visualScale);
        }
    });

    // Monitorizar Energía
    let currentEnergy = engine.getTotalEnergy();
    let error = Math.abs((currentEnergy - engine.initialEnergy) / engine.initialEnergy) * 100;
    document.getElementById('energy-val').innerText = (100 - error).toFixed(4) + "%";
}

function animate() {
    requestAnimationFrame(animate);
    updatePhysics();
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
