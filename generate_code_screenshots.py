#!/usr/bin/env python3
"""
Generate 5 High-Quality Code Screenshots for Curevia Report/Presentation.
Uses Pygments + Selenium Headless Chrome for crisp Retina-style VS Code screenshots.
"""

import os
import sys
import time
from pygments import highlight
from pygments.lexers import JavascriptLexer
from pygments.formatters import HtmlFormatter
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

SNIPPETS = [
    {
        "id": "1_haversine_distance_engine",
        "title": "Haversine Distance & Travel Time Engine (app.js)",
        "file": "app.js — Core Geospatial & Proximity Algorithm",
        "code": """function haversineDistKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 5.0;
  const R = 6371; // Earth's mean radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // 1.28 represents Bangalore urban road winding tortuosity factor
  return Math.round(R * c * 1.28 * 10) / 10;
}

function enrich(facility, serviceId, date = visitDate()) {
  const loc = locObj();
  const svc = facility.services[serviceId] || {};
  const dist = haversineDistKm(loc.lat, loc.lon, facility.lat, facility.lon);
  
  return {
    facility,
    dist,
    driveMin: Math.max(3, Math.round(dist / 22 * 60 + 3)), // 22 km/h avg city speed
    walkMin:  Math.max(2, Math.round(dist / 4.5 * 60)),   // 4.5 km/h pedestrian pace
    price:    svc.price ?? null,
    wait:     svc.wait ?? svc.waitMin ?? null,
    avail:    availability(facility, serviceId, date)
  };
}"""
    },
    {
        "id": "2_multilingual_i18n_dictionary",
        "title": "Multilingual i18n Localization Engine (i18n.js)",
        "file": "i18n.js — 6 Indian Languages & Dynamic Script Registry",
        "code": """const LANGUAGES = {
  en: { code: 'en', name: 'English',   native: 'English', speechCode: 'en-IN' },
  ta: { code: 'ta', name: 'Tamil',     native: 'தமிழ்',    speechCode: 'ta-IN' },
  ml: { code: 'ml', name: 'Malayalam', native: 'മലയാളം',  speechCode: 'ml-IN' },
  te: { code: 'te', name: 'Telugu',    native: 'తెలుగు',   speechCode: 'te-IN' },
  kn: { code: 'kn', name: 'Kannada',   native: 'ಕನ್ನಡ',    speechCode: 'kn-IN' },
  hi: { code: 'hi', name: 'Hindi',     native: 'हिन्दी',   speechCode: 'hi-IN' }
};

function t(key, vars = {}, fallback = '') {
  const lang = state.lang || 'en';
  const dict = I18N[lang] || I18N.en || {};
  let val = dict[key] ?? I18N.en?.[key] ?? fallback ?? key;
  
  // Interpolate dynamic template parameters {n}, {loc}, {s}
  if (typeof val === 'string' && vars) {
    Object.keys(vars).forEach(k => {
      val = val.replaceAll(`{${k}}`, vars[k]);
    });
  }
  return val;
}"""
    },
    {
        "id": "3_pharmacy_interactive_map_engine",
        "title": "Interactive Leaflet Map & Custom Pins (app.js)",
        "file": "app.js — Spatial Marker Clustering & Popup Dispatcher",
        "code": """function mountPharmacyMap(focusId, queryParams) {
  const mapEl = document.getElementById('pharmacy-map');
  if (!mapEl || typeof L === 'undefined') return;
  if (activePharmMap) activePharmMap.remove();

  const center = getPharmCenter();
  const map = L.map(mapEl, { scrollWheelZoom: true }).setView([center.lat, center.lon], 13);
  activePharmMap = map;

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Render Pin for Each Pharmacy (24/7 Green, Jan Aushadhi Amber, Chain Blue)
  const filtered = getFilteredPharmacies();
  filtered.slice(0, 100).forEach(p => {
    const pinClass = p.is24x7 ? 'pin--247' : (p.type === 'janaushadhi' ? 'pin--jan' : 'pin--chain');
    const pinIcon = L.divIcon({
      className: 'leaflet-fac-marker',
      html: `<div class=\"pharm-pin ${pinClass}\">${p.is24x7 ? '🟢' : '💊'}</div>`,
      iconSize: [30, 30]
    });

    const m = L.marker([p.lat, p.lon], { icon: pinIcon })
      .addTo(map)
      .bindPopup(`<strong>${esc(p.name)}</strong><br>${p.dist} km · ${esc(p.hours)}<br>` +
                 `<a href=\"tel:${p.phone}\" class=\"btn-call\">📞 Call</a> ` +
                 `<a href=\"https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}\" target=\"_blank\">🗺️ Navigate</a>`);

    m.on('click', () => highlightPharmacyCard(p.id));
    activePharmMarkers[p.id] = m;
  });
}"""
    },
    {
        "id": "4_smart_tokenized_search_filter",
        "title": "Smart Tokenized Search & Stopword Normalization (app.js)",
        "file": "app.js — Natural Keyword & Locality Tolerant Search",
        "code": """function matchPharmacySearch(pharmacy, query) {
  if (!query || !query.trim()) return true;

  // Normalize punctuation, parentheses, brackets, and redundant whitespace
  const cleanQ = query.toLowerCase().replace(/[()[\],.-]/g, ' ').replace(/\\s+/g, ' ').trim();
  if (!cleanQ) return true;

  const text = `${pharmacy.name} ${pharmacy.brand || ''} ${pharmacy.area} ${pharmacy.address} ` +
               `${(pharmacy.services || []).join(' ')} ${pharmacy.discount || ''}`
               .toLowerCase().replace(/[()[\],.-]/g, ' ').replace(/\\s+/g, ' ');

  // 1. Full substring match
  if (text.includes(cleanQ)) return true;

  // 2. Tokenized search filtering administrative stopwords
  const stopWords = new Set(['taluk', 'district', 'dist', 'road', 'rd', 'town', 'cross', 'main', 'near', 'in', 'at', 'and', 'the']);
  const tokens = cleanQ.split(' ').filter(w => w.length > 2);
  const sigTokens = tokens.filter(w => !stopWords.has(w));
  const testTokens = sigTokens.length > 0 ? sigTokens : tokens;

  // Resolves composite queries e.g. 'Harohalli Town (Kanakapura Taluk)'
  return testTokens.some(t => text.includes(t));
}"""
    },
    {
        "id": "5_clinical_triage_nlp_assistant",
        "title": "Curevia AI Clinical Triage & Emergency Classifier (app.js)",
        "file": "app.js — Deterministic Urgency Evaluation & Voice Dispatch",
        "code": """function generateCureviaReply(userMessage) {
  const lq = userMessage.toLowerCase().trim();
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Red-Flag Emergency Triage (Chest pain, breathing difficulty, severe trauma)
  const isEmergency = /(chest pain|heart attack|cannot breathe|unconscious|stroke|severe bleeding)/i.test(lq);
  if (isEmergency) {
    return {
      sender: 'curevia',
      time: timeStr,
      isAlert: true,
      text: `⚠️ **CRITICAL MEDICAL ALERT: Immediate emergency care required.**\\n` +
            `Please call an ambulance immediately or proceed to the nearest emergency trauma casualty.`,
      alertData: {
        title: 'Emergency Medical Services (India)',
        phones: [{ label: '112 National Emergency', tel: '112' }, { label: '108 Ambulance', tel: '108' }]
      }
    };
  }

  // 2. 24/7 Pharmacy & Jan Aushadhi (Generic Medicine) Router
  if (/(pharmacy|chemist|medicine|tablet|jan aushadhi|paracetamol|insulin)/i.test(lq)) {
    return {
      sender: 'curevia',
      time: timeStr,
      text: `💊 **Nearby Pharmacies & Jan Aushadhi Kendras Found:**\\n` +
            `We mapped 568+ verified stores with 24/7 night counters and 50-90% subsidized generic meds.`,
      serviceAction: { sid: 'pharmacies', label: 'Explore Pharmacies on Live Map →' }
    };
  }
  // 3. Clinical specialty matching (GP, Orthopedic, Pediatrics, Radiology)...
}"""
    }
]

