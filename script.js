// ============================================================================
// 1. PERSIAPAN PANGGUNG 3D (SCENE, CAMERA, RENDERER, CONTROLS)
// ============================================================================
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

// Kamera untuk melihat objek 3D
const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 6, 15);

// Renderer untuk menggambar 3D ke layar
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// OrbitControls supaya pengguna bisa memutar dan zoom jam dengan mouse
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.0;

// Pencahayaan agar jam tangan terlihat mengkilap seperti logam mewah
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const dirLight1 = new THREE.DirectionalLight(0xfff5e1, 1.4);
dirLight1.position.set(10, 15, 12);
scene.add(dirLight1);

const dirLight2 = new THREE.DirectionalLight(0x52b788, 0.6);
dirLight2.position.set(-10, -10, -8);
scene.add(dirLight2);

// ============================================================================
// 2. DATA 7 LAPISAN ANATOMI JAM & VARIABEL PENGATUR (PARAMETER)
// ============================================================================
// Kamu bisa mengubah angka 'explodeY' di bawah ini untuk mengatur seberapa jauh
// masing-masing komponen terpisah saat tombol Bedah Layer ditekan!
const layerInfos = [
    {
        title: "L01 // MONOBLOC SAPPHIRE & CYCLOPS",
        desc: "Kaca kristal safir sintetis anti-gores dengan lapisan anti-reflektif ganda dan lensa pembesar Cyclops 2.5x di atas jendela tanggal.",
        explodeY: 4.2,
        camOffset: { x: 2, y: 5, z: 7 }
    },
    {
        title: "L02 // FLUTED 18K CERACHROM BEZEL",
        desc: "Cincin bezel putar satu arah (120-klik) dengan sisipan keramik Cerachrom tahan korosi dan gerigi tepi (knurling) untuk cengkeraman optimal.",
        explodeY: 2.8,
        camOffset: { x: 0, y: 4, z: 8 }
    },
    {
        title: "L03 // DIAMOND FACETED 3D HANDS",
        desc: "Jarum jam, menit, dan detik bergaya Mercedes Tri-Star berlapis emas 18 karat dengan pendaran Chromalight biru di tempat gelap.",
        explodeY: 1.6,
        camOffset: { x: 0, y: 2, z: 6 }
    },
    {
        title: "L04 // SUNBURST DIAL & REHAUT",
        desc: "Pelat permukaan jam (Dial) dengan efek pantulan cahaya matahari (sunburst), indeks penanda jam luminescent, dan cincin dalam bertuliskan ROLEX.",
        explodeY: 0.5,
        camOffset: { x: 0, y: 2, z: 7 }
    },
    {
        title: "L05 // 31-DAY DATE DISC & STONES",
        desc: "Cakram kalender mekanis dengan 31 angka tanggal yang melompat secara instan tepat pada tengah malam.",
        explodeY: -0.8,
        camOffset: { x: 2, y: -1, z: 7 }
    },
    {
        title: "L06 // LATHED OYSTER CASE & BRACELET",
        desc: "Bodi utama Oyster 41mm dari baja Oystersteel 904L, lengkap dengan pemutar Triplock Crown di samping dan rantai gelang 3-baris.",
        explodeY: -2.2,
        camOffset: { x: 4, y: -2, z: 10 }
    },
    {
        title: "L07 // CALIBRE 3235 INVOLUTE GEARS",
        desc: "Mesin penggerak mekanis otomatis Calibre 3235 dengan roda gigi merah muda (reversing wheels), balance wheel, dan rotor Perpetual berlubang.",
        explodeY: -3.8,
        camOffset: { x: -3, y: -4, z: 8 }
    }
];

// Grup utama penampung 7 lapisan
const watchRoot = new THREE.Group();
// Miringkan sedikit jam tangan supaya tampak depan-miring seperti di video
watchRoot.rotation.x = 0.85;
scene.add(watchRoot);

const layerGroups = [];
for (let i = 0; i < 7; i++) {
    const grp = new THREE.Group();
    watchRoot.add(grp);
    layerGroups.push(grp);
}

