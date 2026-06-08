import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const PROJECT_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_ROOT = join(PROJECT_ROOT, "dist"); // Hosts Vite's compiled distribution folder
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
            // Continue resolution loops
        }
    }
    return null;
}

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

// Converts screenshot buffer to an immediate console log stream that Antigravity reads
async function feedImageToAgent(page, description) {
    // Freeze animations before taking the visual snapshot
    await page.addStyleTag({
        content: `*, *::before, *::after { animation: none !important; transition: none !important; }`
    });
    const buffer = await page.screenshot({ fullPage: true });
    const base64Image = buffer.toString("base64");
    console.log(`\n=== BEGIN_ANTIGRAVITY_IMAGE_FEED: ${description} ===`);
    console.log(`data:image/png;base64,${base64Image}`);
    console.log(`=== END_ANTIGRAVITY_IMAGE_FEED ===\n`);
}

// Simulates human scrolling so the agent can inspect fields down the page
async function smoothlyScrollPage(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 250;
            const timer = setInterval(() => {
                const scrollHeight = document.documentElement.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
    await page.waitForTimeout(200);
}

async function main() {
    const server = await startServer();
    const browser = await chromium.launch({ channel: 'chrome' }); // Uses your native Ubuntu Chrome installation

    console.log(`[ANTIGRAVITY VISION ENGINE]: Launching automated session on port ${PORT}...`);

    try {
        for (const viewport of VIEWPORTS) {
            const context = await browser.newContext({
                viewport: { width: viewport.width, height: viewport.height },
            });
            const page = await context.newPage();

            // =========================================================================
            // STATE 1: Parameter Form Entry View & Scrolling Audit
            // =========================================================================
            await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
            await page.waitForTimeout(200);

            console.log(`[AUDIT]: Inspecting Layout Grid Structure [${viewport.label.toUpperCase()}]`);
            await feedImageToAgent(page, `Initial Parameter Form Screen - ${viewport.label}`);

            await smoothlyScrollPage(page);
            await feedImageToAgent(page, `Scrolled Input View Baseline Check - ${viewport.label}`);

            // =========================================================================
            // STATE 2: Mocked Benign Interface Assertion
            // =========================================================================
            await page.route('**/predict', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ diagnosis: 'Benign', confidence: 94.5 })
                });
            });

            await page.click('button[type="submit"]');
            await page.waitForTimeout(500);

            console.log(`[AUDIT]: Inspecting Benign Report Card [${viewport.label.toUpperCase()}]`);
            await feedImageToAgent(page, `Benign Diagnostic Result Dashboard - ${viewport.label}`);
            await smoothlyScrollPage(page);

            // Bulletproof click to reset form back to state 1
            await page.click('button:not([disabled])');
            await page.waitForTimeout(200);

            // =========================================================================
            // STATE 3: Mocked Malignant Interface Assertion
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

            console.log(`[AUDIT]: Inspecting Malignant Report Card [${viewport.label.toUpperCase()}]`);
            await feedImageToAgent(page, `Malignant Diagnostic Result Dashboard - ${viewport.label}`);
            await smoothlyScrollPage(page);

            await context.close();
        }
    } finally {
        await browser.close();
        server.close();
        console.log(`[ANTIGRAVITY VISION ENGINE]: Session testing complete.`);
    }
}

main().catch((error) => {
    console.error("❌ Automation execution aborted:", error.message ?? error);
    process.exit(1);
});