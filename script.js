// ============================================================================
// 1. PERSIAPAN PANGGUNG 3D (SCENE, CAMERA, RENDERER, CONTROLS)
// ============================================================================
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

// Kamera diatur agar sudut pandang jam terlihat jelas dari depan-atas
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 7, 13);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.0;

// Pencahayaan studio mewah (tidak terlalu silau agar tidak putih polos)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambientLight);

const dirLight1 = new THREE.DirectionalLight(0xfff5e1, 1.1);
dirLight1.position.set(8, 15, 10);
scene.add(dirLight1);

const dirLight2 = new THREE.DirectionalLight(0x52b788, 0.45);
dirLight2.position.set(-10, -8, -8);
scene.add(dirLight2);

const pointLight = new THREE.PointLight(0xe9c46a, 0.6, 25);
pointLight.position.set(0, 5, 8);
scene.add(pointLight);

// ============================================================================
// 2. DATA 7 LAPISAN JAM & PARAMETER POSISI (BISA DISESUAIKAN)
// ============================================================================
// PARAMETER PENTING:
// - baseY    : Posisi tumpukan asli saat 0% OPEN (agar jam terlihat utuh & rapi)
// - explodeY : Jarak tambahan saat dibedah 100% OPEN
const OPACITY_SAAT_REDUP = 0.12; // Seberapa transparan bagian yang TIDAK dipilih (0.05 - 0.3)
const WARNA_HIGHLIGHT = 0x2b583a; // Pendaran cahaya tipis pada bagian yang dipilih

const layerInfos = [
    {
        title: "L01 // MONOBLOC SAPPHIRE & CYCLOPS",
        desc: "Kaca kristal safir sintetis anti-gores dengan lapisan anti-reflektif ganda dan lensa pembesar Cyclops 2.5x di atas jendela tanggal.",
        baseY: 0.32,
        explodeY: 4.0
    },
    {
        title: "L02 // FLUTED 18K CERACHROM BEZEL",
        desc: "Cincin bezel putar satu arah (120-klik) dengan sisipan keramik Cerachrom tahan korosi dan gerigi tepi (knurling) untuk cengkeraman optimal.",
        baseY: 0.22,
        explodeY: 2.6
    },
    {
        title: "L03 // DIAMOND FACETED 3D HANDS",
        desc: "Jarum jam, menit, dan detik bergaya Mercedes Tri-Star berlapis emas 18 karat dengan pendaran Chromalight di tempat gelap.",
        baseY: 0.15,
        explodeY: 1.5
    },
    {
        title: "L04 // SUNBURST DIAL & REHAUT",
        desc: "Pelat permukaan jam (Dial) dengan efek pantulan cahaya matahari (sunburst), indeks penanda jam luminescent, dan cincin dalam bertuliskan ROLEX.",
        baseY: 0.05,
        explodeY: 0.4
    },
    {
        title: "L05 // 31-DAY DATE DISC & STONES",
        desc: "Cakram kalender mekanis dengan 31 angka tanggal yang melompat secara instan tepat pada tengah malam.",
        baseY: -0.05,
        explodeY: -0.8
    },
    {
        title: "L06 // LATHED OYSTER CASE & BRACELET",
        desc: "Bodi utama Oyster 41mm dari baja Oystersteel 904L, lengkap dengan pemutar Triplock Crown di samping dan rantai gelang 5-baris.",
        baseY: 0.0,
        explodeY: -2.1
    },
    {
        title: "L07 // CALIBRE 3235 INVOLUTE GEARS",
        desc: "Mesin penggerak mekanis otomatis Calibre 3235 dengan roda gigi merah muda (reversing wheels), balance wheel, dan rotor Perpetual.",
        baseY: -0.25,
        explodeY: -3.6
    }
];

const watchRoot = new THREE.Group();
// Kemiringan jam agar tampak elegan menghadap kamera
watchRoot.rotation.x = 0.75;
scene.add(watchRoot);

