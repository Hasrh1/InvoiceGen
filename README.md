# InvoiceGen
Web Based PDF Invoice Generator
A production-ready, beautiful, and fully responsive invoice generator running entirely in the browser. 

## Features
- **100% Client-Side:** No backend or build step required.
- **Offline Capable:** Forms auto-save locally to `localStorage` so you never lose progress.
- **Real-Time Preview:** The rendered invoice updates concurrently as you type.
- **Professional PDF Export:** High-quality matching PDF generated via `html2canvas` and `jspdf` to match exactly what you see on screen format to A4 dimensions.
- **Customization:** 3 unique templates (Modern, Classic, Bold) with custom accent color selectors.

## Setup & Running Locally

Because this application uses standard HTML, CSS, and ES Modules for Javascript, no node runtime or build process is required! 

Simply open the `index.html` file in any modern web browser:

1. Open Finder or your file explorer.
2. Navigate to the `invoice-generator` folder.
3. Double-click `index.html` to open it in Chrome, Firefox, or Safari.

*(Alternatively, you can run a local HTTP server such as `python3 -m http.server 8000` or the VSCode Live Server extension to view it over localhost).*

## Deployment

Deploying is incredibly simple given its static nature:
- **Vercel or Netlify:** Just drag and drop the `invoice-generator` folder into the Netlify Drop interface, or link it via Github Pages / Vercel. 
- **Github Pages:** Commit the folder contents to a repo, and enable Github Pages on the root or `/docs` directory.
- **Traditional Hosting:** Upload the folder via FTP or SSH to any `public_html/` web directory (Apache, Nginx).

## Architecture
- `index.html`: The core scaffolding dividing the screen into Editor and Preview panes. Includes links to CDNs for lucide icons and PDF generation.
- `css/`: Variables and components maintaining a clean glassmorphic desktop interface and stacked mobile-responsive tab layout. 
- `js/state.js`: A lightweight custom observable state store mapping directly to `localStorage`.
- `js/app.js`: Connects DOM events and user inputs back to the unified state.
- `js/templates.js`: Contains pure JS template string rendering to draw the dynamic HTML invoice snapshot.
- `js/pdf.js`: Uses `html2canvas` and `jspdf` to take the generated DOM invoice element, convert it to a 2x scaled canvas, and bake it exactly into a standard A4-sized PDF without altering layout.
