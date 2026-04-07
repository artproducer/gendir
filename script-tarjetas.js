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
            // Visa: empieza con 4
            if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(cardNumber)) return "Visa";

            // Mastercard: 51-55 o 2221-2720
            if (/^5[1-5][0-9]{14}$/.test(cardNumber)) return "Mastercard";
            if (/^2(?:2(?:2[1-9]|[3-9][0-9])|[3-6][0-9]{2}|7(?:[01][0-9]|20))[0-9]{12}$/.test(cardNumber)) return "Mastercard";

            // American Express: 34 o 37
            if (/^3[47][0-9]{13}$/.test(cardNumber)) return "Amex";

            // Discover: 6011, 622126-622925, 644-649, 65
            if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(cardNumber)) return "Discover";
            if (/^64[4-9][0-9]{13}$/.test(cardNumber)) return "Discover";
            if (/^6221(?:2[6-9]|[3-9][0-9])[0-9]{10}$/.test(cardNumber)) return "Discover";
            if (/^622[2-8][0-9]{12}$/.test(cardNumber)) return "Discover";
            if (/^6229(?:[01][0-9]|2[0-5])[0-9]{10}$/.test(cardNumber)) return "Discover";

            // JCB: 3528-3589
            if (/^35(?:2[89]|[3-8][0-9])[0-9]{12}$/.test(cardNumber)) return "JCB";

            // Diners Club: 300-305, 36, 38, 39
            if (/^3(?:0[0-5]|[689])[0-9]{11,14}$/.test(cardNumber)) return "Diners Club";

            // UnionPay: 62, 81
            if (/^62[0-9]{14,17}$/.test(cardNumber)) return "UnionPay";
            if (/^81[0-9]{14,17}$/.test(cardNumber)) return "UnionPay";

            // Maestro: 50, 56-69 (12-19 dígitos)
            if (/^(?:50|5[6-9]|6[0-9])[0-9]{10,17}$/.test(cardNumber)) return "Maestro";

            // Mir (Rusia): 2200-2204
            if (/^220[0-4][0-9]{12}$/.test(cardNumber)) return "Mir";

            // Elo (Brasil): varios rangos
            if (/^(?:4011|4312|4389|4514|4576|5041|5066|5067|6277|6362|6363|6504|6505|6506|6507|6509|6516|6550)[0-9]{12}$/.test(cardNumber)) return "Elo";

            // Hipercard (Brasil): 606282
            if (/^606282[0-9]{10}$/.test(cardNumber)) return "Hipercard";

            // Troy (Turquía): 9792
            if (/^9792[0-9]{12}$/.test(cardNumber)) return "Troy";

            // RuPay (India): 60, 65, 81, 82, 508
            if (/^(?:508|60|65|81|82)[0-9]{12,15}$/.test(cardNumber)) return "RuPay";

            return "Desconocido";
        }

        // Detectar tipo de tarjeta desde el prefijo (para mostrar mientras se escribe)
        detectCardTypeFromPrefix(prefix) {
            // Limpiar el prefijo de caracteres no numéricos
            const cleanPrefix = prefix.replace(/[^0-9]/g, '');
            if (cleanPrefix.length < 1) return null;

            const p = cleanPrefix;

            // Visa: empieza con 4
            if (/^4/.test(p)) return "Visa";

            // Mastercard: 51-55 o 2221-2720
            if (/^5[1-5]/.test(p)) return "Mastercard";
            if (/^2[2-7]/.test(p)) {
                if (p.length >= 4) {
                    const fourDigit = parseInt(p.substring(0, 4));
                    if (fourDigit >= 2221 && fourDigit <= 2720) return "Mastercard";
                } else if (/^2[2-6]/.test(p) || /^27[0-1]/.test(p)) {
                    return "Mastercard";
                }
            }

            // American Express: 34 o 37
            if (/^3[47]/.test(p)) return "Amex";

            // JCB: 3528-3589
            if (/^35[2-8]/.test(p)) return "JCB";

            // Diners Club: 300-305, 36, 38, 39
            if (/^30[0-5]/.test(p)) return "Diners Club";
            if (/^3[689]/.test(p)) return "Diners Club";

            // Discover: 6011, 622126-622925, 644-649, 65
            if (/^6011/.test(p)) return "Discover";
            if (/^65/.test(p)) return "Discover";
            if (/^64[4-9]/.test(p)) return "Discover";
            if (/^622[1-9]/.test(p)) return "Discover";

            // UnionPay: 62
            if (/^62/.test(p)) return "UnionPay";

            // Maestro: 50, 56-69
            if (/^50/.test(p)) return "Maestro";
            if (/^5[6-9]/.test(p)) return "Maestro";
            if (/^6[0-9]/.test(p) && !/^6011/.test(p) && !/^65/.test(p) && !/^64[4-9]/.test(p) && !/^62/.test(p)) return "Maestro";

            // Mir: 2200-2204
            if (/^220[0-4]/.test(p)) return "Mir";

            // Hipercard: 606282
            if (/^6062/.test(p)) return "Hipercard";

            // Troy: 9792
            if (/^9792/.test(p)) return "Troy";

            // Elo: varios rangos comunes
            if (/^(4011|4312|4389|4514|4576|5041|5066|5067|6277|6362|6363|6504|6505|6506|6507|6509|6516|6550)/.test(p)) return "Elo";

            // RuPay: 508, 60, 65, 81, 82
            if (/^508/.test(p)) return "RuPay";
            if (/^8[12]/.test(p)) return "UnionPay"; // 81, 82 también son UnionPay

            return null;
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
        const resultStats = document.getElementById("result-stats");
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

            // Formatear resultado para copiar todo
            lastResult = cards.map(card => {
                let line = card.number;
                if (card.month && card.year) line += `|${card.month}|${card.year}`;
                if (card.cvv) line += `|${card.cvv}`;
                return line;
            }).join("\n");

            // Renderizar tarjetas interactivas
            if (output) {
                output.innerHTML = '';
                cards.forEach((card, index) => {
                    const cardEl = document.createElement('div');
                    cardEl.className = 'card-item';
                    cardEl.dataset.index = index;

                    const fullData = `${card.number}|${card.month}|${card.year}|${card.cvv}`;
                    cardEl.dataset.full = fullData;

                    // Helper para agregar long press a un elemento
                    function addLongPress(element, callback) {
                        let pressTimer = null;
                        let longPressTriggered = false;

                        element.addEventListener('touchstart', (e) => {
                            longPressTriggered = false;
                            pressTimer = setTimeout(() => {
                                longPressTriggered = true;
                                callback(e);
                            }, 400);
                        }, { passive: true });

                        element.addEventListener('touchend', () => {
                            clearTimeout(pressTimer);
                        });

                        element.addEventListener('touchmove', () => {
                            clearTimeout(pressTimer);
                        });
                    }

                    // Número de tarjeta
                    const numberSpan = document.createElement('span');
                    numberSpan.className = 'card-number';
                    numberSpan.textContent = card.number;
                    const copyNumber = (e) => {
                        e.stopPropagation();
                        copyCardPart(card.number, 'Número copiado', cardEl);
                    };
                    numberSpan.onclick = copyNumber;
                    addLongPress(numberSpan, copyNumber);

                    // Separador
                    const sep1 = document.createElement('span');
                    sep1.className = 'card-separator';
                    sep1.textContent = '|';

                    // Fecha (mes|año)
                    const dateSpan = document.createElement('span');
                    dateSpan.className = 'card-date';
                    dateSpan.textContent = `${card.month}|${card.year.slice(-2)}`;
                    const copyDate = (e) => {
                        e.stopPropagation();
                        copyCardPart(`${card.month}/${card.year.slice(-2)}`, 'Fecha copiada', cardEl);
                    };
                    dateSpan.onclick = copyDate;
                    addLongPress(dateSpan, copyDate);

                    // Separador
                    const sep2 = document.createElement('span');
                    sep2.className = 'card-separator';
                    sep2.textContent = '|';

                    // CVV
                    const cvvSpan = document.createElement('span');
                    cvvSpan.className = 'card-cvv';
                    cvvSpan.textContent = card.cvv;
                    const copyCvv = (e) => {
                        e.stopPropagation();
                        copyCardPart(card.cvv, 'CVV copiado', cardEl);
                    };
                    cvvSpan.onclick = copyCvv;
                    addLongPress(cvvSpan, copyCvv);

                    // Doble click para copiar todo
                    cardEl.ondblclick = () => {
                        copyCardPart(fullData, 'Tarjeta completa copiada', cardEl);
                    };

                    cardEl.appendChild(numberSpan);
                    cardEl.appendChild(sep1);
                    cardEl.appendChild(dateSpan);
                    cardEl.appendChild(sep2);
                    cardEl.appendChild(cvvSpan);

                    output.appendChild(cardEl);
                });
            }

            // Mostrar estadísticas
            if (resultStats) resultStats.style.display = "flex";

            const statCount = document.getElementById("stat-count");
            const statLength = document.getElementById("stat-length");

            if (statCount) statCount.textContent = cards.length;
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

    function t(key, enFallback, esFallback) {
        if (window.currentTranslations && window.currentTranslations[key]) {
            return window.currentTranslations[key];
        }

        const lang = window.currentLang || localStorage.getItem('language') || 'en';
        return lang === 'es' ? (esFallback || enFallback) : enFallback;
    }

    // Copiar parte de tarjeta y marcar como última copiada
    function copyCardPart(text, message, cardElement) {
        navigator.clipboard.writeText(text).then(() => {
            // Quitar clase de todas las tarjetas anteriores
            document.querySelectorAll('.card-item.last-copied').forEach(el => {
                el.classList.remove('last-copied');
            });

            // Marcar esta tarjeta como última copiada
            if (cardElement) {
                cardElement.classList.add('last-copied');
            }

            showToast(message);
        }).catch(() => {
            showToast("Error al copiar", true);
        });
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

    // Función inteligente para procesar el BIN desde varios formatos
    // Solo procesa formatos complejos (con pipes o etiquetas), no BINs simples
    function processBinInput(rawValue, isManualTyping = false) {
        let bin = "";
        let month = "";
        let year = "";
        let cvv = "";
        let extracted = false;

        // Limpiar emojis y caracteres especiales para búsqueda
        const cleanText = rawValue.replace(/[\u{1F300}-\u{1F9FF}]/gu, ' ').replace(/[➡️✅🟢😵‍💫📺🌐]/g, ' ');

        // FORMATO 1: Tubería simple (515462002xxxx|07|32|rnd)
        const pipeMatch = rawValue.match(/^([0-9xX]{6,19})\|([0-9]{1,2}|rnd|rdn)\|([0-9]{2,4}|rnd|rdn)(?:\|([0-9]{3,4}|rnd|rdn))?$/i);
        if (pipeMatch) {
            bin = pipeMatch[1];
            month = pipeMatch[2];
            year = pipeMatch[3];
            cvv = pipeMatch[4] || "";
            extracted = true;
        }

        // FORMATO 2: Texto complejo con etiquetas (BIN:, FECHA:, CVV:, etc.)
        if (!extracted) {
            // Buscar BIN con varios patrones
            const binPatterns = [
                /BIN\s*[:\-|]\s*([0-9xX]{6,19})/i,
                /CARD\s*[:\-|]\s*([0-9xX]{6,19})/i,
                /CC\s*[:\-|]\s*([0-9xX]{6,19})/i,
                /TARJETA\s*[:\-|]\s*([0-9xX]{6,19})/i,
                /N[UÚ]MERO\s*[:\-|]\s*([0-9xX]{6,19})/i
            ];

            for (const pattern of binPatterns) {
                const match = cleanText.match(pattern);
                if (match) {
                    bin = match[1];
                    extracted = true;
                    break;
                }
            }

            // Buscar fecha con formato MM/YY o MM/YYYY
            const datePatterns = [
                /FECHA\s*[:\-|]\s*([0-9]{1,2})\s*[\/\-]\s*([0-9]{2,4})/i,
                /DATE\s*[:\-|]\s*([0-9]{1,2})\s*[\/\-]\s*([0-9]{2,4})/i,
                /EXP(?:IRY)?\s*[:\-|]\s*([0-9]{1,2})\s*[\/\-]\s*([0-9]{2,4})/i,
                /VENCE?\s*[:\-|]\s*([0-9]{1,2})\s*[\/\-]\s*([0-9]{2,4})/i,
                /([0-9]{2})\s*[\/\-]\s*([0-9]{2,4})(?:\s|$)/
            ];

            for (const pattern of datePatterns) {
                const match = cleanText.match(pattern);
                if (match) {
                    month = match[1];
                    year = match[2];
                    break;
                }
            }

            // Buscar CVV
            const cvvPatterns = [
                /CVV\s*[:\-|]\s*([0-9]{3,4}|rnd|rdn)/i,
                /CVC\s*[:\-|]\s*([0-9]{3,4}|rnd|rdn)/i,
                /CVV2?\s*[:\-|]\s*([0-9]{3,4}|rnd|rdn)/i,
                /C[OÓ]DIGO\s*[:\-|]\s*([0-9]{3,4}|rnd|rdn)/i
            ];

            for (const pattern of cvvPatterns) {
                const match = cleanText.match(pattern);
                if (match) {
                    cvv = match[1];
                    break;
                }
            }
        }

        // Si es escritura manual y no se encontró formato con tuberías ni etiquetas, no hacer nada
        // Esto permite al usuario escribir y editar libremente el BIN
        if (isManualTyping && !pipeMatch && !extracted) {
            return false;
        }

        // Si no se encontró un formato especial pero hay datos, intentar extraer BIN simple
        // Solo si NO es escritura manual (es decir, es paste o botón de pegar)
        if (!extracted && !bin && !isManualTyping) {
            const anyBinMatch = rawValue.match(/([0-9]{6,16}[xX]{0,10}|[0-9xX]{6,19})/);
            if (anyBinMatch && anyBinMatch[1].replace(/[xX]/g, '').length >= 6) {
                bin = anyBinMatch[1];
                extracted = true;
            }
        }

        if (!bin && !extracted) return false;

        console.log("Datos extraídos:", { bin, month, year, cvv });

        // Aplicar valores extraídos
        binInput.value = bin;

        // Aplicar Mes
        const monthSelect = document.getElementById("month-select");
        const monthLabel = document.getElementById("month-label");
        if (month && !/rnd|rdn/i.test(month)) {
            const monthVal = month.padStart(2, '0');
            if (monthSelect) {
                monthSelect.value = monthVal;
                if (monthSelect.selectedIndex === -1) monthSelect.value = "";
                const selectedOption = monthSelect.options[monthSelect.selectedIndex];
                if (monthLabel && selectedOption) monthLabel.textContent = selectedOption.textContent;
            }
        }

        // Aplicar Año
        const yearSelect = document.getElementById("year-select");
        const yearLabel = document.getElementById("year-label");
        if (year && !/rnd|rdn/i.test(year)) {
            let yearVal = year;
            if (yearVal.length === 2) yearVal = "20" + yearVal;
            if (yearSelect) {
                yearSelect.value = yearVal;
                if (yearSelect.selectedIndex === -1) yearSelect.value = "";
                const selectedOption = yearSelect.options[yearSelect.selectedIndex];
                if (yearLabel && selectedOption) yearLabel.textContent = selectedOption.textContent;
            }
        }

        // Aplicar CVV
        const cvvInputEl = document.getElementById("cvv-input");
        if (cvv && !/rnd|rdn/i.test(cvv) && cvvInputEl) {
            cvvInputEl.value = cvv;
        }

        return true;
    }

    // Función para actualizar el badge del tipo de tarjeta en tiempo real
    function updateBinTypeBadge(binValue) {
        const badge = document.getElementById("bin-type-badge");
        if (!badge) return;

        const cleanBin = binValue.replace(/[^0-9]/g, '');

        if (cleanBin.length >= 1) {
            const cardType = generator.detectCardTypeFromPrefix(cleanBin);
            if (cardType) {
                badge.textContent = cardType;
                badge.style.display = "inline-block";
                return;
            }
        }

        badge.style.display = "none";
        badge.textContent = "";
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
                    updateBinTypeBadge(binInput.value);
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
            updateBinTypeBadge(binInput.value);
        });

        binInput.addEventListener("input", (e) => {
            const rawValue = binInput.value;

            // Solo intentar procesar si parece tener formato especial (pipes o etiquetas)
            // De lo contrario, dejar que el usuario escriba libremente
            if (rawValue.includes('|') || /BIN|CARD|CC|TARJETA/i.test(rawValue)) {
                if (processBinInput(rawValue, true)) {
                    showToast("Datos extraídos del BIN");
                }
            }

            toggleButtons();
            updateBinTypeBadge(binInput.value);
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

            // Limpiar badge del tipo de tarjeta
            updateBinTypeBadge("");

            binInput.focus();
        });

        // Inicializar estado de los botones
        toggleButtons();
    }

    // --- Lógica de Historial ---
    const MAX_HISTORY_ITEMS = 20;
    const HISTORY_PENDING_RESET_KEY = 'binHistoryPendingResetAt';
    const historySyncPanel = document.querySelector('.history-sync-panel');
    const historySyncInput = document.getElementById("history-sync-code");
    const historySyncSaved = document.getElementById("history-sync-saved");
    const historySyncSaveBtn = document.getElementById("history-sync-save");
    const historySyncSaveText = document.getElementById("history-sync-save-text");
    const historySyncNowBtn = document.getElementById("history-sync-now");
    const historySyncStatus = document.getElementById("history-sync-status");
    let historySyncState = 'local';
    let historySyncCompact = false;
    let lastRemoteResetAt = null;
    let pendingRemoteResetAt = localStorage.getItem(HISTORY_PENDING_RESET_KEY) || null;
    let history = [];

    function toHistoryTimestamp(value) {
        const date = value ? new Date(value) : new Date();
        return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    }

    function makeHistoryEntryId() {
        if (window.crypto && typeof window.crypto.randomUUID === 'function') {
            return window.crypto.randomUUID();
        }

        return `hist-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
    }

    function normalizeHistoryItem(item) {
        const source = item || {};

        return {
            entryId: String(source.entryId || source.id || makeHistoryEntryId()),
            bin: String(source.bin || '').trim(),
            month: source.month ? String(source.month) : '',
            year: source.year ? String(source.year) : '',
            cvv: source.cvv ? String(source.cvv) : '',
            type: source.type ? String(source.type) : '',
            timestamp: toHistoryTimestamp(source.timestamp)
        };
    }

    function makeHistoryIdentity(item) {
        const normalized = normalizeHistoryItem(item);
        return [
            normalized.bin,
            normalized.month || '',
            normalized.year || '',
            normalized.cvv || ''
        ].join('|');
    }

    function dedupeHistoryItems(items) {
        const seenEntries = new Set();
        const seenIdentities = new Set();
        const uniqueItems = [];

        items.forEach((item) => {
            const normalizedItem = normalizeHistoryItem(item);
            if (!normalizedItem.bin) return;
            if (seenEntries.has(normalizedItem.entryId)) return;

            seenEntries.add(normalizedItem.entryId);
            uniqueItems.push(normalizedItem);
        });

        uniqueItems.sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());
        const compactByIdentity = [];

        uniqueItems.forEach((item) => {
            const identity = makeHistoryIdentity(item);
            if (seenIdentities.has(identity)) return;

            seenIdentities.add(identity);
            compactByIdentity.push(item);
        });

        return compactByIdentity.slice(0, MAX_HISTORY_ITEMS);
    }

    function persistHistory() {
        if (history.length > 0) {
            localStorage.setItem('binHistory', JSON.stringify(history));
        } else {
            localStorage.removeItem('binHistory');
        }
    }

    function setPendingRemoteReset(resetAt) {
        const normalized = resetAt ? toHistoryTimestamp(resetAt) : null;
        pendingRemoteResetAt = normalized;

        if (normalized) {
            localStorage.setItem(HISTORY_PENDING_RESET_KEY, normalized);
        } else {
            localStorage.removeItem(HISTORY_PENDING_RESET_KEY);
        }
    }

    function loadStoredHistory() {
        try {
            const parsedHistory = JSON.parse(localStorage.getItem('binHistory') || '[]');
            return dedupeHistoryItems(Array.isArray(parsedHistory) ? parsedHistory : []);
        } catch (error) {
            console.error("Error leyendo historial local:", error);
            return [];
        }
    }


    function updateSyncStatus(state) {
        historySyncState = state;

        if (!historySyncStatus) return;

        const statusMessages = {
            local: t('sync_status_local', 'History is only stored on this device.', 'Historial solo local en este dispositivo.'),
            ready: t('sync_status_ready', 'Sync is active.', 'Sincronizacion activa.'),
            syncing: t('sync_status_syncing', 'Syncing history...', 'Sincronizando historial...'),
            error: t('sync_status_error', 'Could not sync history.', 'No se pudo sincronizar el historial.'),
            offline: t('sync_status_offline', 'Supabase is not available. Local history only.', 'Supabase no esta disponible. Se usa historial local.')
        };

        historySyncStatus.textContent = statusMessages[state] || statusMessages.local;
        historySyncStatus.classList.toggle('is-ready', state === 'ready');
        historySyncStatus.classList.toggle('is-error', state === 'error');
        historySyncStatus.setAttribute('data-sync-status', state);

        if (historySyncNowBtn) {
            const backendUnavailable = typeof window.fetchSyncedBinHistory !== 'function';
            const syncDisabled = typeof window.isBinHistorySyncEnabled === 'function' && !window.isBinHistorySyncEnabled();
            historySyncNowBtn.disabled = state === 'syncing' || backendUnavailable || syncDisabled;
        }
    }

    function maskSyncCode(value) {
        const code = String(value || '').trim();
        if (!code) return '****';
        if (code.length <= 4) return '*'.repeat(code.length);
        return `${code.slice(0, 2)}${'*'.repeat(Math.max(2, code.length - 4))}${code.slice(-2)}`;
    }

    function updateSyncPanelMode(compact) {
        historySyncCompact = Boolean(compact);

        if (historySyncPanel) {
            historySyncPanel.classList.toggle('is-compact', historySyncCompact);
        }

        const storedCode = typeof window.getStoredBinSyncCode === 'function'
            ? window.getStoredBinSyncCode()
            : (historySyncInput ? historySyncInput.value.trim() : '');

        if (historySyncSaved) {
            if (historySyncCompact && storedCode) {
                historySyncSaved.hidden = false;
                historySyncSaved.textContent = `${t('sync_history_saved_as', 'Active code:', 'Codigo activo:')} ${maskSyncCode(storedCode)}`;
            } else {
                historySyncSaved.hidden = true;
                historySyncSaved.textContent = '';
            }
        }

        if (historySyncSaveText) {
            historySyncSaveText.textContent = historySyncCompact
                ? t('sync_history_edit', 'Edit code', 'Editar codigo')
                : t('sync_history_save', 'Save code', 'Guardar codigo');
        }
    }

    async function syncHistoryWithCloud(showSuccessToast = true) {
        if (typeof window.fetchSyncedBinHistory !== 'function') {
            updateSyncStatus('offline');
            return false;
        }

        if (typeof window.isBinHistorySyncEnabled !== 'function' || !window.isBinHistorySyncEnabled()) {
            updateSyncStatus('local');
            return false;
        }

        updateSyncStatus('syncing');

        try {
            if (pendingRemoteResetAt && typeof window.resetSyncedBinHistory === 'function') {
                await window.resetSyncedBinHistory(undefined, pendingRemoteResetAt);
                lastRemoteResetAt = pendingRemoteResetAt;
                setPendingRemoteReset(null);
            }

            const remoteSnapshot = await window.fetchSyncedBinHistory();
            lastRemoteResetAt = remoteSnapshot.resetAt || null;

            let localItems = history.slice();
            if (lastRemoteResetAt) {
                localItems = localItems.filter((item) => new Date(item.timestamp).getTime() > new Date(lastRemoteResetAt).getTime());
            }

            const remoteItems = dedupeHistoryItems(Array.isArray(remoteSnapshot.items) ? remoteSnapshot.items : []);
            const remoteEntryIds = new Set(remoteItems.map((item) => item.entryId));

            for (const item of localItems) {
                if (remoteEntryIds.has(item.entryId)) continue;
                if (typeof window.saveSyncedBinHistoryEntry === 'function') {
                    await window.saveSyncedBinHistoryEntry(item);
                }
            }

            history = dedupeHistoryItems(localItems.concat(remoteItems));
            persistHistory();
            renderHistory();
            updateSyncStatus('ready');

            if (showSuccessToast) {
                showToast(t('toast_history_synced', 'History synced', 'Historial sincronizado'));
            }

            return true;
        } catch (error) {
            console.error("Error sincronizando historial:", error);
            updateSyncStatus('error');
            return false;
        }
    }

    async function saveSyncCode() {
        if (!historySyncInput || typeof window.setStoredBinSyncCode !== 'function') {
            updateSyncStatus('offline');
            return;
        }

        if (historySyncCompact) {
            updateSyncPanelMode(false);
            historySyncInput.focus();
            historySyncInput.select();
            return;
        }

        const syncCode = historySyncInput.value.trim();

        if (!syncCode) {
            window.setStoredBinSyncCode('');
            lastRemoteResetAt = null;
            setPendingRemoteReset(null);
            updateSyncPanelMode(false);
            updateSyncStatus('local');
            showToast(t('toast_sync_disabled', 'Sync disabled', 'Sincronizacion desactivada'));
            return;
        }

        window.setStoredBinSyncCode(syncCode);
        updateSyncPanelMode(true);
        showToast(t('toast_sync_saved', 'Sync code saved', 'Codigo de sincronizacion guardado'));

        if (typeof window.fetchSyncedBinHistory !== 'function') {
            updateSyncStatus('offline');
            return;
        }

        updateSyncStatus('ready');
    }

    function setupHistorySyncControls() {
        history = loadStoredHistory();
        persistHistory();
        const hasStoredSyncCode = typeof window.isBinHistorySyncEnabled === 'function' && window.isBinHistorySyncEnabled();

        if (historySyncInput && typeof window.getStoredBinSyncCode === 'function') {
            historySyncInput.value = window.getStoredBinSyncCode();
            historySyncInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    saveSyncCode();
                }
            });
        }

        if (historySyncSaveBtn) {
            historySyncSaveBtn.addEventListener('click', () => {
                saveSyncCode();
            });
        }

        if (historySyncNowBtn) {
            historySyncNowBtn.addEventListener('click', () => {
                syncHistoryWithCloud();
            });
        }

        if (typeof window.fetchSyncedBinHistory !== 'function') {
            updateSyncStatus('offline');
            updateSyncPanelMode(hasStoredSyncCode);
            return;
        }

        if (hasStoredSyncCode) {
            updateSyncStatus('ready');
            updateSyncPanelMode(true);
        } else {
            updateSyncStatus('local');
            updateSyncPanelMode(false);
        }
    }

    function saveToHistory(item) {
        const normalizedItem = normalizeHistoryItem(item);
        const itemIdentity = makeHistoryIdentity(normalizedItem);
        const existingIndex = history.findIndex((entry) => makeHistoryIdentity(entry) === itemIdentity);

        let nextItem = normalizedItem;
        let baseHistory = history.slice();

        if (existingIndex !== -1) {
            const existing = history[existingIndex];
            nextItem = normalizeHistoryItem({
                ...existing,
                ...normalizedItem,
                entryId: existing.entryId,
                timestamp: toHistoryTimestamp()
            });
            baseHistory.splice(existingIndex, 1);
        }

        history = dedupeHistoryItems([nextItem].concat(baseHistory));
        persistHistory();
        renderHistory();

        if (typeof window.isBinHistorySyncEnabled === 'function' && window.isBinHistorySyncEnabled()) {
            syncHistoryWithCloud(false);
        }
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
            historyList.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--text-secondary); opacity: 0.5;">${t('history_empty', 'No history yet...', 'Sin historial...')}</div>`;
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

            const dateObj = new Date(item.timestamp);
            const dateStr = dateObj.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            div.innerHTML = `
                <div class="history-info">
                    <span class="history-bin">${item.bin}</span>
                    <span class="history-meta">${item.type} • ${metaStr}</span>
                </div>
                <div class="history-date">
                    <span>${dateStr}</span>
                    <span>${timeStr}</span>
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
                    const mOption = mSelect.options[mSelect.selectedIndex];
                    if (mLabel && mOption) mLabel.textContent = mOption.textContent;
                }
                if (ySelect) {
                    ySelect.value = item.year || "";
                    const yLabel = document.getElementById("year-label");
                    const yOption = ySelect.options[ySelect.selectedIndex];
                    if (yLabel && yOption) yLabel.textContent = yOption.textContent;
                }
                if (cInput) cInput.value = item.cvv || "";

                showToast(t('toast_bin_loaded', 'BIN loaded', 'BIN cargado'));
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

        confirmBtn.onclick = async () => {
            await callback();
            closeModal();
        };

        cancelBtn.onclick = closeModal;

        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
    }

    window.clearHistory = function () {
        showConfirmModal(async () => {
            const resetAt = new Date().toISOString();
            history = [];
            persistHistory();
            lastRemoteResetAt = resetAt;

            if (typeof window.isBinHistorySyncEnabled === 'function' && window.isBinHistorySyncEnabled()) {
                setPendingRemoteReset(resetAt);
                updateSyncStatus('ready');
            }

            renderHistory();
            showToast(t('toast_history_cleared', 'History cleared', 'Historial borrado'));
        });
    };

    // Inicializar historial al cargar
    setupHistorySyncControls();
    renderHistory();

    // --- Tooltip de Ayuda del BIN ---
    const helpBtn = document.getElementById('bin-help-btn');
    const helpTooltip = document.getElementById('bin-help-tooltip');
    const helpCloseBtn = document.getElementById('bin-help-close');

    if (helpBtn && helpTooltip) {
        helpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isHidden = helpTooltip.hidden;
            helpTooltip.hidden = !isHidden;
        });

        if (helpCloseBtn) {
            helpCloseBtn.addEventListener('click', () => {
                helpTooltip.hidden = true;
            });
        }

        // Cerrar al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!helpTooltip.hidden && !helpBtn.contains(e.target) && !helpTooltip.contains(e.target)) {
                helpTooltip.hidden = true;
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (typeof window.applyLanguage === 'function' && !window.__gendirHistorySyncLanguagePatched) {
            const originalApplyLanguage = window.applyLanguage;
            window.applyLanguage = function (lang) {
                originalApplyLanguage(lang);
                updateSyncStatus(historySyncState);
                updateSyncPanelMode(historySyncCompact);
                renderHistory();
            };
            window.__gendirHistorySyncLanguagePatched = true;
        }
    });
})();