const layerGroups = [];
for (let i = 0; i < 7; i++) {
    const grp = new THREE.Group();
    grp.position.y = layerInfos[i].baseY;
    watchRoot.add(grp);
    layerGroups.push(grp);
}

// ============================================================================
// 3. TEKSTUR KANVAS 2D (DIAL, BEZEL, DAN CAKRAM TANGGAL)
// ============================================================================
function createDialTexture(bgColorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Efek gradasi Sunburst di tengah Dial
    const grad = ctx.createRadialGradient(256, 256, 10, 256, 256, 256);
    grad.addColorStop(0, '#8e8a83');
    grad.addColorStop(1, bgColorHex);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#ffffff';
    ctx.translate(256, 256);
    for (let i = 0; i < 60; i++) {
        ctx.beginPath();
        ctx.lineWidth = (i % 5 === 0) ? 3 : 1.2;
        const len = (i % 5 === 0) ? 16 : 9;
        ctx.moveTo(0, -232);
        ctx.lineTo(0, -232 + len);
        ctx.stroke();
        ctx.rotate(Math.PI / 30);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px serif';
    ctx.textAlign = 'center';
    ctx.fillText('♛', 0, -135);
    ctx.fillText('ROLEX', 0, -108);
    ctx.font = '11px monospace';
    ctx.fillText('OYSTER PERPETUAL DATE', 0, -90);

    ctx.fillStyle = '#e9c46a';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('SUBMARINER', 0, 90);
    ctx.fillStyle = '#d8e2dc';
    ctx.font = '11px monospace';
    ctx.fillText('1000ft = 300m', 0, 108);
    ctx.fillText('SUPERLATIVE CHRONOMETER', 0, 124);
    ctx.fillText('OFFICIALLY CERTIFIED', 0, 138);

    // Lubang transparan semu di posisi jam 3 untuk menampilkan tanggal
    ctx.fillStyle = '#f4f1ea';
    ctx.fillRect(130, -22, 65, 44);
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 26px monospace';
    ctx.fillText(String(currentDateNumber), 162, 8);

    return new THREE.CanvasTexture(canvas);
}

function createBezelTexture(bezelHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bezelHex;
    ctx.fillRect(0, 0, 512, 512);

    ctx.translate(256, 256);
    ctx.fillStyle = '#f1faee';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < 12; i++) {
        const angle = (i * 30) * Math.PI / 180;
        ctx.save();
        ctx.rotate(angle);
        if (i === 0) {
            ctx.fillText('▼', 0, -210);
        } else if (i % 2 === 0) {
            ctx.fillText((i * 5).toString(), 0, -210);
        } else {
            ctx.fillRect(-4, -222, 8, 22);
        }
        ctx.restore();
    }
    return new THREE.CanvasTexture(canvas);
}

let currentDateNumber = 14;
let currentDialHex = '#4a4742';

function createDateTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f4f1ea';
    ctx.fillRect(0, 0, 512, 512);

    ctx.translate(256, 256);
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 26px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < 16; i++) {
        ctx.save();
        ctx.rotate((i * 22.5) * Math.PI / 180);
        const num = ((currentDateNumber + i - 1) % 31) + 1;
        ctx.fillText(num.toString(), 185, 0);
        ctx.restore();
    }
    return new THREE.CanvasTexture(canvas);
}

// ============================================================================
// 4. PEMBUATAN MATERIAL & RAKITAN 7 LAPISAN JAM TANGAN
// ============================================================================
const baseMaterials = {
    steel: new THREE.MeshStandardMaterial({ color: 0xd8d5ce, metalness: 0.65, roughness: 0.3 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.75, roughness: 0.25 }),
    dial: new THREE.MeshStandardMaterial({ map: createDialTexture(currentDialHex), metalness: 0.3, roughness: 0.4 }),
    bezelInsert: new THREE.MeshStandardMaterial({ map: createBezelTexture('#7a756c'), metalness: 0.3, roughness: 0.25 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xdff6ff, transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.1, depthWrite: false }),
    lume: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x1b4332, emissiveIntensity: 0.25, roughness: 0.2 }),
    dateDisc: new THREE.MeshStandardMaterial({ map: createDateTexture(), roughness: 0.4 }),
    rubyGear: new THREE.MeshStandardMaterial({ color: 0xd93870, metalness: 0.5, roughness: 0.3 }),
    brassGear: new THREE.MeshStandardMaterial({ color: 0xe9c46a, metalness: 0.75, roughness: 0.25 })
};