// ============================================================================
// 3. MATERIAL & TEKSTUR DINAMIS (KANVAS 2D UNTUK ANGKA & TULISAN DIAL)
// ============================================================================
// Fungsi membuat gambar Dial (Permukaan Jam) secara otomatis lewat kode
function createDialTexture(bgColorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Warna latar belakang dial
    ctx.fillStyle = bgColorHex;
    ctx.fillRect(0, 0, 512, 512);

    // Garis-garis menit di tepi
    ctx.strokeStyle = '#ffffff';
    ctx.translate(256, 256);
    for (let i = 0; i < 60; i++) {
        ctx.beginPath();
        ctx.lineWidth = (i % 5 === 0) ? 3 : 1;
        const len = (i % 5 === 0) ? 18 : 10;
        ctx.moveTo(0, -230);
        ctx.lineTo(0, -230 + len);
        ctx.stroke();
        ctx.rotate(Math.PI / 30);
    }

    // Tulisan ROLEX & SUBMARINER
    ctx.fillStyle = '#f8f9fa';
    ctx.font = 'bold 26px serif';
    ctx.textAlign = 'center';
    ctx.fillText('♛', 0, -135);
    ctx.fillText('ROLEX', 0, -105);
    ctx.font = '13px monospace';
    ctx.fillText('OYSTER PERPETUAL DATE', 0, -85);

    ctx.fillStyle = '#e9c46a';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('SUBMARINER', 0, 95);
    ctx.fillStyle = '#d8e2dc';
    ctx.font = '12px monospace';
    ctx.fillText('1000ft = 300m', 0, 115);
    ctx.fillText('SUPERLATIVE CHRONOMETER', 0, 132);
    ctx.fillText('OFFICIALLY CERTIFIED', 0, 147);

    return new THREE.CanvasTexture(canvas);
}

// Fungsi membuat gambar Cincin Bezel (Angka 10, 20, 30, 40, 50)
function createBezelTexture(bezelHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bezelHex;
    ctx.fillRect(0, 0, 512, 512);

    ctx.translate(256, 256);
    ctx.fillStyle = '#e5e5e5';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < 12; i++) {
        const angle = (i * 30) * Math.PI / 180;
        ctx.save();
        ctx.rotate(angle);
        if (i === 0) {
            ctx.fillText('▼', 0, -200);
        } else if (i % 2 === 0) {
            ctx.fillText((i * 5).toString(), 0, -200);
        } else {
            ctx.fillRect(-3, -210, 6, 20);
        }
        ctx.restore();
    }
    return new THREE.CanvasTexture(canvas);
}

// Fungsi membuat gambar Cakram Tanggal (Angka 1 - 31)
let currentDateNumber = 14;
function createDateTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f4f1ea';
    ctx.fillRect(0, 0, 512, 512);

    ctx.translate(256, 256);
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 28px monospace';
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

// Daftar Material Utama yang mudah diganti warnanya
const mats = {
    steel: new THREE.MeshStandardMaterial({ color: 0xf0ede6, metalness: 0.75, roughness: 0.25 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.2 }),
    dial: new THREE.MeshStandardMaterial({ map: createDialTexture('#5c5852'), metalness: 0.5, roughness: 0.3 }),
    bezelInsert: new THREE.MeshStandardMaterial({ map: createBezelTexture('#8a857d'), metalness: 0.4, roughness: 0.2 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.32, roughness: 0.05, metalness: 0.1 }),
    lume: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x224433, emissiveIntensity: 0.3 }),
    dateDisc: new THREE.MeshStandardMaterial({ map: createDateTexture(), roughness: 0.4 }),
    rubyGear: new THREE.MeshStandardMaterial({ color: 0xd93870, metalness: 0.6, roughness: 0.3 }),
    brassGear: new THREE.MeshStandardMaterial({ color: 0xe9c46a, metalness: 0.8, roughness: 0.25 })
};

