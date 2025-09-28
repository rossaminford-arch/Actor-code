import { Actor } from 'apify';
import { PlaywrightCrawler } from 'crawlee';

await Actor.init();

// Expected input:
// { "startUrls": [{ "url": "https://example.com" }], "maxRequestsPerCrawl": 1 }
const input = (await Actor.getInput()) ?? {};
const startUrls = (input.startUrls ?? []).map(u => u.url ?? u);
const maxReq = input.maxRequestsPerCrawl ?? 1;

const crawler = new PlaywrightCrawler({
  maxRequestsPerCrawl: maxReq,
  // default Chromium from Playwright
  requestHandler: async ({ page, request, log }) => {
    // Try to settle the page
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    // Optional: dismiss common cookie banners quietly
    const acceptBtn = page.locator('button:has-text("Accept"), button:has-text("I agree"), button:has-text("Agree")');
    await acceptBtn.first().click({ timeout: 2000 }).catch(() => {});

    const title = (await page.title())?.trim() ?? '';

    // Keep only a handful of visible bullet-like <li> items
    const bullets = await page.$$eval('li', els =>
      els.slice(0, 8)
        .map(e => e.textContent?.trim())
        .filter(Boolean)
    );

    // Absolute image URLs
    const imgs = await page.$$eval('img', els =>
      els.map(e => e.src).filter(u => /^https?:\/\//i.test(u))
    );

    await Actor.pushData({
      url: request.loadedUrl ?? request.url,
      title,
      bullets,
      imgs
    });
  },
});

await crawler.run(startUrls.length ? startUrls : []);
await Actor.exit();