// Fungsi pembantu untuk menambahkan komponen ke dalam Lapisan tertentu
// Setiap komponen diberi material miliknya sendiri (clone) agar bisa di-highlight terpisah!
const allWatchMeshes = [];
function addPartToLayer(layerIdx, geometry, baseMatKey) {
    const mat = baseMaterials[baseMatKey].clone();
    mat.userData = {
        baseKey: baseMatKey,
        defaultOpacity: (baseMatKey === 'glass') ? 0.22 : 1.0,
        defaultTransparent: (baseMatKey === 'glass')
    };
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.userData = { layerIndex: layerIdx };
    layerGroups[layerIdx].add(mesh);
    allWatchMeshes.push(mesh);
    return mesh;
}

// --- LAPISAN 01: Kaca Safir & Lensa Cyclops ---
addPartToLayer(0, new THREE.CylinderGeometry(2.42, 2.42, 0.06, 64), 'glass');
const cyclops = addPartToLayer(0, new THREE.BoxGeometry(0.62, 0.1, 0.48), 'glass');
cyclops.position.set(1.55, 0.06, 0);

// --- LAPISAN 02: Cincin Bezel (Berlubang di tengah agar Dial terlihat!) ---
const bezelGroup = new THREE.Group();
layerGroups[1].add(bezelGroup);

function addBezelPart(geo, matKey) {
    const mat = baseMaterials[matKey].clone();
    mat.userData = { baseKey: matKey, defaultOpacity: 1.0, defaultTransparent: false };
    const m = new THREE.Mesh(geo, mat);
    m.userData = { layerIndex: 1 };
    bezelGroup.add(m);
    allWatchMeshes.push(m);
    return m;
}

// Cincin keramik atas Bezel
const bezelTopGeo = new THREE.RingGeometry(2.38, 3.05, 64);
bezelTopGeo.rotateX(-Math.PI / 2);
const bezelTop = addBezelPart(bezelTopGeo, 'bezelInsert');
bezelTop.position.y = 0.08;

// Sabuk luar Bezel
const bezelRim = addBezelPart(new THREE.TorusGeometry(3.05, 0.09, 16, 64), 'steel');
bezelRim.rotation.x = Math.PI / 2;

// Gerigi emas di tepi Bezel
for (let i = 0; i < 60; i++) {
    const tooth = addBezelPart(new THREE.BoxGeometry(0.07, 0.16, 0.1), 'gold');
    const angle = (i / 60) * Math.PI * 2;
    tooth.position.set(Math.cos(angle) * 3.12, 0, Math.sin(angle) * 3.12);
    tooth.rotation.y = -angle;
}

// --- LAPISAN 03: Jarum Jam 3D ---
const hourHand = new THREE.Group();
const hMesh = addPartToLayer(2, new THREE.BoxGeometry(0.16, 0.03, 1.3), 'gold');
hMesh.position.z = -0.45;
hourHand.add(hMesh);
layerGroups[2].add(hourHand);

const minHand = new THREE.Group();
const mMesh = addPartToLayer(2, new THREE.BoxGeometry(0.11, 0.03, 1.85), 'gold');
mMesh.position.z = -0.75;
minHand.position.y = 0.03;
minHand.add(mMesh);
layerGroups[2].add(minHand);

const secHand = new THREE.Group();
const sMesh = addPartToLayer(2, new THREE.BoxGeometry(0.035, 0.02, 2.05), 'gold');
sMesh.position.z = -0.8;
secHand.position.y = 0.06;
secHand.add(sMesh);
layerGroups[2].add(secHand);

