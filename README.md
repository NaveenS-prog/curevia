# CUREVIA – Nearby Healthcare Service Finder

[![Status](https://img.shields.io/badge/Status-Active%20Prototype-0f766e.svg)](https://github.com/NaveenS-prog/curevia)
[![Platform](https://img.shields.io/badge/Platform-Web%20SPA-blue.svg)](https://github.com/NaveenS-prog/curevia)
[![Mapping](https://img.shields.io/badge/Maps-OpenStreetMap%20%7C%20Leaflet.js-green.svg)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

**CUREVIA** is a high-fidelity, interactive healthcare service discovery prototype designed to eliminate the critical pre-visit decision gap in urban and semi-urban Indian corridors. Rather than functioning as a generic hospital directory or advertising portal, CUREVIA is **service-first** and **transparency-focused**.

---

## 🌟 Core Pillars

1. **Service-Specific Search:** Search for exact clinical care or diagnostic tests (e.g., *General Physician*, *Chest X-ray*, *CBC Blood Count*, *Paediatrician*, *Ultrasound*, *Dental Check-up*).
2. **Four Critical Pre-Visit Metrics:** Every search result provides transparent side-by-side data:
   - **Cost Transparency:** Upfront consultation fees or diagnostic test price brackets.
   - **Real-Time Availability:** Operating hours and on-duty doctor availability matched to scheduled visit times (*Now*, *+2 Hours*, *This Evening*, *Tomorrow Morning*).
   - **Estimated Waiting Time:** Live queue delay estimates before travelling.
   - **Accessibility & Assistance:** Verified wheelchair ramps, elevator access, ground-floor consultations, and parking.
3. **Verified Pharmacy Directory:** 568 verified pharmacies across Bangalore and India with 24/7 operating status, Jan Aushadhi generic availability, home delivery, and emergency inventory indicators.
4. **Multilingual Interface:** Fully localized in English, Hindi, and Kannada with live dynamic locale switching.
5. **Authentic Geospatial Intelligence:** Exact GPS coordinates with Haversine spherical distance calculation adjusted for Bangalore urban road tortuosity (1.28 factor).
6. **Built-in Usability Test Harness:** Facilitator test mode measuring participant task completion times, screen counts, and usability metrics with Markdown/CSV export.

---

## 📂 Project Architecture

The repository is structured into clean, decoupled modules separating frontend presentation, static runtime data, ingestion pipelines, and raw sources:

```
curevia/
├── index.html                   # HTML5 application entry point (zero-friction root)
├── vercel.json                  # Vercel deployment & routing configuration
├── package.json                 # npm scripts for local dev and pipeline workflows
├── requirements.txt             # Python dependencies for ETL & data ingestion
├── .gitignore                   # Ignore rules for builds, backups, and caches
├── README.md                    # Project documentation
│
├── src/                         # Frontend Web Application Source
│   ├── css/
│   │   └── styles.css           # Responsive design system & CSS design tokens
│   ├── js/
│   │   ├── app.js               # Core application logic, routing & Leaflet maps
│   │   └── i18n.js              # Internationalization & translations (EN, HI, KN)
│   └── data/
│       ├── data.js              # Compiled healthcare dataset (2,660+ facilities)
│       └── pharmacies.js        # Compiled pharmacy dataset (568+ verified outlets)
│
├── data/                        # Datasets (Lifecycle Partitioned)
│   ├── raw/
│   │   ├── hospital_data_bangalore.csv    # Source Bangalore hospital registry
│   │   ├── hospitals_india_anonymized.csv # Source All-India hospital records
│   │   └── raw_osm_facilities.json        # Raw OpenStreetMap API extracts
│   └── processed/
│       ├── structured_facilities.json     # Sanitized intermediate hospital records
│       └── pharmacies.json                # Sanitized intermediate pharmacy records
│
├── scripts/                     # Data Pipelines, Ingestion & Automation Tools
│   ├── build_bangalore_dataset.py   # Primary compiler for hospital records
│   ├── build_pharmacies_dataset.py  # Primary compiler for pharmacy records
│   ├── enrich_pharmacies.py         # Enriches pharmacies with 24x7 and Jan Aushadhi tags
│   ├── ingest_osm.py                # Live OpenStreetMap Nominatim/Overpass fetcher
│   ├── process_facilities.py        # Normalizes raw OSM records into facility schema
│   ├── generate_full_data_js.py     # Compiles structured JSON into src/data/data.js
│   ├── fetch_nominatim.py           # Nominatim geocoding connector
│   └── generate_code_screenshots.py # Generates high-res code cards for reports
│
└── docs/                        # Academic Reports & System Specifications
    ├── CUREVIA_Technical_Stack_and_Implementation_Table.docx
    └── CUREVIA_Technical_Stack_Short.docx
```

---

## 🚀 Quickstart Guide

### 1. Run the Web Application

CUREVIA is zero-dependency and runs instantly in any modern web browser:

#### Option A: One-Click Launch
Open `index.html` directly in your favorite browser (Chrome, Edge, Firefox, Brave, Safari).

#### Option B: Local HTTP Server (Recommended)
Using Python:
```bash
python3 -m http.server 8080
```
Or with npm:
```bash
npm start
# or: npm run dev
```
Then navigate to `http://localhost:8080` in your browser.

---

### 2. Run or Update the Data Pipelines

All data scripts in `scripts/` automatically resolve root-relative paths and output directly to `data/processed/` and `src/data/`:

```bash
# 1. Install optional Python pipeline dependencies
pip install -r requirements.txt

# 2. Rebuild hospital dataset from raw CSV sources:
npm run data:build
# (or: python3 scripts/build_bangalore_dataset.py)

# 3. Ingest live data from OpenStreetMap for Bangalore/Kanakapura corridor:
npm run data:osm
# (or: python3 scripts/ingest_osm.py)

# 4. Rebuild & enrich pharmacy dataset:
npm run data:pharmacies
```

---

## 📱 Application Screen Mapping

| Screen | Route | Key Functionality |
|---|---|---|
| **01 – Home** | `#/` | Natural-language service search, corridor area selector, visit timing, popular quick chips, live comparison preview. |
| **02 – Search Results** | `#/results?s=gp` | Ranked facility cards, live Leaflet map view, active filter chips, multi-criteria sorting (*Best match*, *Closest*, *Lowest cost*, *Shortest wait*). |
| **03 – Pharmacy Map** | `#/pharmacies` | Interactive map of 568+ pharmacies with 24/7 filters, Jan Aushadhi generic flags, and home delivery badges. |
| **04 – Filters Drawer** | `Drawer / Sidebar` | Radius slider (2 km – 40 km), max cost slider, max wait slider, wheelchair/elevator checkboxes, 24h freshness filter. |
| **05 – Facility Details** | `#/facility/:id` | Departmental service price list, day-by-day timetable, accessibility breakdown, direct phone contact, field verify action. |
| **06 – Compare Matrix** | `#/compare` | Side-by-side comparison (2–3 facilities) with "Best Value", "Shortest Wait", and "Closest" badges, plus "Differences only" toggle. |
| **07 – Action Plan** | `#/plan/:id` | Turn-by-turn map route, driving/walking times, 1-click Google Maps navigation, pre-visit checklist, WhatsApp/SMS share. |
| **08 – Usability Test Harness** | `#/test` | Facilitator test mode implementing the 5 validation tasks with session timers, participant metrics, and Markdown/CSV export. |

---

## 🧪 Usability Testing Protocol

To conduct participant validation sessions:
1. Click **"Test mode"** in the navigation bar or visit `#/test`.
2. Input the participant ID (e.g. `P1`), persona type, and device category.
3. Complete the 5 standardized usability tasks:
   - **Task 1:** Find a general physician near the campus for fever.
   - **Task 2:** Compare two facilities offering a chest X-ray.
   - **Task 3:** Check thyroid test cost and evening availability.
   - **Task 4:** Find a wheelchair-accessible ultrasound facility.
   - **Task 5:** Review the pre-visit action plan and launch navigation.
4. Export the resulting metrics directly as a **Markdown summary table** or **CSV file** for evaluation reporting.

---

## 📜 Academic Integrity Note

Developed for the **Design Thinking Course (25ESC105)** at Jain University, Faculty of Engineering and Technology (CSE - AIDE). All geographic and facility coordinates represent authentic OpenStreetMap and public healthcare registry entries. Consultation fees and wait times represent realistic Karnataka benchmark ranges.
