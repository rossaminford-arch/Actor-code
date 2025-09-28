import { Actor } from 'apify';
import { PlaywrightCrawler } from 'crawlee';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
// Accept both [{ url }] and ["https://..."] shapes
const startUrls = (input.startUrls ?? [])
  .map((u) => (typeof u === 'string' ? u : u.url))
  .filter(Boolean);

const maxRequestsPerCrawl = input.maxRequestsPerCrawl ?? 1;

const crawler = new PlaywrightCrawler({
  maxRequestsPerCrawl,
  headless: true,
  // optional: helps with some bot protections
  launchContext: { useChrome: true },

  requestHandler: async ({ page, request, log }) => {
    await page.waitForLoadState('domcontentloaded');

    // Title
    const title = await page.title();

    // First few bullet-like items (very generic, adjust as needed)
    const bullets = await page.$$eval('li', (els) =>
      els
        .map((el) => el.textContent?.trim())
        .filter(Boolean)
        .slice(0, 8)
    );

    // Image URLs
    const imgs = await page.$$eval('img', (els) =>
      els
        .map((el) => el.src)
        .filter((s) => /^https?:\/\//i.test(s))
    );

    // Always push something so you see output even if selectors miss
    await Actor.pushData({
      url: request.loadedUrl || request.url,
      title: title || null,
      bullets,
      imgs,
    });

    log.info(`Saved item for ${request.url}`);
  },

  failedRequestHandler: async ({ request, log }) => {
    log.error(`Failed ${request.url}`);
    await Actor.pushData({ url: request.url, error: 'request_failed' });
  },
});

// Fallback so the actor still runs from n8n if nothing is passed
const seeds = startUrls.length ? startUrls : ['https://www.veed.io/create/ai-video-generator'];

await crawler.run(seeds);

await Actor.exit();
