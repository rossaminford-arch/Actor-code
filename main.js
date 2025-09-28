import { Actor, log } from 'apify';
import { CheerioCrawler } from 'crawlee';

await Actor.init();

const input = await Actor.getInput();
// expected: { startUrls: [{ url: "https://..." }], maxRequestsPerCrawl?: number }

if (!input?.startUrls?.length) {
  log.error('No startUrls in INPUT. Aborting.');
  await Actor.exit();
}

const sources = input.startUrls
  .filter(s => s?.url)
  .map(s => ({ url: s.url }));

let pushed = 0;

const crawler = new CheerioCrawler({
  maxRequestsPerCrawl: input.maxRequestsPerCrawl ?? 1,
  requestHandler: async ({ request, $ }) => {
    const title = $('h1').first().text().trim();

    // features/bullets (cap at 8, strip empty)
    const bullets = $('li')
      .map((i, el) => $(el).text().trim())
      .get()
      .filter(Boolean)
      .slice(0, 8);

    // absolute image URLs only
    const imgs = $('img')
      .map((i, el) => $(el).attr('src'))
      .get()
      .filter(Boolean)
      .map(src => {
        try {
          return new URL(src, request.loadedUrl || request.url).href;
        } catch {
          return null;
        }
      })
      .filter(u => /^https?:/i.test(u));

    const item = {
      url: request.loadedUrl || request.url,
      title,
      bullets,
      imgs,
    };

    await Actor.pushData(item);
    pushed += 1;
    log.info(`Pushed item ${pushed}`, { url: item.url, title: item.title });
  },
  failedRequestHandler: async ({ request }) => {
    log.error('Failed request', { url: request.url });
  },
});

log.info('Starting crawl', { count: sources.length, firstUrl: sources[0]?.url });
await crawler.run(sources);
log.info(`Done. Total items pushed: ${pushed}`);

await Actor.exit();
