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

// Copy icon SVG
const copyIconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
</svg>`;

// Load tools from JSON file
async function loadTools() {
    try {
        const response = await fetch('tools-links.json');
        if (!response.ok) {
            throw new Error('Failed to load tools config');
        }
        const data = await response.json();
        renderTools(data.tools);
    } catch (error) {
        console.error('Error loading tools:', error);
        renderToolsError();
    }
}

// Render tools to the grid
function renderTools(tools) {
    const grid = document.getElementById('tools-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    tools.forEach((tool, index) => {
        const iconSvg = toolIcons[tool.icon] || toolIcons.link;
        const copyHintText = window.currentTranslations?.tools_click_to_copy || 'Click to copy';
        
        const toolElement = document.createElement('div');
        toolElement.className = 'tool-item';
        toolElement.setAttribute('data-url', tool.url);
        toolElement.setAttribute('data-index', index);
        
        toolElement.innerHTML = `
            <div class="tool-icon">${iconSvg}</div>
            <div class="tool-info">
                <div class="tool-title">${tool.title}</div>
                <div class="tool-url">${tool.url}</div>
            </div>
            <div class="tool-copy-hint">
                ${copyIconSvg}
                <span data-translate="tools_click_to_copy">${copyHintText}</span>
            </div>
        `;
        
        // Add click handler
        toolElement.addEventListener('click', () => copyToolLink(tool.url, toolElement));
        
        grid.appendChild(toolElement);
    });
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
    window.applyLanguage = function(lang) {
        originalApplyLanguage(lang);
        // Re-load tools to update translations
        loadTools();
    };
}