// Poros tengah jarum jam
addPartToLayer(2, new THREE.CylinderGeometry(0.14, 0.14, 0.12, 24), 'gold');

// --- LAPISAN 04: Sunburst Dial & Indeks Jam ---
addPartToLayer(3, new THREE.CylinderGeometry(2.42, 2.42, 0.05, 64), 'dial');

// Rehaut (dinding cincin dalam di pinggir dial)
const rehaut = addPartToLayer(3, new THREE.TorusGeometry(2.42, 0.08, 16, 64), 'steel');
rehaut.rotation.x = Math.PI / 2;
rehaut.position.y = 0.06;

// Indeks Penanda Jam Timbul
for (let i = 0; i < 12; i++) {
    if (i === 3) continue; // Jam 3 untuk tanggal
    const angle = (i * 30) * Math.PI / 180;
    let markerGeo;
    if (i === 0) {
        markerGeo = new THREE.ConeGeometry(0.2, 0.06, 3);
    } else if (i === 6 || i === 9) {
        markerGeo = new THREE.BoxGeometry(0.15, 0.06, 0.35);
    } else {
        markerGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.06, 24);
    }
    const marker = addPartToLayer(3, markerGeo, 'lume');
    marker.position.set(Math.sin(angle) * 1.85, 0.04, -Math.cos(angle) * 1.85);
    marker.rotation.y = -angle;
}

// Bingkai emas jendela tanggal di posisi jam 3
const dateFrame = addPartToLayer(3, new THREE.BoxGeometry(0.55, 0.06, 0.42), 'gold');
dateFrame.position.set(1.55, 0.02, 0);

// --- LAPISAN 05: Cakram Tanggal 31-Hari ---
const dateRingGeo = new THREE.RingGeometry(1.3, 2.25, 64);
dateRingGeo.rotateX(-Math.PI / 2);
const dateDiscMesh = addPartToLayer(4, dateRingGeo, 'dateDisc');

// --- LAPISAN 06: Casing Oyster Berongga & Rantai Gelang ---
// Casing dibuat berlubang di tengah (Torus tebal) agar TIDAK menelan Dial saat 0% OPEN!
const caseBody = addPartToLayer(5, new THREE.TorusGeometry(2.78, 0.38, 24, 64), 'steel');
caseBody.rotation.x = Math.PI / 2;
caseBody.scale.set(1, 1, 0.85);

// 4 Lug (Bahu penyambung casing ke rantai)
const lugPositions = [
    { x: -1.8, z: -2.8, rot: 0.2 },
    { x: 1.8, z: -2.8, rot: -0.2 },
    { x: -1.8, z: 2.8, rot: -0.2 },
    { x: 1.8, z: 2.8, rot: 0.2 }
];
lugPositions.forEach(lp => {
    const lug = addPartToLayer(5, new THREE.BoxGeometry(0.55, 0.42, 1.1), 'steel');
    lug.position.set(lp.x, -0.05, lp.z);
    lug.rotation.y = lp.rot;
});

// Crown Pemutar Jam di Samping Kanan
const crown = addPartToLayer(5, new THREE.CylinderGeometry(0.32, 0.32, 0.42, 24), 'gold');
crown.rotation.z = Math.PI / 2;
crown.position.set(3.32, -0.02, 0);

// Rantai Gelang (Bracelet) Atas & Bawah
function buildBracelet(dirZ) {
    for (let row = 0; row < 6; row++) {
        const zPos = dirZ * (3.25 + row * 0.56);
        const yCurve = -0.08 - Math.pow(row * 0.22, 1.7);
        const widthScale = 1 - (row * 0.035);

        for (let col = -2; col <= 2; col++) {
            const isCenter = (col === 0);
            const link = addPartToLayer(5, new THREE.BoxGeometry(0.6 * widthScale, 0.24, 0.48), isCenter ? 'gold' : 'steel');
            link.position.set(col * 0.65 * widthScale, yCurve, zPos);
            link.rotation.x = dirZ * (row * 0.07);
        }
    }
}
buildBracelet(1);
buildBracelet(-1);

