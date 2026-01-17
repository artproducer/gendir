// ==================== CONFIGURACION ====================
const GAS_URL = "https://script.google.com/macros/s/AKfycbxKYRJHmDWHLNjrZb73IGzSjyu-dIu5Hl267cQSOsPlM3gBptBiIb4DRxM5cLZqOASB/exec";
const RENDER_URL = "https://tpde-proxy-t2wf.onrender.com";

// ==================== CANVAS SETUP ====================
let fakeidCanvas = null;
const originalWidth = 843;
const originalHeight = 600;

function initFakeidCanvas() {
    if (fakeidCanvas) return;

    const canvasEl = document.getElementById('fakeid-canvas');
    if (!canvasEl) return;

    fakeidCanvas = new fabric.Canvas('fakeid-canvas');
    resizeFakeidCanvas();

    // Load background template
    fabric.Image.fromURL('card.png', function (img) {
        fakeidCanvas.setBackgroundImage(img, fakeidCanvas.renderAll.bind(fakeidCanvas));
    });

    // Add text elements
    createFakeidTexts();

    // Setup event listeners
    setupFakeidEvents();

    // Start prefetching
    prefetchNextFace();
    for (let i = 0; i < 3; i++) refillNameBuffer();

    // Load initial face
    applyFace();
}

function resizeFakeidCanvas() {
    const wrapper = document.querySelector('.fakeid-canvas-wrapper');
    if (!wrapper || !fakeidCanvas) return;
    const width = wrapper.clientWidth - 20;
    const scale = width / originalWidth;

    fakeidCanvas.setDimensions({
        width: originalWidth * scale,
        height: originalHeight * scale
    });
    fakeidCanvas.setZoom(scale);
}

window.addEventListener('resize', resizeFakeidCanvas);

// ==================== OPTIMIZACIÓN: BUFFER DE DATOS ====================
let nameBuffer = ["MICHAEL BROWN"];
let faceBuffer = [];
const MAX_FACES = 10;
let isLoadingFace = false;

async function refillNameBuffer() {
    try {
        const res = await fetch(GAS_URL, { method: "POST" });
        const json = await res.json();
        if (json.name && !nameBuffer.includes(json.name)) {
            nameBuffer.push(json.name);
        }
    } catch (e) { console.error("Error refilling names:", e); }
}

async function prefetchNextFace() {
    if (isLoadingFace || faceBuffer.length >= MAX_FACES) return;
    isLoadingFace = true;
    try {
        const response = await fetch(RENDER_URL);
        const data = await response.json();
        if (data.noError) {
            fabric.Image.fromURL(data.imageBase64, function (img) {
                const scaleX = POS.photo.width / img.width;
                const scaleY = POS.photo.height / img.height;
                img.set({
                    left: POS.photo.left,
                    top: POS.photo.top,
                    scaleX: scaleX,
                    scaleY: scaleY,
                    selectable: false,
                    evented: false
                });
                faceBuffer.push(img);
                isLoadingFace = false;
                prefetchNextFace();
            });
        } else {
            isLoadingFace = false;
            setTimeout(prefetchNextFace, 2000);
        }
    } catch (err) {
        console.error("Error prefetching face:", err);
        isLoadingFace = false;
        setTimeout(prefetchNextFace, 5000);
    }
}

// ==================== UTILIDADES ====================
function addYears(date, years) {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() + years);
    return newDate;
}

function getRandomPhone() {
    const area = Math.floor(Math.random() * 900) + 100;
    const prefix = Math.floor(Math.random() * 900) + 100;
    const line = Math.floor(Math.random() * 9000) + 1000;
    return `(${area}) ${prefix}-${line}`;
}

const US_DATA = {
    "Alabama": ["Montgomery", "Birmingham", "Mobile"],
    "Alaska": ["Juneau", "Anchorage", "Fairbanks"],
    "Arizona": ["Phoenix", "Tucson", "Mesa"],
    "California": ["Sacramento", "Los Angeles", "San Francisco", "San Diego"],
    "Colorado": ["Denver", "Colorado Springs", "Aurora"],
    "Florida": ["Tallahassee", "Miami", "Orlando", "Tampa"],
    "Georgia": ["Atlanta", "Augusta", "Columbus"],
    "Illinois": ["Springfield", "Chicago", "Aurora"],
    "Massachusetts": ["Boston", "Worcester", "Springfield"],
    "Michigan": ["Lansing", "Detroit", "Grand Rapids"],
    "New York": ["Albany", "New York City", "Buffalo"],
    "Texas": ["Austin", "Houston", "Dallas", "San Antonio"],
    "Washington": ["Olympia", "Seattle", "Spokane"]
};

