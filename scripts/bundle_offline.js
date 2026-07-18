const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.resolve(__dirname, '../public');
const OUTPUT_FILE = path.resolve(__dirname, '../stockroom_offline.html');

function bundle() {
  console.log('Starting offline bundling...');

  // Read items.html
  let html = fs.readFileSync(path.join(PUBLIC_DIR, 'items.html'), 'utf8');

  // Read style.css
  const css = fs.readFileSync(path.join(PUBLIC_DIR, 'style.css'), 'utf8');

  // Read script.js
  const js = fs.readFileSync(path.join(PUBLIC_DIR, 'script.js'), 'utf8');

  // 1. Remove Google Fonts preconnect and font links to prevent timeouts when offline
  html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">/g, '');
  html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]+" rel="stylesheet">/g, '');

  // 2. Add inline SVG favicon so the browser doesn't make external network calls
  const svgFavicon = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%231C2321"/><path d="M30 30h40v40H30z" fill="none" stroke="%23C97A2B" stroke-width="8"/><circle cx="50" cy="50" r="10" fill="%23C97A2B"/></svg>`;
  const faviconTag = `<link rel="icon" type="image/svg+xml" href="${svgFavicon}">`;
  
  // Insert favicon before the closing head tag
  html = html.replace('</head>', `  ${faviconTag}\n</head>`);

  // 3. Inline style.css
  const cssTag = `<style>\n${css}\n</style>`;
  html = html.replace('<link rel="stylesheet" href="style.css">', cssTag);

  // 4. Inline script.js
  const jsTag = `<script>\n${js}\n</script>`;
  html = html.replace('<script src="script.js"></script>', jsTag);

  // Write single-file html bundle
  fs.writeFileSync(OUTPUT_FILE, html, 'utf8');

  console.log(`Successfully bundled single-file app to: ${OUTPUT_FILE}`);
}

bundle();