// --- LAPISAN 07: Mesin Calibre 3235, Roda Gigi & Rotor ---
addPartToLayer(6, new THREE.CylinderGeometry(2.3, 2.3, 0.12, 64), 'steel');

const gear1 = addPartToLayer(6, new THREE.CylinderGeometry(0.52, 0.52, 0.18, 24), 'rubyGear');
gear1.position.set(-0.65, 0.1, 0.45);

const gear2 = addPartToLayer(6, new THREE.CylinderGeometry(0.42, 0.42, 0.18, 20), 'rubyGear');
gear2.position.set(0.3, 0.1, 0.75);

const balanceWheel = addPartToLayer(6, new THREE.TorusGeometry(0.48, 0.05, 16, 32), 'brassGear');
balanceWheel.rotation.x = Math.PI / 2;
balanceWheel.position.set(0.75, 0.12, -0.55);

const rotorGeo = new THREE.CylinderGeometry(2.15, 2.15, 0.08, 32, 1, false, 0, Math.PI);
const rotorMesh = addPartToLayer(6, rotorGeo, 'steel');
rotorMesh.position.y = -0.18;

const caseBack = addPartToLayer(6, new THREE.TorusGeometry(2.4, 0.2, 16, 64), 'steel');
caseBack.rotation.x = Math.PI / 2;
caseBack.position.y = -0.35;

// ============================================================================
// 5. LOGIKA HIGHLIGHT BAGIAN JAM & TOMBOL INTERAKTIF
// ============================================================================
let targetExplode = 0;
let currentExplode = 0;
let autoAnimateExplode = false;
let animDirection = 1;
let currentShadingMode = 'pbr'; // 'pbr', 'wire', atau 'xray'
let selectedLayerIndex = 'all'; // 'all' atau angka 0 - 6

const slider = document.getElementById('explode-slider');
const explodePct = document.getElementById('explode-pct');
const btnExplode = document.getElementById('btn-explode');
const btnAnimateLayers = document.getElementById('btn-animate-layers');

function updateExplodeUI(val) {
    slider.value = Math.round(val * 100);
    explodePct.innerText = `${Math.round(val * 100)}% OPEN`;
}

// Fungsi Utama untuk Mengatur Tampilan Material & Efek Highlight Bagian Jam
function applyVisualState() {
    allWatchMeshes.forEach(mesh => {
        const mat = mesh.material;
        const mLayer = mesh.userData.layerIndex;

        // 1. Atur mode Wireframe / X-Ray terlebih dahulu
        if (currentShadingMode === 'wire') {
            mat.wireframe = true;
        } else {
            mat.wireframe = false;
        }

        // 2. Jika pilih "ALL" (Overall Watch View) -> Tampilkan Normal Tanpa Highlight!
        if (selectedLayerIndex === 'all') {
            if (mat.emissive && mat.userData.baseKey !== 'lume') {
                mat.emissive.setHex(0x000000);
            }
            if (currentShadingMode === 'xray') {
                mat.transparent = true;
                mat.opacity = 0.25;
            } else {
                mat.transparent = mat.userData.defaultTransparent;
                mat.opacity = mat.userData.defaultOpacity;
            }
        } 
        // 3. Jika memilih salah satu tab bagian jam (0 - 6) -> HIGHLIGHT bagian itu saja!
        else {
            if (mLayer === selectedLayerIndex) {
                // Bagian yang dipilih: Tampilkan terang, jelas, dan beri sedikit efek cahaya
                mat.transparent = (mat.userData.baseKey === 'glass');
                mat.opacity = (mat.userData.baseKey === 'glass') ? 0.65 : 1.0;
                if (mat.emissive && mat.userData.baseKey !== 'lume') {
                    mat.emissive.setHex(WARNA_HIGHLIGHT);
                }
            } else {
                // Bagian yang TIDAK dipilih: Redupkan menjadi transparan (hantu)
                mat.transparent = true;
                mat.opacity = OPACITY_SAAT_REDUP;
                if (mat.emissive && mat.userData.baseKey !== 'lume') {
                    mat.emissive.setHex(0x000000);
                }
            }
        }
        mat.needsUpdate = true;
    });
}