// ============================================================================
// 4. MERAKIT 7 KOMPONEN JAM TANGAN 3D
// ============================================================================

// --- LAPISAN 01: Kaca Safir & Lensa Pembesar Cyclops ---
const crystalGeo = new THREE.CylinderGeometry(2.55, 2.55, 0.12, 64);
const crystalMesh = new THREE.Mesh(crystalGeo, mats.glass);
layerGroups[0].add(crystalMesh);

// Lensa Cyclops di posisi jam 3 (di atas tanggal)
const cyclopsGeo = new THREE.BoxGeometry(0.65, 0.14, 0.5);
const cyclopsMesh = new THREE.Mesh(cyclopsGeo, mats.glass);
cyclopsMesh.position.set(1.65, 0.08, 0);
layerGroups[0].add(cyclopsMesh);

// --- LAPISAN 02: Cincin Bezel bergerigi ---
const bezelGroup = new THREE.Group();
const bezelRingGeo = new THREE.CylinderGeometry(3.05, 3.12, 0.26, 64, 1, true);
const bezelRing = new THREE.Mesh(bezelRingGeo, mats.steel);
bezelGroup.add(bezelRing);

const bezelTopGeo = new THREE.RingGeometry(2.45, 3.05, 64);
bezelTopGeo.rotateX(-Math.PI / 2);
const bezelTop = new THREE.Mesh(bezelTopGeo, mats.bezelInsert);
bezelTop.position.y = 0.13;
bezelGroup.add(bezelTop);

// Gerigi di pinggir bezel
for (let i = 0; i < 60; i++) {
    const toothGeo = new THREE.BoxGeometry(0.08, 0.24, 0.12);
    const tooth = new THREE.Mesh(toothGeo, mats.gold);
    const angle = (i / 60) * Math.PI * 2;
    tooth.position.set(Math.cos(angle) * 3.1, 0, Math.sin(angle) * 3.1);
    tooth.rotation.y = -angle;
    bezelGroup.add(tooth);
}
layerGroups[1].add(bezelGroup);

// --- LAPISAN 03: Jarum Jam 3D (Jam, Menit, Detik) ---
const hourHand = new THREE.Group();
const hMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 1.35), mats.gold);
hMesh.position.z = -0.5;
hourHand.add(hMesh);
layerGroups[2].add(hourHand);

const minHand = new THREE.Group();
const mMesh = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.04, 1.95), mats.gold);
mMesh.position.z = -0.8;
minHand.position.y = 0.04;
minHand.add(mMesh);
layerGroups[2].add(minHand);

const secHand = new THREE.Group();
const sMesh = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 2.2), mats.gold);
sMesh.position.z = -0.85;
secHand.position.y = 0.08;
secHand.add(sMesh);
layerGroups[2].add(secHand);

// --- LAPISAN 04: Sunburst Dial & Indeks Jam Timbul ---
const dialGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.08, 64);
const dialMesh = new THREE.Mesh(dialGeo, mats.dial);
layerGroups[3].add(dialMesh);

// Rehaut (Cincin dalam di pinggir dial)
const rehautGeo = new THREE.CylinderGeometry(2.55, 2.45, 0.22, 64, 1, true);
const rehautMesh = new THREE.Mesh(rehautGeo, mats.steel);
rehautMesh.position.y = 0.1;
layerGroups[3].add(rehautMesh);

// Indeks Penanda Jam Bulat & Persegi Panjang
for (let i = 0; i < 12; i++) {
    if (i === 3) continue; // Posisi jam 3 dikosongkan untuk jendela tanggal
    const angle = (i * 30) * Math.PI / 180;
    let markerGeo;
    if (i === 0) {
        markerGeo = new THREE.ConeGeometry(0.22, 0.08, 3);
    } else if (i === 6 || i === 9) {
        markerGeo = new THREE.BoxGeometry(0.16, 0.08, 0.38);
    } else {
        markerGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.08, 24);
    }
    const marker = new THREE.Mesh(markerGeo, mats.lume);
    marker.position.set(Math.sin(angle) * 1.9, 0.06, -Math.cos(angle) * 1.9);
    marker.rotation.y = -angle;
    layerGroups[3].add(marker);
}

