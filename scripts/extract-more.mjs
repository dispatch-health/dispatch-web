#!/usr/bin/env node
/** Extract deeper per-element styles from the live site. */
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
      text: (el.innerText || '').slice(0, 80),
      font: cs.fontFamily,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      color: cs.color,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      bg: cs.backgroundColor,
      padding: cs.padding,
      margin: cs.margin,
      border: cs.border,
      borderRadius: cs.borderRadius,
      width: r.width,
      height: r.height,
      x: r.x,
      y: r.y,
    };
  };
  const q = (sel, text) => {
    const els = [...document.querySelectorAll(sel)];
    if (text) return els.find(e => e.innerText && e.innerText.trim().includes(text));
    return els[0];
  };

  const h1 = document.querySelector('h1');
  const hero = h1 ? h1.closest('section') || h1.parentElement : null;

  // First, find the announcement by looking for text in any element
  const all = [...document.querySelectorAll('*')];
  const announce = all.find(e => e.children.length === 0 && e.innerText && e.innerText.startsWith('Founded in Seattle'));

  // Find lede (paragraph near h1)
  let lede = null;
  if (h1) {
    let n = h1.nextElementSibling;
    while (n && !lede) {
      if (n.tagName === 'P' || (n.innerText && n.innerText.length > 50)) lede = n;
      n = n.nextElementSibling || (n.parentElement ? n.parentElement.nextElementSibling : null);
    }
  }

  // buttons
  const scheduleBtn = all.find(e => e.innerText === 'Schedule Free Demo');
  const learnMoreBtn = all.find(e => e.innerText === 'Learn More');
  const getInTouchBtn = all.find(e => e.innerText === 'Get In Touch');
  const getStartedBtn = all.find(e => e.innerText === 'Get Started Today');

  // stat big numbers
  const statEls = all.filter(e => /^\s*(65%|4,?432|\$266K)/.test(e.innerText || '') && e.children.length < 3).slice(0,3);

  // section headers / eyebrows
  const eyebrow = all.find(e => (e.innerText || '').trim() === 'Analytics and Reporting');

  const testimonialBlockquote = document.querySelector('blockquote');
  const stars = all.find(e => /★★★★★/.test(e.innerText || ''));

  const footer = document.querySelector('footer');

  // header / announcement area
  const header = document.querySelector('header, nav');

  return {
    h1: pick(h1),
    hero: pick(hero),
    announce: pick(announce),
    lede: pick(lede),
    scheduleBtn: pick(scheduleBtn),
    learnMoreBtn: pick(learnMoreBtn),
    getInTouchBtn: pick(getInTouchBtn),
    getStartedBtn: pick(getStartedBtn),
    statEls: statEls.map(pick),
    eyebrow: pick(eyebrow),
    testimonialBlockquote: pick(testimonialBlockquote),
    stars: pick(stars),
    footer: pick(footer),
    header: pick(header),
  };
});

console.log(JSON.stringify(data, null, 2));
await browser.close();
