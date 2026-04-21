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
      tag: el.tagName, text: (el.innerText || '').slice(0, 80),
      font: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight,
      color: cs.color, bg: cs.backgroundColor,
      lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing,
      padding: cs.padding, margin: cs.margin,
      border: cs.border, borderRadius: cs.borderRadius,
      w: r.width, h: r.height, x: r.x, y: r.y,
    };
  };
  const ancestors = (el, n = 5) => {
    const out = [];
    while (el && out.length < n) { out.push(pick(el)); el = el.parentElement; }
    return out;
  };
  const all = [...document.querySelectorAll('*')];

  // H1 in live site
  const h1Text = all.find(e => e.children.length === 0 && /Dispatch saves valuable nurse time/.test(e.innerText || ''));

  // Buttons - including Schedule Free Demo in nav and hero
  const schedBtns = all.filter(e => (e.innerText || '').trim() === 'Schedule Free Demo');
  const learnMoreBtns = all.filter(e => (e.innerText || '').trim() === 'Learn More');
  const getInTouchBtns = all.filter(e => (e.innerText || '').trim() === 'Get In Touch');
  const getStartedBtns = all.filter(e => (e.innerText || '').trim() === 'Get Started Today');

  // Deep dive: for each, get self + parent 4 deep
  const inspect = (el) => ({ self: pick(el), chain: ancestors(el, 4) });

  // Stats
  const stat65 = all.find(e => e.children.length === 0 && (e.innerText || '').trim() === '65%');
  const stat4432 = all.find(e => e.children.length === 0 && (e.innerText || '').trim() === '4,432');
  const stat266 = all.find(e => e.children.length === 0 && /^\$266/.test((e.innerText || '').trim()));
  const statLabelRN = all.find(e => e.children.length === 0 && /don.t require an RN/i.test(e.innerText || ''));
  const stars = all.find(e => e.children.length === 0 && /★★★★★/.test(e.innerText || ''));
  const beds = all.find(e => e.children.length === 0 && /500,000\+ Requests/.test(e.innerText || ''));

  // Footer bg
  const footerText = all.find(e => e.children.length === 0 && /^©2026/.test(e.innerText || ''));
  const footerAncestors = footerText ? ancestors(footerText, 6) : null;

  // Section backgrounds - find section after testimonial "Having clearer"
  const reliable = all.find(e => e.children.length === 0 && /Reliable Operational Intelligence/.test(e.innerText || ''));
  const reliableAncestors = reliable ? ancestors(reliable, 6) : null;
  const simple = all.find(e => e.children.length === 0 && /Simple, Accessible, Secure/.test(e.innerText || ''));
  const simpleAncestors = simple ? ancestors(simple, 6) : null;
  const haveQs = all.find(e => e.children.length === 0 && /Have questions/.test(e.innerText || ''));
  const haveQsAncestors = haveQs ? ancestors(haveQs, 6) : null;

  return {
    h1: h1Text ? inspect(h1Text) : null,
    schedBtns: schedBtns.map(inspect),
    learnMoreBtns: learnMoreBtns.map(inspect),
    getInTouchBtns: getInTouchBtns.map(inspect),
    getStartedBtns: getStartedBtns.map(inspect),
    stat65: stat65 ? inspect(stat65) : null,
    stat4432: stat4432 ? inspect(stat4432) : null,
    stat266: stat266 ? inspect(stat266) : null,
    statLabelRN: statLabelRN ? inspect(statLabelRN) : null,
    stars: stars ? inspect(stars) : null,
    beds: beds ? inspect(beds) : null,
    footerAncestors,
    reliableAncestors,
    simpleAncestors,
    haveQsAncestors,
  };
});

console.log(JSON.stringify(data, null, 2));
await browser.close();
