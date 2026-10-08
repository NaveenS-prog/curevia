# CUREVIA – Nearby Healthcare Service Finder
**Design Thinking (25ESC105) – Unit-III Solutioning Prototype**  
**Team Members:** Nanda Kishore, Naveen S, Nikil S, Nivin, Shwetha N (CSE - AIDE-B, Jain University)

---

## 🌟 Overview

**CUREVIA** is a high-fidelity interactive web application and working prototype designed to solve the critical pre-visit healthcare decision gap identified in our Design Thinking CA-2 project report.

Rather than acting as a generic hospital directory or advertising portal, CUREVIA is **service-first** and **transparency-focused**:
1. **Specific Medical Services:** Users search for the exact clinical care or test they need (e.g., *Chest X-ray*, *Complete Blood Count (CBC)*, *General Physician*, *Paediatrician*, *Ultrasound*, *Dental Check-up*).
2. **Four Critical Pre-Visit Metrics:** Every option brings side-by-side:
   - **Cost Transparency:** Upfront consultation fees or diagnostic price ranges.
   - **Real-Time Availability:** Operating hours and on-duty doctor availability for the user's scheduled visit time (*Now*, *+2 Hours*, *This Evening*, *Tomorrow Morning*).
   - **Estimated Waiting Time:** Typical queue delays before travelling.
   - **Accessibility & Assistance:** Verified wheelchair ramps, elevator access, ground-floor consultations, and parking.
3. **Real OpenStreetMap (OSM) Integration:** Sourced from OpenStreetMap with 68 real healthcare facilities across the South Bengaluru and Kanakapura Road corridor (including Harohalli, Jain Global Campus vicinity, Kaggalipura, Konanakunte Cross, JP Nagar, and Jayanagar).
4. **Interactive Leaflet.js Map:** Real OpenStreetMap tiles with custom status markers, pin labels, and routing.
5. **Live GPS Location:** One-click device GPS coordinate acquisition calculating exact spherical road distances (Haversine formula).
6. **Field Verification Simulator:** In-app reception and community verification modal allowing evaluators to simulate updating queue wait times, doctor schedules, or fees in real-time.
7. **Built-in Usability Test Harness (Section 10):** Facilitator test mode measuring participant task completion times, screen counts, and usability metrics (Markdown & CSV export).

---

## 🚀 How to Run the Prototype

CUREVIA is completely standalone and zero-dependency:

### Option 1: Direct File Opening
Double-click `index.html` in your file browser (Google Chrome, Microsoft Edge, Brave, or Safari).

### Option 2: Local HTTP Server (Recommended for Map Tiles)
```powershell
python -m http.server 8080
```
Then open `http://localhost:8080` in your web browser.

---

## 📱 Screen Mapping (CA-2 Report Section 6.2)

| Screen | Route | Key Features |
|---|---|---|
| **01 – Home** | `#/` | Natural-language service search, corridor area selector, visit timing, popular quick chips, and live comparison preview. |
| **02 – Search Results** | `#/results?s=gp` | Ranked facility cards, live Leaflet OpenStreetMap view, active filter chips, sort options (*Best match*, *Closest*, *Lowest cost*, *Shortest wait*). |
| **03 – Filters** | `Drawer / Sidebar` | Radius slider (2 km – 40 km), maximum cost selector, maximum wait selector, wheelchair/elevator checkboxes, and 24h freshness filter. |
| **04 – Facility Details** | `#/facility/:id` | Full departmental service price list, day-by-day timetable, accessibility breakdown, phone contact, and field verify action. |
| **05 – Compare Matrix** | `#/compare` | 2–3 facility side-by-side comparison with "Best Value", "Shortest Wait", and "Closest" badges, plus "Differences only" filter. |
| **06 – Action Plan** | `#/plan/:id` | Turn-by-turn map route, driving/walking times, 1-click Google Maps navigation, pre-visit checklist, and WhatsApp/SMS share. |
| **Facilitator Test Mode** | `#/test` | Embedded test harness implementing the 5 validation tasks from CA-2 Section 10 with session timers and rubric export. |

