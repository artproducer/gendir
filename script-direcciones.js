// Script para generador de direcciones
(() => {
    const countrySelect = document.getElementById("country-select");
    const flagEl = document.getElementById("flag");
    const countryButton = document.getElementById("country-button");
    const countryLabel = document.getElementById("country-label");
    const countryDropdown = document.getElementById("country-dropdown");
    let dropdownOpen = false;

    // Actualizar bandera
    function updateFlag() {
        if (!countrySelect) return;
        const value = countrySelect.value;
        if (flagEl) {
            flagEl.className = "fi fi-" + value;
        }
        const selectedOption = countrySelect.options[countrySelect.selectedIndex];
        if (countryLabel && selectedOption) {
            countryLabel.textContent = selectedOption.textContent;
        }
    }

    // Toggle dropdown
    function toggleDropdown() {
        dropdownOpen = !dropdownOpen;
        if (dropdownOpen) {
            buildDropdown();
            countryDropdown.classList.add("open");
            countryDropdown.hidden = false;
        } else {
            countryDropdown.classList.remove("open");
            setTimeout(() => { countryDropdown.hidden = true; }, 200);
        }
    }

    // Construir dropdown
    function buildDropdown() {
        if (!countryDropdown || !countrySelect) return;
        countryDropdown.innerHTML = "";

        Array.from(countrySelect.options).forEach(option => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "country-option";
            btn.dataset.value = option.value;
            btn.setAttribute("role", "option");
            btn.setAttribute("aria-selected", option.value === countrySelect.value ? "true" : "false");

            const flag = document.createElement("span");
            flag.className = `fi fi-${option.value}`;
            btn.appendChild(flag);

            const label = document.createElement("span");
            label.textContent = option.textContent;
            btn.appendChild(label);

            btn.onclick = () => {
                countrySelect.value = option.value;
                updateFlag();
                toggleDropdown();
                generateNewAddress();
            };

            countryDropdown.appendChild(btn);
        });
    }

    // Event listeners
    if (countryButton) {
        countryButton.addEventListener("click", toggleDropdown);
    }

    if (countrySelect) {
        countrySelect.addEventListener("change", () => {
            updateFlag();
            generateNewAddress();
        });
    }

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener("click", (e) => {
        if (dropdownOpen && !countryButton.contains(e.target) && !countryDropdown.contains(e.target)) {
            dropdownOpen = false;
            countryDropdown.classList.remove("open");
            setTimeout(() => { countryDropdown.hidden = true; }, 200);
        }
    });

    // Generar dirección
    window.generateNewAddress = function () {
        const loading = document.getElementById("loading");
        if (loading) loading.classList.add("active");

        setTimeout(() => {
            const country = countrySelect ? countrySelect.value : "us";
            const address = generateAddress(country);

            document.getElementById("name").textContent = address.name;
            document.getElementById("street").textContent = address.street;
            document.getElementById("city").textContent = address.city;
            document.getElementById("state").textContent = address.state;
            document.getElementById("zip").textContent = address.zip;
            document.getElementById("phone").textContent = address.phone;

            if (loading) loading.classList.remove("active");
        }, 300);
    };

    // Generar datos según país
    function generateAddress(country) {
        // Usar la función del módulo offline si existe
        if (typeof getRandomOfflineAddress === 'function') {
            const data = getRandomOfflineAddress(country);
            return {
                name: `${data.firstName} ${data.lastName}`,
                street: `${data.streetNumber} ${data.streetName}`,
                city: data.city,
                state: data.state,
                zip: data.zip || generateZip(country),
                phone: formatPhone(data.phone, country)
            };
        }

        // Fallback
        return {
            name: "John Doe",
            street: "123 Main Street",
            city: "New York",
            state: "NY",
            zip: "10001",
            phone: "(555) 123-4567"
        };
    }

    function formatPhone(phone, country) {
        if (!phone) return "(555) 123-4567";
        const digits = phone.replace(/\D/g, '');
        switch (country) {
            case 'us':
            case 'ca':
                if (digits.length >= 10) {
                    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
                }
                break;
            case 'co':
                return `+57 ${digits}`;
            case 'mx':
                return `+52 ${digits}`;
            case 'es':
                return `+34 ${digits}`;
            case 'de':
                return `+49 ${digits}`;
            case 'gb':
                return `+44 ${digits}`;
        }
        return digits;
    }

    function generateZip(country) {
        switch (country) {
            case 'us': return String(Math.floor(Math.random() * 90000) + 10000);
            case 'co': return String(Math.floor(Math.random() * 900000) + 100000);
            case 'mx': return String(Math.floor(Math.random() * 90000) + 10000);
            case 'es': return String(Math.floor(Math.random() * 90000) + 10000);
            case 'de': return String(Math.floor(Math.random() * 90000) + 10000);
            case 'gb': return generateUKPostcode();
            default: return String(Math.floor(Math.random() * 90000) + 10000);
        }
    }

    function generateUKPostcode() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const l1 = letters[Math.floor(Math.random() * 26)];
        const l2 = letters[Math.floor(Math.random() * 26)];
        const n1 = Math.floor(Math.random() * 10);
        const n2 = Math.floor(Math.random() * 10);
        const l3 = letters[Math.floor(Math.random() * 26)];
        const l4 = letters[Math.floor(Math.random() * 26)];
        return `${l1}${l2}${n1} ${n2}${l3}${l4}`;
    }

    function generatePhone(country) {
        const r = () => Math.floor(Math.random() * 10);
        switch (country) {
            case 'us':
            case 'ca':
                return `(${r()}${r()}${r()}) ${r()}${r()}${r()}-${r()}${r()}${r()}${r()}`;
            case 'co':
                return `+57 3${r()}${r()} ${r()}${r()}${r()} ${r()}${r()}${r()}${r()}`;
            case 'mx':
                return `+52 ${r()}${r()} ${r()}${r()}${r()}${r()} ${r()}${r()}${r()}${r()}`;
            case 'es':
                return `+34 ${r()}${r()}${r()} ${r()}${r()} ${r()}${r()} ${r()}${r()}`;
            case 'de':
                return `+49 ${r()}${r()}${r()} ${r()}${r()}${r()}${r()}${r()}${r()}${r()}`;
            case 'gb':
                return `+44 ${r()}${r()}${r()}${r()} ${r()}${r()}${r()}${r()}${r()}${r()}`;
            default:
                return `+1 ${r()}${r()}${r()}-${r()}${r()}${r()}-${r()}${r()}${r()}${r()}`;
        }
    }

    // Copiar al portapapeles
    window.copyToClipboard = function (elementId, event) {
        if (event) event.stopPropagation();
        const element = document.getElementById(elementId);
        if (!element) return;

        const text = element.textContent;
        navigator.clipboard.writeText(text).then(() => {
            showToast("¡Copiado!");
        }).catch(() => {
            showToast("Error al copiar", true);
        });
    };

    // Copiar todo
    window.copyAll = function () {
        const name = document.getElementById("name").textContent;
        const street = document.getElementById("street").textContent;
        const city = document.getElementById("city").textContent;
        const state = document.getElementById("state").textContent;
        const zip = document.getElementById("zip").textContent;
        const phone = document.getElementById("phone").textContent;

        const fullAddress = `${name}\n${street}\n${city}, ${state} ${zip}\n${phone}`;

        navigator.clipboard.writeText(fullAddress).then(() => {
            showToast("¡Dirección copiada!");
        }).catch(() => {
            showToast("Error al copiar", true);
        });
    };

    // Toast
    function showToast(message, isError = false) {
        const toast = document.getElementById("toast");
        const toastText = document.getElementById("toast-text");
        if (!toast) return;

        if (toastText) toastText.textContent = message;
        toast.classList.toggle("error", isError);
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 2000);
    }



    // Al cambiar país, guardar en localStorage
    if (countrySelect) {
        countrySelect.addEventListener("change", () => {
            localStorage.setItem('selectedCountry', countrySelect.value);
        });
    }

    // Inicializar
    const savedCountry = localStorage.getItem('selectedCountry');
    if (savedCountry && countrySelect) {
        countrySelect.value = savedCountry;
    }
    updateFlag();
    generateNewAddress();
})();