// Bingkai Jendela Tanggal di jam 3
const dateFrame = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.09, 0.42), mats.gold);
dateFrame.position.set(1.65, 0.05, 0);
layerGroups[3].add(dateFrame);

// --- LAPISAN 05: Cakram Tanggal 31-Hari ---
const dateRingGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.06, 64);
const dateDiscMesh = new THREE.Mesh(dateRingGeo, mats.dateDisc);
layerGroups[4].add(dateDiscMesh);

// --- LAPISAN 06: Casing Oyster, Crown Pemutar & Rantai Gelang ---
const caseOuter = new THREE.Mesh(new THREE.CylinderGeometry(3.15, 3.0, 0.75, 64), mats.steel);
layerGroups[5].add(caseOuter);

// Triplock Crown (Pemutar jam di sebelah kanan)
const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.45, 24), mats.gold);
crown.rotation.z = Math.PI / 2;
crown.position.set(3.35, 0, 0);
layerGroups[5].add(crown);

// Fungsi membuat susunan rantai gelang (Bracelet) atas & bawah
function createBraceletSide(dirZ) {
    const braceletGrp = new THREE.Group();
    for (let row = 0; row < 6; row++) {
        const zPos = dirZ * (3.25 + row * 0.58);
        const yCurve = -Math.pow(row * 0.25, 1.8); // Melengkung ke bawah
        const widthScale = 1 - (row * 0.04);

        // 5 Baris mata rantai (Tengah emas, pinggir baja)
        for (let col = -2; col <= 2; col++) {
            const isCenter = (col === 0);
            const linkGeo = new THREE.BoxGeometry(0.62 * widthScale, 0.28, 0.5);
            const linkMesh = new THREE.Mesh(linkGeo, isCenter ? mats.gold : mats.steel);
            linkMesh.position.set(col * 0.68 * widthScale, yCurve, zPos);
            linkMesh.rotation.x = dirZ * (row * 0.08);
            braceletGrp.add(linkMesh);
        }
    }
    return braceletGrp;
}
layerGroups[5].add(createBraceletSide(1));
layerGroups[5].add(createBraceletSide(-1));

// --- LAPISAN 07: Mesin Calibre 3235, Roda Gigi & Rotor ---
const basePlate = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.35, 0.15, 64), mats.steel);
layerGroups[6].add(basePlate);

// Roda Gigi Merah Muda khas Rolex (Reversing Wheels)
const gear1 = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.22, 24), mats.rubyGear);
gear1.position.set(-0.7, 0.12, 0.5);
layerGroups[6].add(gear1);

const gear2 = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.22, 20), mats.rubyGear);
gear2.position.set(0.3, 0.12, 0.8);
layerGroups[6].add(gear2);

// Balance Wheel Emas
const balanceWheel = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 16, 32), mats.brassGear);
balanceWheel.rotation.x = Math.PI / 2;
balanceWheel.position.set(0.8, 0.15, -0.6);
layerGroups[6].add(balanceWheel);

// Rotor Berputar Setengah Lingkaran di Bawah
const rotorGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.1, 32, 1, false, 0, Math.PI);
const rotorMesh = new THREE.Mesh(rotorGeo, mats.steel);
rotorMesh.position.y = -0.25;
layerGroups[6].add(rotorMesh);

// Cincin Penutup Belakang (Caseback)
const caseBack = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.25, 16, 64), mats.steel);
caseBack.rotation.x = Math.PI / 2;
caseBack.position.y = -0.55;
layerGroups[6].add(caseBack);

// ============================================================================
// 5. LOGIKA INTERAKSI TOMBOL, SLIDER, DAN ANIMASI
// ============================================================================
let targetExplode = 0; // 0 = Menyatu, 1 = Terbuka penuh
let currentExplode = 0;
let autoAnimateExplode = false;
let animDirection = 1;

