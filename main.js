import { Actor } from 'apify';
import { PlaywrightCrawler } from '@crawlee/playwright';

await Actor.init();
const input = await Actor.getInput(); // { startUrls: [{ url }], maxRequestsPerCrawl }
const startUrls = (input?.startUrls ?? []).map(u => u.url);

const crawler = new PlaywrightCrawler({
  maxRequestsPerCrawl: input?.maxRequestsPerCrawl ?? 1,
  requestHandler: async ({ page, request }) => {
    await page.waitForLoadState('domcontentloaded');
    // tweak selectors as needed
    const title = (await page.locator('h1').first().textContent())?.trim() ?? null;
    const bullets = await page.locator('li').allTextContents();
    const imgs = await page.locator('img').evaluateAll(els =>
      els.map(e => e.src).filter(src => /^https?:\/\//.test(src))
    );

    await Actor.pushData({ url: request.loadedUrl ?? request.url, title, bullets, imgs });
  },
});

await crawler.run(startUrls);
await Actor.exit();
