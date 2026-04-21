#!/usr/bin/env node
/**
 * Full-page screenshots of a target site for visual comparison.
 * Usage: node scripts/capture.mjs <live|local> [slug]
 * Produces /tmp/dispatch-compare/<target>/<slug>_<width>.png at 1440 and 390 widths.
 */
import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';

const PAGES = [
  { slug: '',                  file: 'home' },
  { slug: 'about',             file: 'about' },
  { slug: 'contact',           file: 'contact' },
  { slug: 'contact/thanks',    file: 'contact_thanks' },
  { slug: 'privacy-policy',    file: 'privacy' },
];
const WIDTHS = [1440, 390];

const target = process.argv[2];
const onlySlug = process.argv[3];
if (!['live', 'local'].includes(target)) {
  console.error('Usage: capture.mjs <live|local> [slug]');
  process.exit(1);
}
const base = target === 'live' ? 'https://dispatch.care' : 'http://localhost:3000';

const outDir = `/tmp/dispatch-compare/${target}`;
mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
});

try {
  const filtered = onlySlug !== undefined ? PAGES.filter(p => p.slug === onlySlug || p.file === onlySlug) : PAGES;
  for (const { slug, file } of filtered) {
    for (const width of WIDTHS) {
      const page = await browser.newPage();
      await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
      const url = slug ? `${base}/${slug}/` : `${base}/`;
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });
      // Wait for fonts
      await page.evaluateHandle('document.fonts.ready');
      // Disable animations & scroll-triggered reveals
      await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
      // Scroll to bottom to trigger any lazy content, then to top
      await page.evaluate(async () => {
        await new Promise(resolve => {
          let y = 0;
          const step = () => {
            window.scrollTo(0, y);
            y += window.innerHeight / 2;
            if (y < document.body.scrollHeight) setTimeout(step, 50);
            else { window.scrollTo(0, 0); setTimeout(resolve, 300); }
          };
          step();
        });
      });
      const out = `${outDir}/${file}_${width}.png`;
      await page.screenshot({ path: out, fullPage: true });
      console.log(out);
      await page.close();
    }
  }
} finally {
  await browser.close();
}
