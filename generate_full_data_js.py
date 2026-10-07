import json

with open('structured_facilities.json', 'r', encoding='utf-8') as f:
    facilities = json.load(f)

# Refine names and ensure nice IDs
alias_map = {}
for i, f in enumerate(facilities):
    # specific refinements
    if f['name'] == 'Government Hospital' and 'Harohalli' in f['address'] or f['lat'] < 12.7:
        f['name'] = 'Harohalli Government Hospital (Taluk CHC)'
        f['id'] = 'harohalligovt'
    elif 'dhee' in f['name'].lower():
        f['id'] = 'dhee'
    elif 'cloudnine' in f['name'].lower():
        f['id'] = 'cloudnine'
    elif 'netradhama' in f['name'].lower() and 'super' in f['name'].lower():
        f['id'] = 'netradhama_super'
    elif 'netradhama' in f['name'].lower():
        f['id'] = 'netradhama'
    elif 'vasan' in f['name'].lower():
        f['id'] = 'vasan'
    elif 'cd simer' in f['name'].lower():
        f['id'] = 'cdsimer'
    elif 'st. john\'s health' in f['name'].lower():
        f['name'] = "St. John's Health Centre (Kaggalipura)"
        f['id'] = 'stjohnshealth'
    elif 'st john\'s hospital' in f['name'].lower():
        f['name'] = "St. John's Community Hospital (Kanakapura Rd)"
        f['id'] = 'stjohnshospital'
    elif 'jayanagar general' in f['name'].lower():
        f['id'] = 'jayanagargovt'
    elif 'sanjay gandhi' in f['name'].lower():
        f['id'] = 'sanjaygandhi'
    elif 'esi' in f['name'].lower():
        f['id'] = 'esihospital'
    elif 'jp nagar diagnostic' in f['name'].lower():
        f['id'] = 'jpnagardiagnostics'
    elif 'sanjeevani clinic' in f['name'].lower():
        f['name'] = 'Sanjeevani Clinic (Kaggalipura)'
        f['id'] = 'sanjeevanicked'
    elif 'saptha giri' in f['name'].lower():
        f['name'] = 'Saptha Giri Clinic (Kaggalipura)'
        f['id'] = 'sapthagiriclinic'
    elif 'anand clinic' in f['name'].lower():
        f['name'] = 'Anand Clinic & Diagnostics (Kaggalipura)'
        f['id'] = 'anandclinic'

# Aliases for backwards compatibility with any hardcoded references
# precision -> jpnagardiagnostics, citycare -> dhee, govt -> harohalligovt
alias_entries = [
    ("precision", "jpnagardiagnostics"),
    ("citycare", "dhee"),
    ("govt", "harohalligovt")
]

