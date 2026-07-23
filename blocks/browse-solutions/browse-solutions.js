// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Express Document Courier Service',
    description: 'Secure, reliable international courier service for sending important documents and packages worldwide.',
    image_url: 'https://www.dhl.com/discover/adobe/dynamicmedia/deliver/dm-aid--b50152d7-fe09-4094-95c6-4ce77e9ff138/dhl-express-document-courier-service-991x558.jpg',
    category: 'Start Shipping',
  },
  {
    name: 'DHL Express Domestic Service',
    description: 'Fast, dependable local courier service within Singapore for smooth day-to-day business operations.',
    image_url: 'https://www.dhl.com/discover/adobe/dynamicmedia/deliver/dm-aid--6bfffc2a-4184-4fb5-86bf-d9977450fd2f/domestic-service-image-1.jpg',
    category: 'Domestic',
  },
  {
    name: 'Specialty Pharma Logistics',
    description: 'Temperature-controlled logistics for high-value, highly-sensitive treatments including cell and gene therapies.',
    image_url: 'https://www.dhl.com/discover/adobe/dynamicmedia/deliver/dm-aid--a4e3e8a9-553e-4d39-8617-955e62ab381f/a-doctor-working-in-specialty-pharma-running-tests-in-a-lab-991x558.jpg',
    category: 'Health Logistics',
  },
  {
    name: 'DHL Health Logistics',
    description: 'Specialized healthcare supply chain solutions for critical medical products across the full logistics journey.',
    image_url: 'https://www.dhl.com/discover/adobe/dynamicmedia/deliver/dm-aid--1d066d2a-83d2-4de8-9486-a7856beb7ccd/a-healthcare-logistics-personnel-delivering-medical-supplies-991x558.jpg',
    category: 'Health Logistics',
  },
  {
    name: 'Clinical Trial Logistics',
    description: 'DHL Medical Express (WMX) service supporting clinical trial research with reliable temperature-sensitive shipping.',
    image_url: 'https://www.dhl.com/discover/adobe/dynamicmedia/deliver/dm-aid--b311a9e8-9b08-4542-9391-eedb221dcebc/dhl-medical-box.jpg',
    category: 'Health Logistics',
  },
  {
    name: 'GoGreen Plus',
    description: 'Sustainable shipping solution that can directly reduce up to 30% of carbon emissions on the last mile.',
    image_url: 'https://www.dhl.com/discover/adobe/dynamicmedia/deliver/dm-aid--9c429936-eeef-4f64-8208-0d0eacaa6476/singapore-carbon-footprint-991x558.jpg',
    category: 'Sustainability',
  },
  {
    name: 'DHL Medical Express for Labs',
    description: "Optimizes a laboratory's supply chain for clinical diagnostics with fast, reliable specimen transport.",
    image_url: 'https://www.dhl.com/discover/adobe/dynamicmedia/deliver/dm-aid--ec8b9bc5-37ec-4f24-90b6-faaa9d1485c5/laboratory-staff-planning-their-supply-chain-operations-991x558.jpg',
    category: 'Health Logistics',
  },
  {
    name: 'Door-to-Door Delivery',
    description: "End-to-end door-to-door delivery service built for Singapore's fast-growing e-commerce sector.",
    image_url: 'https://www.dhl.com/discover/adobe/dynamicmedia/deliver/dm-aid--25c8b47a-7cf9-4cef-a2ca-2b9ef043e491/store-to-door-delivery-service-singapore-991x558.jpg',
    category: 'Delivery Options',
  },
];

// Brand palette from BuildWidgetRequest.
// getThemedCardBg() darkens palette[0] to luminance <= 0.12 for WCAG AA white-text contrast.
const PALETTE = ['#d40511', '#3860be'];
function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);
const ACCENT = PALETTE[0] || '#2563eb';
const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.solutions — bare array outputSchema; key derived from actionName "browse_solutions"
      items = structuredContent?.solutions || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderItems(block, items, bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}

function renderItems(block, items, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'browse-solutions-wrapper';

  const track = document.createElement('div');
  track.className = 'browse-solutions-track';

  (items || []).slice(0, 8).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'browse-solutions-card';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'browse-solutions-image';
    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => img.parentNode && img.parentNode.replaceChild(colorDiv(), img);
      imgWrap.appendChild(img);
    } else {
      imgWrap.appendChild(colorDiv());
    }

    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'browse-solutions-badge';
      badge.textContent = item.category;
      badge.style.background = ACCENT;
      imgWrap.appendChild(badge);
    }
    card.appendChild(imgWrap);

    const info = document.createElement('div');
    info.className = 'browse-solutions-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const title = document.createElement('h3');
    title.className = 'browse-solutions-title';
    title.textContent = item.name || '';
    info.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'browse-solutions-desc';
    desc.textContent = item.description || '';
    info.appendChild(desc);

    const btn = document.createElement('button');
    btn.className = 'browse-solutions-cta';
    btn.textContent = 'Learn More';
    btn.style.background = ACCENT;
    if (bridge) {
      btn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    info.appendChild(btn);

    card.appendChild(info);
    track.appendChild(card);
  });

  wrapper.appendChild(track);

  const fade = document.createElement('div');
  fade.className = 'browse-solutions-fade';
  fade.style.background = `linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc)`;
  wrapper.appendChild(fade);

  const mkArrow = (dir) => {
    const b = document.createElement('button');
    b.className = `browse-solutions-arrow browse-solutions-arrow-${dir}`;
    b.textContent = dir === 'left' ? '◀' : '▶';
    b.setAttribute('aria-label', dir === 'left' ? 'Scroll left' : 'Scroll right');
    b.addEventListener('click', () => {
      track.scrollBy({ left: dir === 'left' ? -236 : 236, behavior: 'smooth' });
    });
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        track.scrollBy({ left: dir === 'left' ? -236 : 236, behavior: 'smooth' });
      }
    });
    return b;
  };
  const leftArrow = mkArrow('left');
  const rightArrow = mkArrow('right');
  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  const updateArrows = () => {
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    leftArrow.style.display = atStart ? 'none' : 'flex';
    rightArrow.style.display = atEnd ? 'none' : 'flex';
    fade.style.display = atEnd ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateArrows);
  requestAnimationFrame(updateArrows);

  block.appendChild(wrapper);
}