// Event Slider & Tombol Explode
slider.addEventListener('input', (e) => {
    autoAnimateExplode = false;
    btnAnimateLayers.classList.remove('active-gold');
    targetExplode = e.target.value / 100;
    explodePct.innerText = `${e.target.value}% OPEN`;
});

btnExplode.addEventListener('click', () => {
    autoAnimateExplode = false;
    btnAnimateLayers.classList.remove('active-gold');
    targetExplode = (targetExplode > 0.5) ? 0 : 1;
    btnExplode.classList.toggle('active-gold', targetExplode === 1);
    updateExplodeUI(targetExplode);
});

btnAnimateLayers.addEventListener('click', () => {
    autoAnimateExplode = !autoAnimateExplode;
    btnAnimateLayers.classList.toggle('active-gold', autoAnimateExplode);
});

const btnOrbit = document.getElementById('btn-orbit');
btnOrbit.addEventListener('click', () => {
    controls.autoRotate = !controls.autoRotate;
    btnOrbit.innerText = controls.autoRotate ? "Auto-Orbit [ON]" : "Auto-Orbit [OFF]";
    btnOrbit.classList.toggle('active-gold', controls.autoRotate);
});

// Navigasi Panel Kiri (Pemilihan Bagian Jam)
const layerItems = document.querySelectorAll('.layer-item');
const btnOverall = document.getElementById('btn-overall');
const noteTitle = document.getElementById('note-title');
const noteDesc = document.getElementById('note-desc');
const layerStatus = document.getElementById('layer-status');

function selectLayer(index) {
    selectedLayerIndex = index;
    layerItems.forEach(item => item.classList.remove('active'));

    if (index === 'all') {
        btnOverall.classList.add('active');
        layerStatus.innerText = "// ALL LAYERS";
        noteTitle.innerText = "PARAMETRIC CAD NOTES";
        noteDesc.innerText = "Menampilkan keseluruhan rakitan 7 lapisan Rolex Submariner. Gunakan slider di kanan untuk membedah mesin.";
    } else {
        btnOverall.classList.remove('active');
        layerItems[index].classList.add('active');
        const info = layerInfos[index];
        layerStatus.innerText = `// LAYER 0${index + 1}`;
        noteTitle.innerText = info.title;
        noteDesc.innerText = info.desc;
    }

    // Terapkan efek Highlight hanya pada bagian yang dipilih
    applyVisualState();
}

btnOverall.addEventListener('click', () => selectLayer('all'));
layerItems.forEach((item) => {
    item.addEventListener('click', () => {
        const idx = parseInt(item.getAttribute('data-layer'));
        selectLayer(idx);
    });
});

// Mode Shading (PBR Luxury, Mesh / Wire, X-Ray Ghost)
const modeBtns = document.querySelectorAll('.mode-btn');
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active-gold'));
        btn.classList.add('active-gold');
        currentShadingMode = btn.getAttribute('data-mode');
        applyVisualState();
    });
});

// Warna Tema (Bespoke Colorway)
const colorBtns = document.querySelectorAll('.color-btn');
const activeSpec = document.getElementById('active-spec');
const colorThemes = {
    steel: { gold: 0xd4af37, dial: '#4a4742', bezel: '#7a756c', spec: '18K EVEROSE GOLD & 904L STEEL' },
    green: { gold: 0xd8d5ce, dial: '#163d24', bezel: '#2b7a4b', spec: 'GREEN CERACHROM HULK EDITION' },
    black: { gold: 0xc88a65, dial: '#141414', bezel: '#1f1f1f', spec: '18K EVEROSE BLACK SUBMARINER' },
    blue:  { gold: 0xdbe4ee, dial: '#3b6985', bezel: '#244254', spec: '950 PLATINUM ICE BLUE DIAL' }
};

colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('active-gold'));
        btn.classList.add('active-gold');
        const themeKey = btn.getAttribute('data-theme');
        const t = colorThemes[themeKey];
        currentDialHex = t.dial;

        const newDialTex = createDialTexture(t.dial);
        const newBezelTex = createBezelTexture(t.bezel);

        allWatchMeshes.forEach(m => {
            const key = m.material.userData.baseKey;
            if (key === 'gold') m.material.color.setHex(t.gold);
            if (key === 'dial') m.material.map = newDialTex;
            if (key === 'bezelInsert') m.material.map = newBezelTex;
        });
        activeSpec.innerText = t.spec;
    });
});

// Komplikasi Horologi (Putar Bezel & Tambah Tanggal)
let targetBezelRot = 0;
document.getElementById('btn-bezel-click').addEventListener('click', () => {
    targetBezelRot += (Math.PI * 2) / 24;
});

document.querySelectorAll('.quick-focus').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        if (target === 'all') {
            selectLayer('all');
            targetExplode = 0;
            updateExplodeUI(0);
        } else if (target === '4') {
            currentDateNumber = (currentDateNumber % 31) + 1;
            const newDateTex = createDateTexture();
            const newDialTex = createDialTexture(currentDialHex);
            allWatchMeshes.forEach(m => {
                if (m.material.userData.baseKey === 'dateDisc') m.material.map = newDateTex;
                if (m.material.userData.baseKey === 'dial') m.material.map = newDialTex;
            });
            btn.innerText = `Tanggal (${currentDateNumber}): +1`;
        } else {
            selectLayer(parseInt(target));
        }
    });
});

// ============================================================================
// 6. LOOP ANIMASI REAL-TIME
// ============================================================================
const clockEl = document.getElementById('live-clock');

function animate() {
    requestAnimationFrame(animate);

    // 1. Update Jam Digital & Putaran Jarum Jam
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    clockEl.innerText = `${hrs}:${mins}:${secs}`;

    const smoothSec = now.getSeconds() + now.getMilliseconds() / 1000;
    const smoothMin = now.getMinutes() + smoothSec / 60;
    const smoothHr = (now.getHours() % 12) + smoothMin / 60;

    secHand.rotation.y = -(smoothSec / 60) * Math.PI * 2;
    minHand.rotation.y = -(smoothMin / 60) * Math.PI * 2;
    hourHand.rotation.y = -(smoothHr / 12) * Math.PI * 2;

    // 2. Putar Roda Gigi Mesin & Rotor di Lapisan 07
    gear1.rotation.y += 0.02;
    gear2.rotation.y -= 0.025;
    rotorMesh.rotation.y += 0.015;
    balanceWheel.rotation.z = Math.sin(Date.now() * 0.015) * 0.25;

    // 3. Animasi Putar Bezel
    bezelGroup.rotation.y += (targetBezelRot - bezelGroup.rotation.y) * 0.1;

    // 4. Animasi Otomatis Bedah Layer
    if (autoAnimateExplode) {
        targetExplode += 0.006 * animDirection;
        if (targetExplode >= 1) {
            targetExplode = 1;
            animDirection = -1;
        } else if (targetExplode <= 0) {
            targetExplode = 0;
            animDirection = 1;
        }
        updateExplodeUI(targetExplode);
    }

    // 5. Posisi setiap layer = Posisi Dasar (baseY) + Jarak Bedah (explodeY * currentExplode)
    // Inilah rahasianya kenapa saat 0% OPEN jam tangan tetap rapi dan tidak saling menelan!
    currentExplode += (targetExplode - currentExplode) * 0.08;
    for (let i = 0; i < 7; i++) {
        layerGroups[i].position.y = layerInfos[i].baseY + (layerInfos[i].explodeY * currentExplode);
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
