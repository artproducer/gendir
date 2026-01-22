const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
// Using sharp for image processing if needed (but currently just saving)
// If the user wants solid backgrounds for transparent images, we can add that logic later with sharp/jimp
// For now, let's just fetch the best possible icon.

const toolsLinksPath = path.join(__dirname, '../tools-links.json');
const imagesDir = path.join(__dirname, '../images/logos');

if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

async function fetchLogos() {
    const data = JSON.parse(fs.readFileSync(toolsLinksPath, 'utf8'));
    const tools = data.tools;
    let updatedTools = [];

    for (let i = 0; i < tools.length; i++) {
        const tool = tools[i];
        console.log(`Processing: ${tool.title}`);

        try {
            // Use Google's Favicon Service
            // size=128 for high quality
            const domain = new URL(tool.url).hostname;
            const logoUrl = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${tool.url}&size=128`;

            const response = await fetch(logoUrl);
            if (!response.ok) throw new Error(`Failed to fetch logo for ${tool.url}`);

            const buffer = await response.buffer();

            // Create a safe filename
            const slug = tool.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const filename = `${slug}.png`;
            const filePath = path.join(imagesDir, filename);

            fs.writeFileSync(filePath, buffer);
            console.log(`Saved logo: ${filename}`);

            // Update tool object
            updatedTools.push({
                ...tool,
                image: `images/logos/${filename}`
            });

        } catch (error) {
            console.error(`Error processing ${tool.title}:`, error);
            // Keep original tool without image if failed
            updatedTools.push(tool);
        }
    }

    // Save updated JSON
    data.tools = updatedTools;
    fs.writeFileSync(toolsLinksPath, JSON.stringify(data, null, 4));
    console.log('Updated tools-links.json');
}

fetchLogos();
