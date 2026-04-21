#!/usr/bin/env node
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('https://dispatch.care/', { waitUntil: 'networkidle0' });
await page.evaluateHandle('document.fonts.ready');

const data = await page.evaluate(() => {
  const pick = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      cls: (el.className || '').toString().slice(0, 60),
      text: (el.innerText || '').slice(0, 60),
      font: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight,
      color: cs.color, bg: cs.backgroundColor,
      lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing,
      padding: cs.padding, margin: cs.margin,
      border: cs.border, borderRadius: cs.borderRadius,
      w: r.width, h: r.height, x: r.x, y: r.y,
    };
  };
  const ancestors = (el) => {
    const out = [];
    while (el && out.length < 8) { out.push(pick(el)); el = el.parentElement; }
    return out;
  };

  const all = [...document.querySelectorAll('*')];
  const announce = all.find(e => e.children.length === 0 && (e.innerText || '').startsWith('Founded in Seattle'));
  const h1 = document.querySelector('h1');
  const ledeCandidates = all.filter(e => e.children.length === 0 && (e.innerText || '').startsWith('Dispatch compliments'));
  const lede = ledeCandidates[0];

  const stat65 = all.find(e => e.children.length === 0 && (e.innerText || '').trim() === '65%');
  const stat4432 = all.find(e => e.children.length === 0 && (e.innerText || '').trim() === '4,432');
  const stat266k = all.find(e => e.children.length === 0 && /^\$266K/.test((e.innerText || '').trim()));
  const statLabel65 = all.find(e => e.children.length === 0 && /Don.t require an RN/.test(e.innerText || ''));

  const testimonial = all.find(e => (e.innerText || '').startsWith('"Having clearer operational') && e.children.length === 0);

  const footerText = all.find(e => (e.innerText || '').startsWith('©2026') && e.children.length === 0);
  const footerSection = footerText ? footerText.closest('footer') || footerText.parentElement.parentElement.parentElement : null;

  // Contact form inputs
  const emailInput = document.querySelector('input[type="email"], input[placeholder*="email"]');

  return {
    announce_ancestors: announce ? ancestors(announce) : null,
    h1: pick(h1),
    h1_parent: h1 ? pick(h1.parentElement) : null,
    lede: pick(lede),
    stat65: pick(stat65),
    stat65_label: pick(statLabel65),
    stat4432: pick(stat4432),
    stat266k: pick(stat266k),
    testimonial: pick(testimonial),
    testimonial_ancestor_section: testimonial ? pick(testimonial.closest('section, div[data-framer-name]')) : null,
    footer: pick(footerSection),
    footerText: pick(footerText),
    emailInput: pick(emailInput),
  };
});

console.log(JSON.stringify(data, null, 2));
await browser.close();