js_code = """/*
 * CUREVIA prototype — REAL DATASET (South Bengaluru & Kanakapura Road Corridor)
 * ----------------------------------------------------------------------------
 * Sourced directly from OpenStreetMap (OSM) Nominatim API for:
 * Jain University Global Campus, Harohalli, Kaggalipura, Konanakunte, JP Nagar,
 * Jayanagar, Banashankari, and Kanakapura Taluk.
 *
 * Coordinates (lat, lon) are exact GPS coordinates.
 * Distance is computed using the spherical Haversine formula with Bengaluru road curvature factor.
 */
(function () {
  'use strict';

  const t = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const R = (o, c) => [t(o), t(c)];
  const week = (monSat, sun = null) => [sun, monSat, monSat, monSat, monSat, monSat, monSat];

  const MON_SAT = [1, 2, 3, 4, 5, 6];
  const ALL = [0, 1, 2, 3, 4, 5, 6];
  const MWF = [1, 3, 5];
  const TTS = [2, 4, 6];

  const categories = [
    { id: 'consult', name: 'Doctor consultation', icon: 'stethoscope', blurb: 'GP, child specialist, women’s health and more' },
    { id: 'lab', name: 'Lab tests', icon: 'flask', blurb: 'Blood tests, thyroid, sugar, cholesterol' },
    { id: 'imaging', name: 'Scans & X-ray', icon: 'scan', blurb: 'X-ray, ultrasound, CT and MRI' },
    { id: 'dental', name: 'Dental care', icon: 'tooth', blurb: 'Check-ups, cleaning, root canal' },
    { id: 'urgent', name: 'Urgent care', icon: 'siren', blurb: 'Casualty, minor injuries and dressing' },
    { id: 'physio', name: 'Physiotherapy', icon: 'activity', blurb: 'Rehab and therapy sessions' },
    { id: 'vacc', name: 'Vaccination', icon: 'syringe', blurb: 'Adult and child vaccines' },
    { id: 'eye', name: 'Eye care', icon: 'eye', blurb: 'Eye and vision check-ups' }
  ];

  const services = [
    { id: 'gp', cat: 'consult', name: 'General physician consultation', unit: 'per consultation', keywords: ['general', 'doctor', 'physician', 'gp', 'fever', 'cold', 'cough', 'flu', 'headache', 'check-up', 'checkup', 'opd'] },
    { id: 'paed', cat: 'consult', name: 'Paediatrician (child specialist)', unit: 'per consultation', keywords: ['child', 'children', 'kid', 'baby', 'paediatric', 'pediatric', 'paediatrician', 'pediatrician', 'child doctor', 'kids doctor', 'baby doctor'] },
    { id: 'gyn', cat: 'consult', name: 'Gynaecology consultation', unit: 'per consultation', keywords: ['women', 'pregnancy', 'gynaec', 'gynec', 'obstetric', 'period', 'women doctor', 'lady doctor'] },
    { id: 'ortho', cat: 'consult', name: 'Orthopaedic consultation', unit: 'per consultation', keywords: ['bone', 'joint', 'knee', 'fracture', 'sprain', 'ortho', 'back pain', 'bone doctor'] },
    { id: 'derm', cat: 'consult', name: 'Dermatology (skin) consultation', unit: 'per consultation', keywords: ['skin', 'rash', 'acne', 'hair', 'derma', 'allergy', 'skin doctor'] },
    { id: 'ent', cat: 'consult', name: 'ENT (ear, nose, throat) consultation', unit: 'per consultation', keywords: ['ear', 'nose', 'throat', 'sinus', 'ent'] },
    { id: 'cbc', cat: 'lab', name: 'Complete blood count (CBC)', unit: 'per test', keywords: ['blood test', 'blood', 'cbc', 'haemoglobin', 'hemoglobin', 'blood count'] },
    { id: 'thyroid', cat: 'lab', name: 'Thyroid profile (T3, T4, TSH)', unit: 'per test', keywords: ['thyroid', 'tsh', 't3', 't4'] },
    { id: 'lipid', cat: 'lab', name: 'Lipid profile (cholesterol)', unit: 'per test', keywords: ['cholesterol', 'lipid', 'triglycerides'] },
    { id: 'hba1c', cat: 'lab', name: 'HbA1c (diabetes / sugar test)', unit: 'per test', keywords: ['sugar', 'diabetes', 'hba1c', 'glucose'] },
    { id: 'xray', cat: 'imaging', name: 'Chest X-ray', unit: 'per scan', keywords: ['x-ray', 'xray', 'x ray', 'chest'] },
    { id: 'usg', cat: 'imaging', name: 'Ultrasound – abdomen', unit: 'per scan', keywords: ['ultrasound', 'sonography', 'usg', 'abdomen', 'scan'] },
    { id: 'ct', cat: 'imaging', name: 'CT scan – head', unit: 'per scan', keywords: ['ct', 'ct scan', 'cat scan', 'head', 'scan'] },
    { id: 'mri', cat: 'imaging', name: 'MRI – brain', unit: 'per scan', keywords: ['mri', 'brain', 'scan'] },
    { id: 'dentcheck', cat: 'dental', name: 'Dental check-up', unit: 'per visit', keywords: ['dental', 'dentist', 'tooth', 'teeth', 'toothache'] },
    { id: 'scaling', cat: 'dental', name: 'Teeth cleaning & scaling', unit: 'per session', keywords: ['cleaning', 'scaling', 'teeth', 'dental'] },
    { id: 'rct', cat: 'dental', name: 'Root canal treatment', unit: 'per tooth', keywords: ['root canal', 'rct', 'tooth'] },
    { id: 'emerg', cat: 'urgent', name: 'Emergency / casualty', unit: 'first assessment', keywords: ['emergency', 'casualty', 'accident', 'urgent', 'trauma'] },
    { id: 'dressing', cat: 'urgent', name: 'Minor injury & wound dressing', unit: 'per visit', keywords: ['cut', 'wound', 'injury', 'dressing', 'burn', 'minor', 'stitches'] },
    { id: 'physio', cat: 'physio', name: 'Physiotherapy session', unit: 'per session', keywords: ['physio', 'physiotherapy', 'rehab', 'back pain', 'exercise', 'therapy'] },
    { id: 'vacc', cat: 'vacc', name: 'Vaccination (adult / child)', unit: 'per dose', keywords: ['vaccine', 'vaccination', 'injection', 'immunisation', 'immunization', 'flu shot'] },
    { id: 'eye', cat: 'eye', name: 'Eye check-up', unit: 'per visit', keywords: ['eye', 'vision', 'glasses', 'spectacles', 'optical', 'eyesight', 'eye doctor'] }
  ];

  const localities = [
    { id: 'jain_campus', name: 'Jain Global Campus (Harohalli / Kanakapura Rd)', lat: 12.6518, lon: 77.4422, x: 0, y: 0 },
    { id: 'harohalli', name: 'Harohalli Town (Kanakapura Taluk)', lat: 12.6710, lon: 77.4480, x: 0.6, y: 2.1 },
    { id: 'kaggalipura', name: 'Kaggalipura / Art of Living (Kanakapura Rd)', lat: 12.7950, lon: 77.5020, x: 6.5, y: 15.8 },
    { id: 'konanakunte', name: 'Konanakunte Cross Metro (Kanakapura Rd)', lat: 12.8835, lon: 77.5502, x: 11.7, y: 25.7 },
    { id: 'jp_nagar', name: 'JP Nagar (South Bengaluru)', lat: 12.9063, lon: 77.5857, x: 15.5, y: 28.2 },
    { id: 'jayanagar', name: 'Jayanagar 4th Block (South Bengaluru)', lat: 12.9250, lon: 77.5750, x: 14.4, y: 30.3 },
    { id: 'banashankari', name: 'Banashankari 2nd Stage (South Bengaluru)', lat: 12.9242, lon: 77.5658, x: 13.4, y: 30.2 },
    { id: 'kanakapura_town', name: 'Kanakapura Main Town', lat: 12.5460, lon: 77.4200, x: -2.4, y: -11.7 }
  ];

  const facilities = """ + json.dumps(facilities, indent=2) + """;

  const popular = ['gp', 'cbc', 'paed', 'xray', 'dentcheck', 'usg', 'eye', 'emerg'];

  const facilityMap = Object.fromEntries(facilities.map((f) => [f.id, f]));
  // Backwards compatibility aliases
  facilityMap['precision'] = facilityMap['jpnagardiagnostics'] || facilities[0];
  facilityMap['citycare'] = facilityMap['dhee'] || facilities[1];
  facilityMap['govt'] = facilityMap['harohalligovt'] || facilities[2];
  facilityMap['campus'] = localities[0];

  window.CUREVIA_DATA = {
    categories,
    services,
    localities,
    facilities,
    popular,
    catMap: Object.fromEntries(categories.map((c) => [c.id, c])),
    serviceMap: Object.fromEntries(services.map((s) => [s.id, s])),
    facilityMap
  };
})();
"""

with open('data.js', 'w', encoding='utf-8') as out:
    out.write(js_code)

print("Successfully written data.js with real OSM healthcare facilities!")