const slider = document.getElementById('explode-slider');
const explodePct = document.getElementById('explode-pct');
const btnExplode = document.getElementById('btn-explode');
const btnAnimateLayers = document.getElementById('btn-animate-layers');

function updateExplodeUI(val) {
    slider.value = Math.round(val * 100);
    explodePct.innerText = `${Math.round(val * 100)}% OPEN`;
}

// Saat Slider digeser
slider.addEventListener('input', (e) => {
    autoAnimateExplode = false;
    btnAnimateLayers.classList.remove('active-gold');
    targetExplode = e.target.value / 100;
    explodePct.innerText = `${e.target.value}% OPEN`;
});

// Tombol Bedah 8-Layer
btnExplode.addEventListener('click', () => {
    autoAnimateExplode = false;
    btnAnimateLayers.classList.remove('active-gold');
    targetExplode = (targetExplode > 0.5) ? 0 : 1;
    btnExplode.classList.toggle('active-gold', targetExplode === 1);
    updateExplodeUI(targetExplode);
});

// Tombol Animasi Bedah Layer Otomatis (Maju-Mundur)
btnAnimateLayers.addEventListener('click', () => {
    autoAnimateExplode = !autoAnimateExplode;
    btnAnimateLayers.classList.toggle('active-gold', autoAnimateExplode);
});

// Tombol Auto-Orbit [ON/OFF]
const btnOrbit = document.getElementById('btn-orbit');
btnOrbit.addEventListener('click', () => {
    controls.autoRotate = !controls.autoRotate;
    btnOrbit.innerText = controls.autoRotate ? "Auto-Orbit [ON]" : "Auto-Orbit [OFF]";
    btnOrbit.classList.toggle('active-gold', controls.autoRotate);
});

// Memilih Lapisan di Panel Kiri (Isolasi Komponen & Fokus Kamera)
const layerItems = document.querySelectorAll('.layer-item');
const btnOverall = document.getElementById('btn-overall');
const noteTitle = document.getElementById('note-title');
const noteDesc = document.getElementById('note-desc');
const layerStatus = document.getElementById('layer-status');

function selectLayer(index) {
    layerItems.forEach(item => item.classList.remove('active'));

    if (index === 'all') {
        btnOverall.classList.add('active');
        layerStatus.innerText = "// ALL LAYERS";
        noteTitle.innerText = "PARAMETRIC CAD NOTES";
        noteDesc.innerText = "Menampilkan keseluruhan rakitan 7 lapisan Rolex Submariner. Gunakan slider di kanan untuk membedah mesin.";
        
        // Kembalikan transparansi semua layer menjadi jelas
        layerGroups.forEach((grp) => {
            grp.traverse((child) => {
                if (child.isMesh && child.material !== mats.glass) {
                    child.material.transparent = false;
                    child.material.opacity = 1.0;
                }
            });
        });
    } else {
        btnOverall.classList.remove('active');
        layerItems[index].classList.add('active');
        const info = layerInfos[index];
        layerStatus.innerText = `// LAYER 0${index + 1}`;
        noteTitle.innerText = info.title;
        noteDesc.innerText = info.desc;

        // Buka sedikit layer supaya bagian yang dipilih terlihat jelas
        if (targetExplode < 0.6) {
            targetExplode = 0.75;
            updateExplodeUI(targetExplode);
        }
    }
}

btnOverall.addEventListener('click', () => selectLayer('all'));
layerItems.forEach((item) => {
    item.addEventListener('click', () => {
        const idx = parseInt(item.getAttribute('data-layer'));
        selectLayer(idx);
    });
});

// Mode Shading: PBR Luxury, Mesh / Wire, X-Ray Ghost
const modeBtns = document.querySelectorAll('.mode-btn');
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active-gold'));
        btn.classList.add('active-gold');
        const mode = btn.getAttribute('data-mode');

        Object.values(mats).forEach(mat => {
            if (mode === 'wire') {
                mat.wireframe = true;
                mat.transparent = false;
                mat.opacity = 1.0;
            } else if (mode === 'xray') {
                mat.wireframe = false;
                mat.transparent = true;
                mat.opacity = 0.28;
            } else {
                mat.wireframe = false;
                if (mat !== mats.glass) {
                    mat.transparent = false;
                    mat.opacity = 1.0;
                } else {
                    mat.transparent = true;
                    mat.opacity = 0.32;
                }
            }
        });
    });
});

