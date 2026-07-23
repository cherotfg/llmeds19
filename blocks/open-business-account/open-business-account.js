// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  name: 'Express Document Courier Service',
  description: 'Secure, reliable international courier service for sending important documents and packages worldwide.',
  image_url: 'https://www.dhl.com/discover/adobe/dynamicmedia/deliver/dm-aid--b50152d7-fe09-4094-95c6-4ce77e9ff138/dhl-express-document-courier-service-991x558.jpg',
  category: 'Start Shipping',
};

// Form fields derived from input_schema.properties.
const FIELDS = [
  { name: 'full_name', label: 'Full Name', placeholder: "Contact person's full name.", required: true, type: 'text' },
  { name: 'company_name', label: 'Company Name', placeholder: 'Registered company or business name.', required: true, type: 'text' },
  { name: 'email', label: 'Email', placeholder: 'Business email address for account correspondence.', required: true, type: 'email' },
  { name: 'phone', label: 'Phone', placeholder: 'Contact phone number.', required: false, type: 'tel' },
  { name: 'monthly_shipment_volume', label: 'Monthly Shipment Volume', placeholder: 'Estimated number of shipments per month.', required: false, type: 'text' },
];

// Brand palette from BuildWidgetRequest.
// getThemedCardBg() darkens palette[0] to luminance <= 0.12 so white text has WCAG AA contrast.
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
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);
const ACCENT = PALETTE[0] || '#d40511';

const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

export default async function decorate(block, bridge) {
  const info = SAMPLE_DATA;
  let confirmation = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (!isPreview) {
      // After submission the handler returns a flat confirmation object.
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      if (structuredContent?.confirmation_id) {
        confirmation = {
          confirmation_id: structuredContent.confirmation_id,
          status: structuredContent.status,
          message: structuredContent.message,
        };
      }
    }
  }

  block.textContent = '';
  if (confirmation) {
    renderConfirmation(block, confirmation);
  } else {
    renderForm(block, info, bridge);
  }

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

function renderConfirmation(block, confirmation) {
  const card = document.createElement('div');
  card.className = 'obac-card';

  const header = document.createElement('div');
  header.className = 'obac-header';
  header.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const title = document.createElement('h3');
  title.className = 'obac-title';
  title.textContent = 'Application Submitted';
  header.appendChild(title);

  const status = document.createElement('p');
  status.className = 'obac-desc';
  status.textContent = confirmation.status ? `Status: ${confirmation.status}` : 'Your application is being processed.';
  header.appendChild(status);
  card.appendChild(header);

  const body = document.createElement('div');
  body.className = 'obac-form';

  const idLabel = document.createElement('p');
  idLabel.className = 'obac-conf-id';
  idLabel.textContent = `Confirmation ID: ${confirmation.confirmation_id}`;
  body.appendChild(idLabel);

  if (confirmation.message) {
    const msg = document.createElement('p');
    msg.className = 'obac-conf-msg';
    msg.textContent = confirmation.message;
    body.appendChild(msg);
  }

  card.appendChild(body);
  block.appendChild(card);
}

function renderForm(block, info, bridge) {
  const card = document.createElement('div');
  card.className = 'obac-card';

  // Hero image
  const hero = document.createElement('div');
  hero.className = 'obac-hero';
  if (info.image_url) {
    const img = document.createElement('img');
    img.src = info.image_url;
    img.alt = info.name || 'Business account';
    img.className = 'obac-hero-img';
    img.onerror = () => {
      const d = document.createElement('div');
      d.className = 'obac-hero-fallback';
      d.style.backgroundColor = CARD_COLORS[0];
      img.parentNode.replaceChild(d, img);
    };
    hero.appendChild(img);
  } else {
    const d = document.createElement('div');
    d.className = 'obac-hero-fallback';
    d.style.backgroundColor = CARD_COLORS[0];
    hero.appendChild(d);
  }
  card.appendChild(hero);

  // Header block (palette-colored)
  const header = document.createElement('div');
  header.className = 'obac-header';
  header.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const title = document.createElement('h3');
  title.className = 'obac-title';
  title.textContent = 'Open a DHL Express Business Account';
  header.appendChild(title);

  const desc = document.createElement('p');
  desc.className = 'obac-desc';
  desc.textContent = 'Unlock shipping discounts and dedicated support for your business.';
  header.appendChild(desc);
  card.appendChild(header);

  // Form
  const form = document.createElement('form');
  form.className = 'obac-form';
  form.noValidate = true;

  const inputs = {};
  FIELDS.forEach((f) => {
    const wrap = document.createElement('div');
    wrap.className = 'obac-field';

    const label = document.createElement('label');
    label.className = 'obac-label';
    label.setAttribute('for', `obac-${f.name}`);
    label.textContent = f.required ? `${f.label} *` : f.label;
    wrap.appendChild(label);

    const input = document.createElement('input');
    input.className = 'obac-input';
    input.id = `obac-${f.name}`;
    input.name = f.name;
    input.type = f.type;
    input.placeholder = f.placeholder;
    if (f.required) input.required = true;
    input.style.setProperty('--obac-accent', ACCENT);
    wrap.appendChild(input);

    inputs[f.name] = input;
    form.appendChild(wrap);
  });

  const btn = document.createElement('button');
  btn.type = 'submit';
  btn.className = 'obac-submit';
  btn.textContent = 'Open an Account';
  btn.style.backgroundColor = ACCENT;
  form.appendChild(btn);

  const status = document.createElement('p');
  status.className = 'obac-status';
  status.setAttribute('role', 'status');
  form.appendChild(status);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const missing = FIELDS.filter((f) => f.required && !inputs[f.name].value.trim());
    if (missing.length) {
      status.textContent = `Please fill in: ${missing.map((m) => m.label).join(', ')}.`;
      status.classList.add('obac-error');
      missing.forEach((m) => inputs[m.name].classList.add('obac-invalid'));
      return;
    }
    status.classList.remove('obac-error');
    const values = FIELDS.map((f) => `${f.label}: ${inputs[f.name].value.trim()}`).filter((v) => !v.endsWith(': '));
    if (bridge) {
      status.textContent = 'Submitting your application…';
      bridge.sendMessage(`Please open a DHL Express business account with these details — ${values.join('; ')}.`);
    } else {
      status.textContent = 'Application ready to submit.';
    }
  });

  card.appendChild(form);
  block.appendChild(card);
}
