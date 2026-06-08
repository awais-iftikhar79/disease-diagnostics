import http from "node:http";
import { mkdir, readFile, stat } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const PROJECT_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_ROOT = join(PROJECT_ROOT, "dist"); // Verified Vite production distribution folder
const OUT_DIR = join(PROJECT_ROOT, ".screenshots");
const PORT = 4399;

const VIEWPORTS = [
    { label: "desktop", width: 1440, height: 900 },
    { label: "mobile", width: 390, height: 844 },
];

const CONTENT_TYPES = {
    ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
    ".json": "application/json", ".jpeg": "image/jpeg", ".jpg": "image/jpeg",
    ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml",
    ".txt": "text/plain", ".xml": "application/xml", ".ico": "image/x-icon",
    ".woff2": "font/woff2", ".woff": "font/woff",
};

async function resolveFile(requestPath) {
    for (const candidate of [requestPath, `${requestPath}.html`, join(requestPath, "index.html")]) {
        try {
            if ((await stat(candidate)).isFile()) return candidate;
        } catch {
            // Continue resolving
        }
    }
    return null;
}

// Spin up a localized server hosting Vite's compiled production build
async function startServer() {
    try {
        await stat(join(SITE_ROOT, "index.html"));
    } catch {
        throw new Error("./dist folder not found. Run 'npm run build' inside your frontend directory first!");
    }

    const server = http.createServer(async (req, res) => {
        let urlPath = decodeURIComponent(req.url.split("?")[0]);
        if (urlPath === "/") urlPath = "/index.html";
        const filePath = normalize(join(SITE_ROOT, urlPath));
        if (!filePath.startsWith(SITE_ROOT)) {
            res.writeHead(403);
            res.end();
            return;
        }
        const resolved = await resolveFile(filePath);
        if (!resolved) {
            res.writeHead(404);
            res.end("Asset not found");
            return;
        }
        res.writeHead(200, { "content-type": CONTENT_TYPES[extname(resolved)] ?? "application/octet-stream" });
        res.end(await readFile(resolved));
    });

    await new Promise((resolve) => server.listen(PORT, resolve));
    return server;
}

async function capturePdf(page, viewport, file) {
    await page.emulateMedia({ media: "screen" });
    await page.addStyleTag({
        content: `
      *, *::before, *::after { animation: none !important; transition: none !important; }
      .animate-fadeIn { opacity: 1 !important; transform: none !important; }
    `,
    });
    await page.waitForTimeout(100);
    const height = Math.ceil(await page.evaluate(() => document.documentElement.scrollHeight));
    await page.pdf({
        path: file,
        width: `${viewport.width}px`,
        height: `${height}px`,
        printBackground: true,
        pageRanges: "1",
    });
}

async function main() {
    await mkdir(OUT_DIR, { recursive: true });
    const server = await startServer();
    const browser = await chromium.launch({
        channel: 'chrome' // Tells Playwright to launch your Ubuntu system Google Chrome
    });

    console.log(`\n🚀 UI Automation Server initialized at http://localhost:${PORT}`);
    console.log(`📸 Executing cross-device visual analysis rules...\n`);

    try {
        for (const viewport of VIEWPORTS) {
            const context = await browser.newContext({
                viewport: { width: viewport.width, height: viewport.height },
            });
            const page = await context.newPage();

            // =========================================================================
            // SCENARIO 1: Capture Default State (Parameter Entry Form)
            // =========================================================================
            await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
            await page.waitForTimeout(200);

            const formPng = join(OUT_DIR, `workspace-inputs-${viewport.label}.png`);
            await page.screenshot({ path: formPng, fullPage: true });
            console.log(` ✅ Captured Form View: ${formPng}`);

            // =========================================================================
            // SCENARIO 2: Capture Benign Report View (Via Network Interception)
            // =========================================================================
            // Intercept the Axios post call to prevent dependency on whether the backend is up
            await page.route('**/predict', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ diagnosis: 'Benign', confidence: 94.5 })
                });
            });

            // Submit the form to generate state change
            await page.click('button[type="submit"]');
            await page.waitForTimeout(500); // Wait for transition animation to settle

            const benignPng = join(OUT_DIR, `report-benign-${viewport.label}.png`);
            await page.screenshot({ path: benignPng, fullPage: true });
            console.log(` ✅ Captured Benign Evaluation: ${benignPng}`);

            if (viewport.label === "desktop") {
                const benignPdf = join(OUT_DIR, `report-benign-document.pdf`);
                await capturePdf(page, viewport, benignPdf);
                console.log(` 📜 Generated Benign Medical PDF: ${benignPdf}`);
            }

            // Reset the application interface back to state 1
            await page.click('button:not([disabled])');
            await page.waitForTimeout(200);

            // =========================================================================
            // SCENARIO 3: Capture Malignant Report View
            // =========================================================================
            await page.route('**/predict', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ diagnosis: 'Malignant', confidence: 88.7 })
                });
            });

            await page.click('button[type="submit"]');
            await page.waitForTimeout(500);

            const malignantPng = join(OUT_DIR, `report-malignant-${viewport.label}.png`);
            await page.screenshot({ path: malignantPng, fullPage: true });
            console.log(` ✅ Captured Malignant Evaluation: ${malignantPng}\n`);

            await context.close();
        }
    } finally {
        await browser.close();
        server.close();
    }
}

main().catch((error) => {
    console.error("❌ Automation execution aborted:", error.message ?? error);
    process.exit(1);
});