function randomStreet() {
    const num1 = Math.floor(Math.random() * 999) + 1;
    const num2 = Math.floor(Math.random() * 99) + 1;
    const states = Object.keys(US_DATA);
    const state = states[Math.floor(Math.random() * states.length)];
    const city = US_DATA[state][Math.floor(Math.random() * US_DATA[state].length)];
    return `St ${num1} Av ${num2}, ${city}, ${state}`;
}

function getRandomBirthDate() {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 22, today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const randomTime = minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime());
    return new Date(randomTime);
}

function randomCode() {
    return Math.floor(Math.random() * 9000 + 1000).toString();
}

// ==================== POSICIONES (843x600) ====================
const POS = {
    name: { left: 355, top: 162 },
    dob: { left: 355, top: 230 },
    address: { left: 355, top: 298 },
    phone: { left: 353, top: 363 },
    country: { left: 355, top: 433 },
    issueDate: { left: 230, top: 500 },
    expDate: { left: 610, top: 500 },
    photo: { left: 101, top: 123, width: 222, height: 323 }
};

const TEXT_STYLE = {
    fontFamily: 'Manrope',
    fontSize: 20,
    fontWeight: 600,
    fill: '#0f172a',
    selectable: false,
    evented: false
};

// ==================== DATOS GENERADOS ====================
let birthDate = getRandomBirthDate();
const dateOpts = { year: 'numeric', month: '2-digit', day: '2-digit' };

// Text objects
let nombreText, dobText, addressText, phoneText, countryText, issueText, expText;

function createFakeidTexts() {
    nombreText = new fabric.Text(localStorage.getItem("fakeid-nombre") || 'JOHN DOE SMITH', {
        ...TEXT_STYLE, ...POS.name
    });
    fakeidCanvas.add(nombreText);

    dobText = new fabric.Text(birthDate.toLocaleDateString("en-US", dateOpts), {
        ...TEXT_STYLE, ...POS.dob
    });
    fakeidCanvas.add(dobText);

    addressText = new fabric.Text(localStorage.getItem("fakeid-direccion") || randomStreet(), {
        ...TEXT_STYLE, ...POS.address
    });
    fakeidCanvas.add(addressText);

    phoneText = new fabric.Text(getRandomPhone(), {
        ...TEXT_STYLE, ...POS.phone
    });
    fakeidCanvas.add(phoneText);

    countryText = new fabric.Text('United States', {
        ...TEXT_STYLE, ...POS.country
    });
    fakeidCanvas.add(countryText);

    const issueDate = addYears(birthDate, 18);
    issueText = new fabric.Text(issueDate.toLocaleDateString("en-US", dateOpts), {
        ...TEXT_STYLE, ...POS.issueDate, fontSize: 18
    });
    fakeidCanvas.add(issueText);

    const expDate = addYears(issueDate, 8);
    expText = new fabric.Text(expDate.toLocaleDateString("en-US", dateOpts), {
        ...TEXT_STYLE, ...POS.expDate, fontSize: 18
    });
    fakeidCanvas.add(expText);

    // Initialize inputs
    document.getElementById("fakeid-nombre").value = localStorage.getItem("fakeid-nombre") || '';
    document.getElementById("fakeid-direccion").value = localStorage.getItem("fakeid-direccion") || addressText.text;
}

