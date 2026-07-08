// ==================== CONFIGURACION ====================
const GAS_URL = window.GENDIR_FAKEID_GAS_URL || "";

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
    const canvasColumn = document.querySelector('.fakeid-canvas-column');
    if (!canvasColumn || !fakeidCanvas) return;

    // Get available width from the canvas column
    const availableWidth = canvasColumn.clientWidth;
    const maxWidth = Math.min(availableWidth, originalWidth);
    const scale = maxWidth / originalWidth;

    fakeidCanvas.setDimensions({
        width: originalWidth * scale,
        height: originalHeight * scale
    });
    fakeidCanvas.setZoom(scale);
}

// Debounced resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeFakeidCanvas, 100);
});

// ==================== OPTIMIZACIÓN: BUFFER DE DATOS ====================
let nameBuffer = ["MICHAEL BROWN"];
let faceBuffer = [];
const MAX_FACES = 10;
let isLoadingFace = false;
let hasShownFaceError = false;
let hasShownGasWarning = false;

async function refillNameBuffer() {
    if (!GAS_URL) {
        if (!hasShownGasWarning) {
            hasShownGasWarning = true;
            console.warn("GenDir: GENDIR_FAKEID_GAS_URL is missing. Name buffer will use defaults.");
        }
        return;
    }

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
        const img = await loadFaceFromProvider();
        faceBuffer.push(img);
        isLoadingFace = false;
        prefetchNextFace();
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

function revokeFaceObjectUrl(url) {
    if (url) {
        URL.revokeObjectURL(url);
    }
}

function createFaceImage(url) {
    return new Promise((resolve, reject) => {
        fabric.Image.fromURL(url, function (img) {
            if (!img || !img.width || !img.height) {
                reject(new Error('No face image was returned by the provider.'));
                return;
            }

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

            resolve(img);
        });
    });
}

async function loadFaceFromProvider() {
    let proxyImageUrl;
    try {
        if (typeof window.fetchFaceImageViaSupabaseProxy === 'function') {
            proxyImageUrl = await window.fetchFaceImageViaSupabaseProxy();
        } else {
            throw new Error('Supabase face proxy is not available.');
        }
    } catch (error) {
        console.warn("Supabase proxy unavailable or failed. Falling back to randomuser.me:", error.message);
        const res = await fetch('https://randomuser.me/api/');
        if (!res.ok) throw new Error("randomuser.me API failed");
        const data = await res.json();
        const fallbackUrl = data.results[0].picture.large;
        
        const imgRes = await fetch(fallbackUrl);
        if (!imgRes.ok) throw new Error("Failed to fetch image from randomuser.me");
        const blob = await imgRes.blob();
        proxyImageUrl = URL.createObjectURL(blob);
    }

    try {
        const imageObject = await createFaceImage(proxyImageUrl);
        imageObject.blobUrl = proxyImageUrl;
        return imageObject;
    } catch (error) {
        URL.revokeObjectURL(proxyImageUrl);
        throw error;
    }
}

function showFakeidToast(message, isError = false) {
    const toast = document.getElementById("toast");
    const toastText = document.getElementById("toast-text");
    if (!toast) return;

    if (toastText) toastText.textContent = message;
    toast.classList.toggle("error", isError);
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
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
        try {
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
        } catch (error) {
            console.error("Error exporting fake ID:", error);
            showFakeidToast('No se pudo descargar la imagen.', true);
        }
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

function removeCurrentFace() {
    if (currentFaceImage && fakeidCanvas) {
        fakeidCanvas.remove(currentFaceImage);
        if (currentFaceImage.blobUrl) {
            revokeFaceObjectUrl(currentFaceImage.blobUrl);
        }
    }
    currentFaceImage = null;
}

function buildFacePlaceholder() {
    const portraitBackground = new fabric.Rect({
        left: POS.photo.left,
        top: POS.photo.top,
        width: POS.photo.width,
        height: POS.photo.height,
        fill: '#dbe4f0',
        rx: 10,
        ry: 10,
        selectable: false,
        evented: false
    });

    const head = new fabric.Circle({
        radius: 46,
        fill: '#94a3b8',
        left: POS.photo.left + (POS.photo.width / 2) - 46,
        top: POS.photo.top + 42,
        selectable: false,
        evented: false
    });

    const shoulders = new fabric.Rect({
        width: 130,
        height: 138,
        rx: 64,
        ry: 64,
        fill: '#94a3b8',
        left: POS.photo.left + (POS.photo.width / 2) - 65,
        top: POS.photo.top + 130,
        selectable: false,
        evented: false
    });

    const label = new fabric.Text('PHOTO', {
        left: POS.photo.left + 66,
        top: POS.photo.top + POS.photo.height - 44,
        fontFamily: 'Manrope',
        fontSize: 20,
        fontWeight: 700,
        fill: '#475569',
        selectable: false,
        evented: false
    });

    return new fabric.Group([portraitBackground, shoulders, head, label], {
        selectable: false,
        evented: false
    });
}

function applyFaceObject(faceObject) {
    removeCurrentFace();
    currentFaceImage = faceObject;
    if (fakeidCanvas) {
        fakeidCanvas.add(faceObject);
        fakeidCanvas.renderAll();
    }
}

function applyPlaceholderFace(showErrorToast = false) {
    applyFaceObject(buildFacePlaceholder());

    if (showErrorToast && !hasShownFaceError) {
        hasShownFaceError = true;
        showFakeidToast('No se pudo cargar la foto. Se usa un placeholder.', true);
    }
}

async function applyFace() {
    if (faceBuffer.length > 0) {
        applyFaceObject(faceBuffer.shift());
        hasShownFaceError = false;
        prefetchNextFace();
    } else {
        await loadFaceFallback();
    }
}

async function loadFaceFallback() {
    try {
        const img = await loadFaceFromProvider();
        applyFaceObject(img);
        hasShownFaceError = false;
        prefetchNextFace();
    } catch (e) {
        console.error("Error loading fallback face:", e);
        applyPlaceholderFace(true);
    }
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
