// Generador de Tarjetas con Algoritmo de Luhn
(() => {
    class CardGenerator {
        constructor() {
            this.length = 16;
        }

        rand(min, max) {
            if (min === 0) return Math.floor(Math.random() * (max + 1));
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        strrev(str) {
            return str.split("").reverse().join("");
        }

        pad(num, size) {
            const padded = "0" + num;
            return padded.substr(padded.length - size);
        }

        detectCardType(cardNumber) {
            if (/^5[1-5][0-9]{14}$/.test(cardNumber)) return "Mastercard";
            if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(cardNumber)) return "Visa";
            if (/^3[47][0-9]{13}$/.test(cardNumber)) return "Amex";
            if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(cardNumber)) return "Discover";
            return "Desconocido";
        }

        normalizeBin(bin) {
            bin = bin.replace(/\s+/g, "");
            this.length = /^3/.test(bin) ? 15 : 16;
            bin = bin.replace(/X/g, "x");
            bin = bin.replace(/[^0-9x]/g, "");
            while (bin.length < this.length) {
                bin += "x";
            }
            return bin;
        }

        // Algoritmo de Luhn para generar número válido
        makeCC(bin) {
            const self = this;
            let cardNumber = "";

            // Construir número reemplazando 'x' con aleatorios
            bin.split("").forEach((char, index) => {
                if (cardNumber.length < self.length - 1) {
                    if (char.toLowerCase() === "x") {
                        cardNumber += self.rand(0, 9).toString();
                    } else {
                        cardNumber += char.toString();
                    }
                }
            });

            // Calcular checksum con Luhn
            let sum = 0;
            let position = 0;
            const reversed = this.strrev(cardNumber);

            while (position < this.length - 1) {
                let doubled = 2 * parseInt(reversed[position]);
                if (doubled > 9) doubled -= 9;
                sum += doubled;
                if (position !== this.length - 2) {
                    sum += parseInt(reversed[position + 1]);
                }
                position += 2;
            }

            // Agregar dígito verificador
            const checkDigit = (10 * (Math.floor(sum / 10) + 1) - sum) % 10;
            cardNumber += isNaN(checkDigit) ? "" : checkDigit.toString();

            return cardNumber;
        }

        generateDate(customMonth = "", customYear = "") {
            const month = customMonth === "" ? this.pad(this.rand(1, 12), 2) : customMonth;
            const year = customYear === ""
                ? (parseInt(new Date().getFullYear()) + parseInt(this.rand(2, 8))).toString()
                : customYear;
            return { month, year };
        }

        generateCVV(customCvv = "") {
            if (customCvv) return customCvv;
            let cvv = "";
            cvv += this.rand(0, 9).toString();
            cvv += this.rand(0, 9).toString();
            cvv += this.rand(0, 9).toString();
            if (this.length === 15) cvv += this.rand(0, 9).toString();
            return cvv;
        }

        generate(bin, quantity, options = {}) {
            const { includeDate = true, includeCvv = true, customMonth = "", customYear = "", customCvv = "" } = options;

            if (!bin || bin.length < 6) {
                throw new Error("El BIN debe tener al menos 6 dígitos");
            }

            const normalizedBin = this.normalizeBin(bin);
            const cards = [];

            for (let i = 0; i < quantity; i++) {
                const cardNumber = this.makeCC(normalizedBin);
                const card = { number: cardNumber };

                if (includeDate) {
                    const date = this.generateDate(customMonth, customYear);
                    card.month = date.month;
                    card.year = date.year;
                }

                if (includeCvv) {
                    card.cvv = this.generateCVV(customCvv);
                }

                card.type = this.detectCardType(cardNumber);
                cards.push(card);
            }

            return cards;
        }
    }

    // Instancia del generador
    const generator = new CardGenerator();
    let lastResult = "";

    // Generar tarjetas
    window.generateCards = function () {
        const binInput = document.getElementById("bin-input");
        const quantityInput = document.getElementById("quantity-input");
        const monthSelect = document.getElementById("month-select");
        const yearSelect = document.getElementById("year-select");
        const cvvInput = document.getElementById("cvv-input");
        const output = document.getElementById("output");
        const statsRow = document.getElementById("stats-row");
        const badge = document.getElementById("card-type-badge");

        const bin = binInput ? binInput.value.trim() : "";
        const quantity = quantityInput ? parseInt(quantityInput.value) || 10 : 10;
        const month = monthSelect ? monthSelect.value : "";
        const year = yearSelect ? yearSelect.value : "";
        const cvv = cvvInput ? cvvInput.value.trim() : "";

        if (!bin || bin.length < 6) {
            showToast("El BIN debe tener al menos 6 dígitos", true);
            return;
        }

        try {
            const cards = generator.generate(bin, quantity, {
                includeDate: true,
                includeCvv: true,
                customMonth: month,
                customYear: year,
                customCvv: cvv
            });

            // Formatear resultado
            lastResult = cards.map(card => {
                let line = card.number;
                if (card.month && card.year) line += `|${card.month}|${card.year}`;
                if (card.cvv) line += `|${card.cvv}`;
                return line;
            }).join("\n");

            if (output) output.textContent = lastResult;

            // Mostrar estadísticas
            if (statsRow) statsRow.style.display = "flex";

            const statCount = document.getElementById("stat-count");
            const statType = document.getElementById("stat-type");
            const statLength = document.getElementById("stat-length");

            if (statCount) statCount.textContent = cards.length;
            if (statType) statType.textContent = cards[0].type;
            if (statLength) statLength.textContent = cards[0].number.length;

            if (badge) {
                badge.textContent = cards[0].type;
                badge.style.display = "inline-block";
            }

            // Guardar en historial
            saveToHistory({
                bin,
                month,
                year,
                cvv,
                type: cards[0].type,
                timestamp: new Date().toISOString()
            });

            // Cambiar automáticamente a la pestaña de resultados
            switchSubTab('resultado');

            showToast("¡Generado!");

        } catch (error) {
            showToast(error.message, true);
        }
    };

    // Copiar resultado
    window.copyResults = function () {
        if (!lastResult) {
            showToast("Nada que copiar", true);
            return;
        }

        navigator.clipboard.writeText(lastResult).then(() => {
            showToast("¡Copiado al portapapeles!");
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

    // Enter para generar
    document.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            generateCards();
        }
    });

    // Funciones para controlar cantidad
    window.incrementQty = function () {
        const input = document.getElementById("quantity-input");
        if (!input) return;
        const max = parseInt(input.max) || 50;
        const current = parseInt(input.value) || 10;
        if (current < max) {
            input.value = current + 1;
        }
    };

    window.decrementQty = function () {
        const input = document.getElementById("quantity-input");
        if (!input) return;
        const min = parseInt(input.min) || 1;
        const current = parseInt(input.value) || 10;
        if (current > min) {
            input.value = current - 1;
        }
    };

    // Mini dropdowns para mes y año
    function setupMiniDropdown(btnId, selectId, dropdownId, labelId) {
        const btn = document.getElementById(btnId);
        const select = document.getElementById(selectId);
        const dropdown = document.getElementById(dropdownId);
        const label = document.getElementById(labelId);

        if (!btn || !select || !dropdown) return;

        let isOpen = false;

        function buildOptions() {
            dropdown.innerHTML = '';
            Array.from(select.options).forEach(opt => {
                const optBtn = document.createElement('button');
                optBtn.type = 'button';
                optBtn.className = 'mini-option' + (opt.value === select.value ? ' selected' : '');
                optBtn.textContent = opt.textContent;
                optBtn.onclick = () => {
                    select.value = opt.value;
                    if (label) label.textContent = opt.textContent;
                    closeDropdown();
                };
                dropdown.appendChild(optBtn);
            });
        }

        function openDropdown() {
            buildOptions();
            dropdown.hidden = false;
            setTimeout(() => dropdown.classList.add('open'), 10);
            isOpen = true;
        }

        function closeDropdown() {
            dropdown.classList.remove('open');
            setTimeout(() => dropdown.hidden = true, 200);
            isOpen = false;
        }

        btn.addEventListener('click', () => {
            if (isOpen) closeDropdown();
            else openDropdown();
        });

        document.addEventListener('click', (e) => {
            if (isOpen && !btn.contains(e.target) && !dropdown.contains(e.target)) {
                closeDropdown();
            }
        });
    }

    // Inicializar dropdowns
    setupMiniDropdown('month-btn', 'month-select', 'month-dropdown', 'month-label');
    setupMiniDropdown('year-btn', 'year-select', 'year-dropdown', 'year-label');

    // Lógica para el botón de borrado rápido (BIN) y botón de pegar
    const binInput = document.getElementById("bin-input");
    const clearBinBtn = document.getElementById("clear-bin");
    const pasteBinBtn = document.getElementById("paste-bin");

    // Función para procesar el BIN con formato de tuberías
    function processBinInput(rawValue) {
        if (!rawValue.includes('|')) return false;

        const parts = rawValue.split('|').map(p => p.trim());
        console.log("Partes extraídas:", parts);

        // BIN/Número
        binInput.value = parts[0] || "";

        // Mes
        if (parts[1] !== undefined && parts[1] !== '') {
            const monthSelect = document.getElementById("month-select");
            const monthLabel = document.getElementById("month-label");
            const val = parts[1].toLowerCase() === 'rnd' ? "" : parts[1].padStart(2, '0');
            if (monthSelect) {
                monthSelect.value = val;
                if (monthSelect.selectedIndex === -1) monthSelect.value = "";
                const selectedOption = monthSelect.options[monthSelect.selectedIndex];
                if (monthLabel && selectedOption) monthLabel.textContent = selectedOption.textContent;
            }
        }

        // Año
        if (parts[2] !== undefined && parts[2] !== '') {
            const yearSelect = document.getElementById("year-select");
            const yearLabel = document.getElementById("year-label");
            let val = parts[2].toLowerCase() === 'rnd' ? "" : parts[2];
            if (val && val.length === 2) {
                val = "20" + val;
            }
            if (yearSelect) {
                yearSelect.value = val;
                if (yearSelect.selectedIndex === -1) yearSelect.value = "";
                const selectedOption = yearSelect.options[yearSelect.selectedIndex];
                if (yearLabel && selectedOption) yearLabel.textContent = selectedOption.textContent;
            }
        }

        // CVV
        if (parts[3] !== undefined && parts[3] !== '') {
            const cvvInput = document.getElementById("cvv-input");
            if (cvvInput) {
                cvvInput.value = parts[3].toLowerCase() === 'rnd' ? "" : parts[3];
            }
        }

        return true;
    }

    if (binInput && clearBinBtn && pasteBinBtn) {
        // Función para alternar entre botón de pegar y botón X
        const toggleButtons = () => {
            const hasValue = binInput.value.length > 0;
            clearBinBtn.hidden = !hasValue;
            pasteBinBtn.hidden = hasValue;
        };

        // Manejar click en botón de pegar
        pasteBinBtn.addEventListener("click", async () => {
            let clipboardText = "";

            try {
                // Intentar usar la interfaz nativa de Android primero
                if (typeof AndroidClipboard !== 'undefined' && AndroidClipboard.getClipboardText) {
                    clipboardText = AndroidClipboard.getClipboardText();
                } else {
                    // Fallback a la API del navegador
                    clipboardText = await navigator.clipboard.readText();
                }

                const trimmedText = clipboardText.trim();

                if (trimmedText) {
                    if (processBinInput(trimmedText)) {
                        showToast("Datos extraídos del BIN");
                    } else {
                        binInput.value = trimmedText;
                        showToast("BIN pegado");
                    }
                    toggleButtons();
                    binInput.focus();
                } else {
                    showToast("Portapapeles vacío", true);
                }
            } catch (err) {
                console.error("Error al leer portapapeles:", err);
                showToast("No se pudo acceder al portapapeles", true);
            }
        });

        // Manejar evento de pegado específicamente
        binInput.addEventListener("paste", (e) => {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text').trim();
            console.log("Texto pegado:", pastedText);

            if (processBinInput(pastedText)) {
                showToast("Datos extraídos del BIN");
            } else {
                binInput.value = pastedText;
            }
            toggleButtons();
        });

        binInput.addEventListener("input", (e) => {
            const rawValue = binInput.value.trim();
            console.log("Input detectado:", rawValue);

            if (processBinInput(rawValue)) {
                showToast("Datos extraídos del BIN");
            }

            toggleButtons();
        });

        clearBinBtn.addEventListener("click", () => {
            // Limpiar BIN
            binInput.value = "";
            toggleButtons();

            // Limpiar Mes
            const monthSelect = document.getElementById("month-select");
            const monthLabel = document.getElementById("month-label");
            if (monthSelect) {
                monthSelect.value = "";
                if (monthLabel) monthLabel.textContent = "Auto";
            }

            // Limpiar Año
            const yearSelect = document.getElementById("year-select");
            const yearLabel = document.getElementById("year-label");
            if (yearSelect) {
                yearSelect.value = "";
                if (yearLabel) yearLabel.textContent = "Auto";
            }

            // Limpiar CVV
            const cvvInput = document.getElementById("cvv-input");
            if (cvvInput) {
                cvvInput.value = "";
            }

            binInput.focus();
        });

        // Inicializar estado de los botones
        toggleButtons();
    }

    // --- Lógica de Historial ---
    let history = JSON.parse(localStorage.getItem('binHistory') || '[]');

    function saveToHistory(item) {
        // Evitar duplicados consecutivos con mismos parámetros
        const last = history[0];
        if (last && last.bin === item.bin && last.month === item.month && last.year === item.year && last.cvv === item.cvv) {
            return;
        }

        history.unshift(item);
        if (history.length > 20) history.pop(); // Limitar a 20 items

        localStorage.setItem('binHistory', JSON.stringify(history));
        renderHistory();
    }

    // --- Lógica de Sub-pestañas ---
    window.switchSubTab = function (tabName) {
        document.querySelectorAll('.sub-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('onclick').includes(`'${tabName}'`));
        });
        document.querySelectorAll('.sub-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `sub-tab-${tabName}`);
        });
    };

    function updateHistoryBadge() {
        const badge = document.getElementById("history-badge");
        if (!badge) return;
        badge.textContent = history.length;
        badge.style.display = history.length > 0 ? "inline-block" : "none";
    }

    function renderHistory() {
        const historyList = document.getElementById("history-list");
        if (!historyList) return;

        updateHistoryBadge();

        if (history.length === 0) {
            historyList.innerHTML = '<div style="text-align:center; padding: 20px; color: var(--text-secondary); opacity: 0.5;">Sin historial...</div>';
            return;
        }

        historyList.innerHTML = "";

        history.forEach((item, index) => {
            const div = document.createElement("div");
            div.className = "history-item";

            const metaStr = [
                item.month || 'Auto',
                item.year || 'Auto',
                item.cvv || 'Auto'
            ].filter(Boolean).join(' | ');

            div.innerHTML = `
                <div class="history-info">
                    <span class="history-bin">${item.bin}</span>
                    <span class="history-meta">${item.type} • ${metaStr}</span>
                </div>
                <div class="history-date">
                    ${new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            `;

            div.onclick = () => {
                const bInput = document.getElementById("bin-input");
                if (bInput) {
                    bInput.value = item.bin;
                    bInput.dispatchEvent(new Event('input')); // Trigger clear button check
                }

                const mSelect = document.getElementById("month-select");
                const ySelect = document.getElementById("year-select");
                const cInput = document.getElementById("cvv-input");

                if (mSelect) {
                    mSelect.value = item.month || "";
                    const mLabel = document.getElementById("month-label");
                    if (mLabel) mLabel.textContent = mSelect.options[mSelect.selectedIndex].textContent;
                }
                if (ySelect) {
                    ySelect.value = item.year || "";
                    const yLabel = document.getElementById("year-label");
                    if (yLabel) yLabel.textContent = ySelect.options[ySelect.selectedIndex].textContent;
                }
                if (cInput) cInput.value = item.cvv || "";

                showToast("BIN cargado");
            };

            historyList.appendChild(div);
        });
    }

    // --- Lógica de Modal de Confirmación ---
    function showConfirmModal(callback) {
        const modal = document.getElementById('confirm-modal');
        const confirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = document.getElementById('modal-cancel');

        if (!modal || !confirmBtn || !cancelBtn) return;

        modal.hidden = false;

        const closeModal = () => {
            modal.hidden = true;
            confirmBtn.onclick = null;
            cancelBtn.onclick = null;
        };

        confirmBtn.onclick = () => {
            callback();
            closeModal();
        };

        cancelBtn.onclick = closeModal;

        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
    }

    window.clearHistory = function () {
        showConfirmModal(() => {
            history = [];
            localStorage.removeItem('binHistory');
            renderHistory();
            showToast("Historial borrado");
        });
    };

    // Inicializar historial al cargar
    renderHistory();
})();