function setupFakeidEvents() {
    document.getElementById("fakeid-nombre").addEventListener("input", (e) => {
        const val = e.target.value || 'JOHN DOE SMITH';
        localStorage.setItem("fakeid-nombre", e.target.value);
        nombreText.text = val;
        fakeidCanvas.renderAll();
    });

    document.getElementById("fakeid-direccion").addEventListener("input", (e) => {
        localStorage.setItem("fakeid-direccion", e.target.value);
        addressText.text = e.target.value;
        fakeidCanvas.renderAll();
    });

    document.getElementById("fakeid-btn-random-address").addEventListener("click", () => {
        const addr = randomStreet();
        document.getElementById("fakeid-direccion").value = addr;
        localStorage.setItem("fakeid-direccion", addr);
        addressText.text = addr;
        fakeidCanvas.renderAll();
    });

    document.getElementById("fakeid-btn-copy").addEventListener("click", () => {
        navigator.clipboard.writeText(document.getElementById("fakeid-nombre").value);
        showToast(window.currentTranslations?.toast_copied || '¡Copiado!');
    });

    document.getElementById("fakeid-btn-random-name").addEventListener("click", () => {
        if (nameBuffer.length > 0) {
            const name = nameBuffer.shift();
            document.getElementById("fakeid-nombre").value = name;
            localStorage.setItem("fakeid-nombre", name);
            nombreText.text = name;
            fakeidCanvas.renderAll();
            refillNameBuffer();
        }
    });

    document.getElementById("fakeid-btn-download").addEventListener("click", () => {
        // Calculate multiplier to export at original resolution (843x600)
        // regardless of current zoom/scale
        const currentZoom = fakeidCanvas.getZoom();
        const multiplier = 1 / currentZoom;

        const link = document.createElement('a');
        link.href = fakeidCanvas.toDataURL({
            format: 'png',
            quality: 1.0,
            multiplier: multiplier
        });
        link.download = `ID-${randomCode()}.png`;
        link.click();
    });

    document.getElementById("fakeid-btn-reload").addEventListener("click", reloadFakeid);
    document.getElementById("fakeid-btn-new-face").addEventListener("click", applyFace);
}

function reloadFakeid() {
    // Regenerate all random data
    birthDate = getRandomBirthDate();

    // Update DOB
    dobText.text = birthDate.toLocaleDateString("en-US", dateOpts);

    // Update phone
    phoneText.text = getRandomPhone();

    // Update dates
    const issueDate = addYears(birthDate, 18);
    issueText.text = issueDate.toLocaleDateString("en-US", dateOpts);
    const expDate = addYears(issueDate, 8);
    expText.text = expDate.toLocaleDateString("en-US", dateOpts);

    // New random address if empty
    if (!document.getElementById("fakeid-direccion").value) {
        const addr = randomStreet();
        document.getElementById("fakeid-direccion").value = addr;
        localStorage.setItem("fakeid-direccion", addr);
        addressText.text = addr;
    }

    fakeidCanvas.renderAll();
}

// ==================== GESTIÓN DE FOTOS (PRE-FETCH) ====================
let currentFaceImage = null;

async function applyFace() {
    if (faceBuffer.length > 0) {
        if (currentFaceImage && fakeidCanvas) fakeidCanvas.remove(currentFaceImage);
        currentFaceImage = faceBuffer.shift();
        if (fakeidCanvas) {
            fakeidCanvas.add(currentFaceImage);
            fakeidCanvas.renderAll();
        }
        prefetchNextFace();
    } else {
        await loadFaceFallback();
    }
}

async function loadFaceFallback() {
    try {
        const response = await fetch(RENDER_URL);
        const data = await response.json();
        if (data.noError) {
            fabric.Image.fromURL(data.imageBase64, function (img) {
                const scaleX = POS.photo.width / img.width;
                const scaleY = POS.photo.height / img.height;
                img.set({
                    left: POS.photo.left, top: POS.photo.top,
                    scaleX: scaleX, scaleY: scaleY,
                    selectable: false, evented: false
                });
                if (currentFaceImage && fakeidCanvas) fakeidCanvas.remove(currentFaceImage);
                currentFaceImage = img;
                if (fakeidCanvas) {
                    fakeidCanvas.add(img);
                    fakeidCanvas.renderAll();
                }
                prefetchNextFace();
            });
        }
    } catch (e) { console.error(e); }
}

// Preload data on page load (regardless of active tab)
document.addEventListener('DOMContentLoaded', () => {
    // Start prefetching faces immediately
    prefetchNextFace();

    // Pre-fill name buffer
    for (let i = 0; i < 5; i++) refillNameBuffer();

    // Initialize canvas if Fake ID tab is already active
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab === 'fakeid') {
        setTimeout(initFakeidCanvas, 100);
    }
});
