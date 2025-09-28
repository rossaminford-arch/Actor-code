import { Actor } from 'apify';
import { PlaywrightCrawler } from 'crawlee';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const startUrls = (input.startUrls ?? [{ url: 'https://example.com' }]).map(
  (u) => (typeof u === 'string' ? { url: u } : u)
);

const results = [];
const crawler = new PlaywrightCrawler({
  maxRequestsPerCrawl: input.maxRequestsPerCrawl ?? 1,
  headless: true,
  requestHandler: async ({ page, request }) => {
    await page.waitForLoadState('domcontentloaded');
    const title = await page.title();
    const bullets = await page.$$eval('li', els =>
      els.slice(0, 6).map(el => el.textContent?.trim()).filter(Boolean)
    );
    const imgs = await page.$$eval('img', imgs =>
      imgs.map(i => i.src).filter(src => /^https?:\/\//.test(src))
    );

    results.push({
      url: request.loadedUrl ?? request.url,
      title,
      bullets,
      imgs,
    });
  },
});

await crawler.run(startUrls);
for (const r of results) await Actor.pushData(r);

await Actor.exit();

