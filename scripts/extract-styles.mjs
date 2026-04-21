#!/usr/bin/env node
/**
 * Extract key design tokens from the live site by inspecting computed styles.
 */
import puppeteer from 'puppeteer';

const target = process.argv[2] || 'live';
const base = target === 'live' ? 'https://dispatch.care' : 'http://localhost:3000';

const browser = await puppeteer.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox', '--disable-gpu'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(`${base}/`, { waitUntil: 'networkidle0' });
await page.evaluateHandle('document.fonts.ready');

const data = await page.evaluate(() => {
  const out = {};
  const body = document.body;
  const bodyCS = getComputedStyle(body);
  out.body = {
    bg: bodyCS.backgroundColor,
    color: bodyCS.color,
    font: bodyCS.fontFamily,
    fontSize: bodyCS.fontSize,
    lineHeight: bodyCS.lineHeight,
  };

  // Try to find the announcement bar
  const candidates = [...document.querySelectorAll('div, section, header')];
  const findText = (text) =>
    candidates.find(el => el.innerText && el.innerText.trim().startsWith(text));

  const announce = findText('Founded in Seattle');
  if (announce) {
    const cs = getComputedStyle(announce);
    out.announce = { bg: cs.backgroundColor, color: cs.color, font: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, text: announce.innerText.trim(), padding: cs.padding };
  }

  const h1 = document.querySelector('h1');
  if (h1) {
    const cs = getComputedStyle(h1);
    out.h1 = { text: h1.innerText, font: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, color: cs.color, lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing };
  }

  const h2s = [...document.querySelectorAll('h2')].map(h => {
    const cs = getComputedStyle(h);
    return { text: h.innerText, font: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, color: cs.color, lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing };
  });
  out.h2 = h2s;

  const h3s = [...document.querySelectorAll('h3')].slice(0, 3).map(h => {
    const cs = getComputedStyle(h);
    return { text: h.innerText, font: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, color: cs.color, lineHeight: cs.lineHeight };
  });
  out.h3 = h3s;

  // Buttons / links styled as buttons
  const btns = [...document.querySelectorAll('a, button')]
    .filter(el => /schedule free demo|learn more|get started|get in touch/i.test(el.innerText || ''))
    .slice(0, 4)
    .map(el => {
      const cs = getComputedStyle(el);
      return {
        text: (el.innerText || '').trim().slice(0, 40),
        bg: cs.backgroundColor, color: cs.color, border: cs.border,
        padding: cs.padding, font: cs.fontFamily, fontWeight: cs.fontWeight, fontSize: cs.fontSize,
        borderRadius: cs.borderRadius,
      };
    });
  out.buttons = btns;

  // header brand area
  const header = document.querySelector('header, [role="banner"]') || document.querySelector('nav');
  if (header) {
    const cs = getComputedStyle(header);
    out.header = { bg: cs.backgroundColor, color: cs.color, height: header.getBoundingClientRect().height };
  }

  // Footer
  const footer = document.querySelector('footer, [role="contentinfo"]');
  if (footer) {
    const cs = getComputedStyle(footer);
    out.footer = { bg: cs.backgroundColor, color: cs.color };
  }

  // Section backgrounds - collect unique background colors from section-like blocks
  const bgs = new Set();
  document.querySelectorAll('section, div').forEach(el => {
    const cs = getComputedStyle(el);
    if (el.getBoundingClientRect().height > 200 && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      bgs.add(cs.backgroundColor);
    }
  });
  out.backgroundsSeen = [...bgs].slice(0, 10);

  return out;
});

console.log(JSON.stringify(data, null, 2));
await browser.close();