// Ganti Warna Tema (Bespoke Colorway)
const colorBtns = document.querySelectorAll('.color-btn');
const activeSpec = document.getElementById('active-spec');
const colorThemes = {
    steel: { gold: 0xd4af37, dial: '#5c5852', bezel: '#8a857d', spec: '18K EVEROSE GOLD & 904L STEEL' },
    green: { gold: 0xe0dcd3, dial: '#1b4d2e', bezel: '#2b7a4b', spec: 'GREEN CERACHROM HULK EDITION' },
    black: { gold: 0xc88a65, dial: '#141414', bezel: '#1f1f1f', spec: '18K EVEROSE BLACK SUBMARINER' },
    blue:  { gold: 0xdbe4ee, dial: '#4a7c9b', bezel: '#2c4d63', spec: '950 PLATINUM ICE BLUE DIAL' }
};

colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('active-gold'));
        btn.classList.add('active-gold');
        const themeKey = btn.getAttribute('data-theme');
        const t = colorThemes[themeKey];

        mats.gold.color.setHex(t.gold);
        mats.dial.map = createDialTexture(t.dial);
        mats.bezelInsert.map = createBezelTexture(t.bezel);
        activeSpec.innerText = t.spec;
    });
});

// Komplikasi Horologi (Putar Bezel & Tambah Tanggal)
let targetBezelRot = 0;
document.getElementById('btn-bezel-click').addEventListener('click', () => {
    targetBezelRot += (Math.PI * 2) / 24; // Berputar setiap diklik
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
            mats.dateDisc.map = createDateTexture();
            btn.innerText = `Tanggal (${currentDateNumber}): +1`;
        } else {
            selectLayer(parseInt(target));
        }
    });
});

// ============================================================================
// 6. LOOP ANIMASI REAL-TIME (DETAK JAM, GEAR MESIN, & RENDER)
// ============================================================================
const clockEl = document.getElementById('live-clock');

function animate() {
    requestAnimationFrame(animate);

    // 1. Update Jam Digital & Jarum Jam 3D sesuai waktu sekarang
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    clockEl.innerText = `${hrs}:${mins}:${secs}`;

    const ms = now.getMilliseconds();
    const smoothSec = now.getSeconds() + ms / 1000;
    const smoothMin = now.getMinutes() + smoothSec / 60;
    const smoothHr = (now.getHours() % 12) + smoothMin / 60;

    secHand.rotation.y = -(smoothSec / 60) * Math.PI * 2;
    minHand.rotation.y = -(smoothMin / 60) * Math.PI * 2;
    hourHand.rotation.y = -(smoothHr / 12) * Math.PI * 2;

    // 2. Putar Roda Gigi Mesin & Rotor di Lapisan 7
    gear1.rotation.y += 0.02;
    gear2.rotation.y -= 0.025;
    rotorMesh.rotation.y += 0.015;
    balanceWheel.rotation.z = Math.sin(Date.now() * 0.015) * 0.25;

    // 3. Animasi Putar Bezel Halus
    bezelGroup.rotation.y += (targetBezelRot - bezelGroup.rotation.y) * 0.1;

    // 4. Animasi Otomatis Bedah Layer (Jika tombol diaktifkan)
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

    // 5. Gerakkan setiap Lapisan secara mulus (Interpolasi / Lerp)
    currentExplode += (targetExplode - currentExplode) * 0.08;
    for (let i = 0; i < 7; i++) {
        layerGroups[i].position.y = layerInfos[i].explodeY * currentExplode;
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();

// Menyesuaikan ukuran layar jika jendela browser diubah ukurannya
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