---

## 🗺️ Real Healthcare Data Coverage

Sourced via OpenStreetMap Nominatim API across:
- **Jain Global Campus Vicinity & Harohalli:** Harohalli Government Hospital (Taluk CHC), CD Simer Hospital, Paduvanagare Primary Health Centre.
- **Kanakapura Road Corridor:** Sanjeevani Clinic, Anand Clinic & Diagnostics, Saptha Giri Clinic, St. John's Health Centre (Kaggalipura), Sri Sri Ayurveda Hospital.
- **Konanakunte Cross & South Bengaluru:** Cloudnine Hospital, Dhee Hospital, Sri Sai Ram Hospital, Vasan Eye Care, Netradhama Super Speciality Eye Hospital.
- **Jayanagar & JP Nagar:** Jayanagar General Hospital, ESI Hospital, Sanjay Gandhi Hospital, JP Nagar Diagnostic Centre, Bangalore Dental Clinic.

---

## 🔄 Live OpenStreetMap Ingestion Script (`ingest_osm.py`)

CUREVIA includes an automated, turn-key OpenStreetMap ingestion script (`ingest_osm.py`) that queries OpenStreetMap's Nominatim API, dedupes records, maps medical service profiles, and instantly rebuilds `data.js`:

```powershell
# 1. Ingest full South Bengaluru & Kanakapura Road corridor (Default)
python ingest_osm.py

# 2. Ingest Harohalli & Jain Global Campus vicinity only
python ingest_osm.py --area harohalli

# 3. Ingest Kanakapura town only
python ingest_osm.py --area kanakapura

# 4. Ingest South Bengaluru core (Jayanagar / JP Nagar / Banashankari)
python ingest_osm.py --area bangalore

# 5. Ingest ANY custom city or district across India
python ingest_osm.py --custom "Mysuru"
```

The script automatically backs up your previous `data.js` to `data.js.backup.js` and outputs a breakdown of all sanitized facilities.

---

## 🧪 Built-in Usability Test Mode (Section 10 Validation Plan)

To satisfy the **Evidence Integrity Note (Section 2.8)** requiring real interaction with 3–4 participants:
1. Click **"Test mode"** in the top navigation bar (or visit `#/test`).
2. Enter the participant code (e.g. `P1`), user persona, and device.
3. Conduct the 5 structured tasks:
   - **Task 1:** Find a general physician near the campus for fever.
   - **Task 2:** Compare two options offering a chest X-ray.
   - **Task 3:** Check thyroid test cost and evening availability.
   - **Task 4:** Find a wheelchair-accessible ultrasound facility.
   - **Task 5:** Review the plan and launch navigation.
4. Export the results directly as a **Markdown summary table** or **CSV file** to embed in the final presentation.

---

## 📂 Repository Structure

```
curevia/
├── index.html                 # HTML5 single-page application shell
├── styles.css                 # Custom responsive design system & UI tokens
├── data.js                    # 68 verified OpenStreetMap healthcare facilities & 22 service schemas
├── app.js                     # Client-side router, Haversine engine, Leaflet integration & test harness
├── ingest_osm.py              # Single-command OpenStreetMap live ingestion script (CLI)
├── process_facilities.py      # Modular data cleaning & service mapping logic
├── fetch_nominatim.py         # Raw Nominatim API connector
├── generate_full_data_js.py   # Dataset builder script
├── .gitignore                 # Git ignore rules
└── README.md                  # Project documentation & evaluation guide
```

---

## 📜 Academic Integrity Note
Developed for the **Design Thinking Course (25ESC105)** at Jain University, Faculty of Engineering and Technology (CSE - AIDE). All geographic and facility coordinates represent authentic OpenStreetMap entries. Consultation fees and queue wait times represent realistic Karnataka benchmarks and can be updated dynamically via the in-app verification tool.