def render_snippets():
    formatter = HtmlFormatter(style='monokai', nowrap=True)
    out_dir = r"D:\Downloads\curevia_code_snippets"
    os.makedirs(out_dir, exist_ok=True)
    
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--window-size=1200,900')
    options.add_argument('--device-scale-factor=2') # Retina 2x scale for ultra crisp text
    options.add_argument('--force-device-scale-factor=2')
    
    driver = webdriver.Chrome(options=options)
    
    generated_files = []
    for s in SNIPPETS:
        highlighted = highlight(s["code"], JavascriptLexer(), formatter)
        
        html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700&display=swap" rel="stylesheet">
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    background: #0f172a;
    padding: 30px;
    font-family: 'Fira Code', Consolas, monospace;
    display: flex;
    justify-content: center;
    align-items: center;
  }}
  .window {{
    width: 1060px;
    background: #1e1e1e;
    border-radius: 12px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1);
    overflow: hidden;
  }}
  .titlebar {{
    background: #252526;
    padding: 12px 18px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #333333;
  }}
  .dots {{
    display: flex;
    gap: 8px;
    margin-right: 20px;
  }}
  .dot {{
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }}
  .dot-red {{ background: #ff5f56; }}
  .dot-yellow {{ background: #ffbd2e; }}
  .dot-green {{ background: #27c93f; }}
  .filename {{
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 8px;
  }}
  .badge {{
    background: #0f766e;
    color: #ffffff;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 4px;
    margin-left: auto;
  }}
  .code-container {{
    padding: 24px 28px;
    background: #1e1e1e;
    color: #d4d4d4;
    font-size: 13.5px;
    line-height: 1.6;
    overflow: hidden;
  }}
  pre {{
    font-family: 'Fira Code', Consolas, monospace;
    white-space: pre;
  }}
  /* VS Code Monokai / Dark theme tokens */
  .k, .kd, .kn, .kr {{ color: #569cd6; font-weight: 600; }} /* keyword */
  .nf, .fm {{ color: #dcdcaa; }} /* function */
  .s, .s1, .s2, .sb {{ color: #ce9178; }} /* string */
  .mi, .mf {{ color: #b5cea8; }} /* number */
  .c, .c1, .cm {{ color: #6a9955; font-style: italic; }} /* comment */
  .nx {{ color: #9cdcfe; }} /* variable */
  .p, .o {{ color: #d4d4d4; }} /* punctuation/operator */
  .kc {{ color: #569cd6; }}
</style>
</head>
<body>
  <div class="window" id="capture">
    <div class="titlebar">
      <div class="dots">
        <div class="dot dot-red"></div>
        <div class="dot dot-yellow"></div>
        <div class="dot dot-green"></div>
      </div>
      <div class="filename">
        <span>📄</span>
        <span>{s["file"]}</span>
      </div>
      <span class="badge">CUREVIA CORE ENGINE</span>
    </div>
    <div class="code-container">
      <pre>{highlighted}</pre>
    </div>
  </div>
</body>
</html>"""
        
        temp_html_path = os.path.join(out_dir, f"{s['id']}.html")
        png_path = os.path.join(out_dir, f"{s['id']}.png")
        with open(temp_html_path, "w", encoding="utf-8") as f:
            f.write(html)
            
        driver.get(f"file:///{temp_html_path.replace(os.sep, '/')}")
        time.sleep(0.5)
        
        elem = driver.find_element("id", "capture")
        elem.screenshot(png_path)
        print(f"[+] Rendered screenshot: {png_path}")
        generated_files.append((s["title"], png_path))
        
        try:
            os.remove(temp_html_path)
        except Exception:
            pass

    driver.quit()
    print("[SUCCESS] All 5 high-quality code screenshots generated!")
    return generated_files

if __name__ == "__main__":
    render_snippets()
