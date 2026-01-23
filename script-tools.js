// Tools Tab Script
// Loads links from tools-links.json and handles copy-to-clipboard functionality

// Icon mappings for different tool types
const toolIcons = {
    globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>`,
    'credit-card': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>`,
    shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>`,
    mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
    </svg>`,
    phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>`,
    server: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
        <line x1="6" y1="6" x2="6.01" y2="6"/>
        <line x1="6" y1="18" x2="6.01" y2="18"/>
    </svg>`,
    link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>`,
    key: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
    </svg>`,
    download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>`,
    tool: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>`
};

// Icons (Copy / Open)
const copyIconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
</svg>`;

const openIconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
</svg>`;

let allTools = [];

// Load tools from JSON file
async function loadTools() {
    try {
        const response = await fetch('tools-links.json');
        if (!response.ok) {
            throw new Error('Failed to load tools config');
        }
        const data = await response.json();
        allTools = data.tools;
        renderTools(allTools);
        
        // Setup search listener
        setupSearch();
    } catch (error) {
        console.error('Error loading tools:', error);
        renderToolsError();
    }
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('tools-search');
    const clearBtn = document.getElementById('clear-search');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = allTools.filter(tool => 
                tool.title.toLowerCase().includes(query) || 
                tool.url.toLowerCase().includes(query) ||
                (tool.category && tool.category.toLowerCase().includes(query))
            );
            
            renderTools(filtered, query.length > 0);
            
            // Toggle clear button
            if (clearBtn) {
                clearBtn.hidden = query.length === 0;
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
                searchInput.focus();
            }
        });
    }
}

// Render tools to the grid
function renderTools(tools, isSearching = false) {
    const container = document.getElementById('tools-grid');
    if (!container) return;

    container.innerHTML = '';

    if (tools.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">
                <p>No se encontraron herramientas</p>
            </div>
        `;
        return;
    }

    // Group by category if available and NOT searching (or if searching but we want to keep structure)
    // Actually, let's group by category always, defaulting to "Otros"
    const grouped = tools.reduce((acc, tool) => {
        const cat = tool.category || 'Otros';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(tool);
        return acc;
    }, {});

    // Sort categories (optional: prioritized order?)
    const categories = Object.keys(grouped).sort();

    // If searching, we might want to just show a flat list if results are few, or keep categories.
    // Let's keep categories for better organization even in search.

    categories.forEach(category => {
        // Create category header
        const catSection = document.createElement('div');
        catSection.className = 'category-section';
        catSection.style.gridColumn = '1 / -1'; // Span full width
        
        // Hide category header if we are searching and there's only one item? 
        // No, consistency is better. But maybe hide "Otros" if it's the only category?
        
        const catHeader = document.createElement('div');
        catHeader.className = 'category-title';
        catHeader.innerHTML = `
            ${category}
            <span class="category-count">${grouped[category].length}</span>
        `;
        
        // Grid specific for this category
        const catGrid = document.createElement('div');
        catGrid.className = 'tools-grid inner-grid'; 
        // We reuse .tools-grid styles but maybe need to adjust layout since it's nested
        // Actually, we can't nest grids easily if the parent is a grid.
        // Let's change the strategy: 
        // The main container shouldn't be the grid if we use headers.
        
        // Better strategy:
        // Main container (tools-container) -> [ Header, Grid, Header, Grid ... ]
    });

    // REVISION: The original HTML has #tools-grid as a grid container.
    // If we want headers inside, we should probably change #tools-grid to be a flex column 
    // and have sub-grids. OR, we make #tools-grid display: block, and inside we put sections.
    
    // Let's override #tools-grid style inline to display block if we use categories
    container.style.display = 'block';

    categories.forEach(category => {
        const section = document.createElement('div');
        section.className = 'category-section';
        section.innerHTML = `
            <div class="category-title">
                ${category}
                <span class="category-count">${grouped[category].length}</span>
            </div>
            <div class="tools-grid-inner" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
                <!-- items go here -->
            </div>
        `;
        
        const gridInner = section.querySelector('.tools-grid-inner');
        
        grouped[category].forEach(tool => {
            const toolElement = createToolElement(tool);
            gridInner.appendChild(toolElement);
        });
        
        container.appendChild(section);
    });
}

function createToolElement(tool) {
    let iconContent;

    if (tool.image) {
        iconContent = `<img src="${tool.image}" alt="${tool.title}" class="tool-icon-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
                       <div class="tool-icon-fallback" style="display:none">${toolIcons[tool.icon] || toolIcons.link}</div>`;
    } else {
        iconContent = toolIcons[tool.icon] || toolIcons.link;
    }

    const toolElement = document.createElement('div');
    toolElement.className = 'tool-item';
    toolElement.setAttribute('data-url', tool.url);

    toolElement.innerHTML = `
        <div class="tool-icon">${iconContent}</div>
        <div class="tool-info">
            <div class="tool-title">${tool.title}</div>
            <div class="tool-url">${tool.url}</div>
        </div>
        <div class="tool-actions">
            <button class="tool-action-btn tool-copy-btn" title="Copiar enlace">
                ${copyIconSvg}
            </button>
            <button class="tool-action-btn tool-open-btn" title="Abrir en nueva pestaña">
                ${openIconSvg}
            </button>
        </div>
    `;

    // Click handler for the whole card updates copy
    toolElement.addEventListener('click', (e) => {
        // Prevent if clicked on open button
        if (e.target.closest('.tool-open-btn')) return;
        
        copyToolLink(tool.url, toolElement);
    });

    // Open button handler
    const openBtn = toolElement.querySelector('.tool-open-btn');
    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.open(tool.url, '_blank');
        });
    }

    return toolElement;
}

// Render error state
function renderToolsError() {
    const grid = document.getElementById('tools-grid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="tool-item" style="justify-content: center; cursor: default;">
            <div class="tool-info" style="text-align: center;">
                <div class="tool-title">Error loading tools</div>
                <div class="tool-url">Check tools-links.json file</div>
            </div>
        </div>
    `;
}

// Copy link to clipboard
async function copyToolLink(url, element) {
    try {
        await navigator.clipboard.writeText(url);

        // Visual feedback
        element.classList.add('copied');
        
        // Also animate the copy button
        const copyBtn = element.querySelector('.tool-copy-btn');
        if (copyBtn) {
            copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`; // Check icon
            setTimeout(() => {
                copyBtn.innerHTML = copyIconSvg;
            }, 1000);
        }

        setTimeout(() => {
            element.classList.remove('copied');
        }, 1000);

        // Show toast
        const toastText = window.currentTranslations?.toast_link_copied || 'Link copied!';
        showToolsToast(toastText);

    } catch (error) {
        console.error('Failed to copy:', error);
        const errorText = window.currentTranslations?.toast_copy_error || 'Copy error';
        showToolsToast(errorText, true);
    }
}

// Show toast notification
function showToolsToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');

    if (toast && toastText) {
        toastText.textContent = message;
        toast.classList.remove('error');
        if (isError) {
            toast.classList.add('error');
        }
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', loadTools);

// Re-render tools when language changes to update the copy hint text
const originalApplyLanguage = window.applyLanguage;
if (typeof originalApplyLanguage === 'function') {
    window.applyLanguage = function (lang) {
        originalApplyLanguage(lang);
        // Re-load tools to update translations
        loadTools();
    };
}
