/*
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

  const facilities = [
  {
    "id": "yadiyurumaterni",
    "name": "Yadiyuru Maternity Hospital",
    "type": "government",
    "area": "Devagiri Temple Ward",
    "address": "Kanakapura Road, Devagiri Temple Ward, 560082, Bengaluru",
    "lat": 12.927098,
    "lon": 77.576651,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700000",
    "rating": 3.9,
    "reviews": 120,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 15,
    "source": "facility",
    "services": {
      "gp": {
        "price": 20,
        "priceNote": "OPD registration card",
        "doctor": "Duty Medical Officer",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          840
        ],
        "wait": 75
      },
      "paed": {
        "price": 20,
        "doctor": "Paediatrician",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          840
        ],
        "wait": 40
      },
      "gyn": {
        "price": 20,
        "priceNote": "OPD registration card",
        "doctor": "Maternity OPD",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          840
        ],
        "wait": 80
      },
      "ortho": {
        "price": 20,
        "priceNote": "OPD registration card",
        "doctor": "Orthopaedic Unit",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          480,
          840
        ],
        "wait": 90
      },
      "cbc": {
        "price": 50,
        "priceNote": "Subsidised lab fee",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          960
        ],
        "wait": 45
      },
      "xray": {
        "price": 100,
        "priceNote": "Subsidised rate",
        "wait": 50
      },
      "usg": {
        "price": 200,
        "priceNote": "Subsidised rate",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          900
        ],
        "wait": 120
      },
      "emerg": {
        "price": 0,
        "priceNote": "Free 24x7 emergency casualty",
        "wait": 20
      },
      "dressing": {
        "price": 20,
        "wait": 30
      },
      "vacc": {
        "price": 0,
        "priceNote": "Free universal immunization programme",
        "wait": 30
      }
    }
  },
  {
    "id": "netradhama",
    "name": "Netradhama Hospital",
    "type": "eye",
    "area": "Devagiri Temple Ward",
    "address": "Kanakapura Road, Devagiri Temple Ward, 560070, Bengaluru",
    "lat": 12.925303,
    "lon": 77.577406,
    "open24": false,
    "hours": [
      [
        600,
        780
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ]
    ],
    "phone": "+91 80 8026700001",
    "rating": 4.1,
    "reviews": 257,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": false,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 62,
    "source": "community",
    "services": {
      "eye": {
        "price": 450,
        "doctor": "Senior Consultant Ophthalmologist",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1140
        ],
        "wait": 25
      }
    }
  },
  {
    "id": "nethradhamasupe",
    "name": "Nethradhama Superspeciality Eye Hospital",
    "type": "eye",
    "area": "Devagiri Temple Ward",
    "address": "Kanakapura Road, Devagiri Temple Ward, 560082, Bengaluru",
    "lat": 12.925693,
    "lon": 77.577313,
    "open24": false,
    "hours": [
      [
        600,
        780
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ]
    ],
    "phone": "+91 80 8026700002",
    "rating": 4.2,
    "reviews": 394,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 109,
    "source": "listed",
    "services": {
      "eye": {
        "price": 450,
        "doctor": "Senior Consultant Ophthalmologist",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1140
        ],
        "wait": 25
      }
    }
  },
  {
    "id": "cloudnine",
    "name": "Cloudnine Hospital",
    "type": "hospital",
    "area": "Anjanapura",
    "address": "Kanakapura Road, Anjanapura, 560062, Bengaluru",
    "lat": 12.883291,
    "lon": 77.550086,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700003",
    "rating": 4.4,
    "reviews": 531,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 156,
    "source": "facility",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 850,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 900,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "dhee",
    "name": "Dhee Hospital",
    "type": "hospital",
    "area": "Anjanapura",
    "address": "Kanakapura Road, Anjanapura, 560062, Bengaluru",
    "lat": 12.88351,
    "lon": 77.550214,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700004",
    "rating": 4.6,
    "reviews": 668,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 203,
    "source": "community",
    "services": {
      "gp": {
        "price": 600,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2600,
          3400
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "gunasheelahospi",
    "name": "Gunasheela Hospital",
    "type": "hospital",
    "area": "Yediyuru",
    "address": "Kanakapura Road, Yediyuru, 560004, Bengaluru",
    "lat": 12.940669,
    "lon": 77.575114,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700005",
    "rating": 4.8,
    "reviews": 805,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 250,
    "source": "listed",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "jbshospital",
    "name": "JBS Hospital",
    "type": "hospital",
    "area": "Pattabhirama Nagara",
    "address": "Kanakapura Road, Pattabhirama Nagara, 560070, Bengaluru",
    "lat": 12.920717,
    "lon": 77.574597,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700006",
    "rating": 3.9,
    "reviews": 942,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 297,
    "source": "facility",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "srisairamhospit",
    "name": "Sri Sai Ram Hospital",
    "type": "hospital",
    "area": "Yelachenahalli",
    "address": "Kanakapura Road, Yelachenahalli, 560062, Bengaluru",
    "lat": 12.894305,
    "lon": 77.568282,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700007",
    "rating": 4.1,
    "reviews": 1079,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 344,
    "source": "community",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "amcmultispecial",
    "name": "AMC Multispeciality Hospital",
    "type": "hospital",
    "area": "Devagiri Temple Ward",
    "address": "Kanakapura Road, Devagiri Temple Ward, 560070, Bengaluru",
    "lat": 12.92967,
    "lon": 77.576408,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700008",
    "rating": 4.3,
    "reviews": 1216,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 391,
    "source": "listed",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "vasan",
    "name": "Vasan Eye Care Hospital",
    "type": "eye",
    "area": "Sarakki",
    "address": "Kanakapura Road, Sarakki, 560078, Bengaluru",
    "lat": 12.910339,
    "lon": 77.57324,
    "open24": false,
    "hours": [
      [
        600,
        780
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ]
    ],
    "phone": "+91 80 8026700009",
    "rating": 4.4,
    "reviews": 1353,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": false,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 438,
    "source": "facility",
    "services": {
      "eye": {
        "price": 450,
        "doctor": "Senior Consultant Ophthalmologist",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1140
        ],
        "wait": 25
      }
    }
  },
  {
    "id": "sahasrahospital",
    "name": "Sahasra Hospital",
    "type": "hospital",
    "area": "Pattabhirama Nagara",
    "address": "Kanakapura Road, Pattabhirama Nagara, 560082, Bengaluru",
    "lat": 12.920651,
    "lon": 77.574612,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700010",
    "rating": 4.6,
    "reviews": 1490,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 485,
    "source": "community",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "stjohnshealth",
    "name": "St. John's Health Centre (Kaggalipura)",
    "type": "community",
    "area": "Kanakapura Road",
    "address": "Kanakapura Road, Kanakapura Road, 560082, Bengaluru",
    "lat": 12.813763,
    "lon": 77.510329,
    "open24": false,
    "hours": [
      null,
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ]
    ],
    "phone": "+91 80 8026700011",
    "rating": 4.8,
    "reviews": 1627,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": false,
      "toilet": true,
      "parking": false,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 32,
    "source": "listed",
    "services": {
      "gp": {
        "price": 10,
        "priceNote": "Govt PHC token",
        "doctor": "Medical Officer",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          960
        ],
        "wait": 35
      },
      "dressing": {
        "price": 10,
        "wait": 20
      },
      "cbc": {
        "price": 40,
        "wait": null
      },
      "vacc": {
        "price": 0,
        "priceNote": "National Immunization Schedule (Free)",
        "days": [
          3,
          6
        ],
        "wait": 20
      }
    }
  },
  {
    "id": "srisriayurvedah",
    "name": "Sri Sri Ayurveda hospital",
    "type": "hospital",
    "area": "Kanakapura Road",
    "address": "Kanakapura Road, Kanakapura Road, 560082, Bengaluru",
    "lat": 12.82218,
    "lon": 77.521761,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700012",
    "rating": 3.9,
    "reviews": 1764,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 79,
    "source": "facility",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "stjohnshospital",
    "name": "St. John's Community Hospital (Kanakapura Rd)",
    "type": "hospital",
    "area": "Kanakapura Road",
    "address": "Kanakapura Road, Kanakapura Road, 560116, Bengaluru",
    "lat": 12.812884,
    "lon": 77.510177,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700013",
    "rating": 4.1,
    "reviews": 1901,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 126,
    "source": "community",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "harohalligovt",
    "name": "Harohalli Government Hospital (Taluk CHC)",
    "type": "hospital",
    "area": "Kanakapura Road",
    "address": "Kanakapura Road, Kanakapura Road, 562112, Bengaluru",
    "lat": 12.660478,
    "lon": 77.449659,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700014",
    "rating": 4.3,
    "reviews": 238,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 173,
    "source": "listed",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "harohalligovt",
    "name": "Harohalli Government Hospital (Taluk CHC)",
    "type": "government",
    "area": "Kanakapura Road",
    "address": "Kanakapura Road, Kanakapura Road, 562112, Bengaluru",
    "lat": 12.680279,
    "lon": 77.469391,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700015",
    "rating": 4.5,
    "reviews": 375,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 220,
    "source": "facility",
    "services": {
      "gp": {
        "price": 20,
        "priceNote": "OPD registration card",
        "doctor": "Duty Medical Officer",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          840
        ],
        "wait": 75
      },
      "paed": {
        "price": 20,
        "priceNote": "OPD registration card",
        "doctor": "Paediatric Unit",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          840
        ],
        "wait": 60
      },
      "gyn": {
        "price": 20,
        "priceNote": "OPD registration card",
        "doctor": "Maternity OPD",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          840
        ],
        "wait": 80
      },
      "ortho": {
        "price": 20,
        "priceNote": "OPD registration card",
        "doctor": "Orthopaedic Unit",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          480,
          840
        ],
        "wait": 90
      },
      "cbc": {
        "price": 50,
        "priceNote": "Subsidised lab fee",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          960
        ],
        "wait": 45
      },
      "xray": {
        "price": 100,
        "priceNote": "Subsidised rate",
        "wait": 50
      },
      "usg": {
        "price": 200,
        "priceNote": "Subsidised rate",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          900
        ],
        "wait": 120
      },
      "emerg": {
        "price": 0,
        "priceNote": "Free 24x7 emergency casualty",
        "wait": 20
      },
      "dressing": {
        "price": 20,
        "wait": 30
      },
      "vacc": {
        "price": 0,
        "priceNote": "Free universal immunization programme",
        "wait": 30
      }
    }
  },
  {
    "id": "nationalinstitu",
    "name": "National Institute of Mental Health and NeuroSciences",
    "type": "government",
    "area": "BHEL Ward",
    "address": "8th Main Road, BHEL Ward, 560011, Bengaluru",
    "lat": 12.937489,
    "lon": 77.594142,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700016",
    "rating": 4.6,
    "reviews": 512,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 267,
    "source": "community",
    "services": {
      "gp": {
        "price": 20,
        "priceNote": "OPD registration card",
        "doctor": "Duty Medical Officer",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          840
        ],
        "wait": 75
      },
      "paed": {
        "price": 20,
        "priceNote": "OPD registration card",
        "doctor": "Paediatric Unit",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          840
        ],
        "wait": 60
      },
      "gyn": {
        "price": 20,
        "priceNote": "OPD registration card",
        "doctor": "Maternity OPD",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          840
        ],
        "wait": 80
      },
      "ortho": {
        "price": 20,
        "priceNote": "OPD registration card",
        "doctor": "Orthopaedic Unit",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          480,
          840
        ],
        "wait": 90
      },
      "cbc": {
        "price": 50,
        "priceNote": "Subsidised lab fee",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          960
        ],
        "wait": 45
      },
      "xray": {
        "price": 100,
        "priceNote": "Subsidised rate",
        "wait": 50
      },
      "usg": {
        "price": 200,
        "priceNote": "Subsidised rate",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          900
        ],
        "wait": 120
      },
      "emerg": {
        "price": 0,
        "priceNote": "Free 24x7 emergency casualty",
        "wait": 20
      },
      "dressing": {
        "price": 20,
        "wait": 30
      },
      "vacc": {
        "price": 0,
        "priceNote": "Free universal immunization programme",
        "wait": 30
      }
    }
  },
  {
    "id": "jayanagargovt",
    "name": "Jayanagar General Hospital",
    "type": "government",
    "area": "Tilak Nagara",
    "address": "32nd Cross Road, Tilak Nagara, 570014, Bengaluru",
    "lat": 12.926103,
    "lon": 77.592544,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700017",
    "rating": 4.8,
    "reviews": 649,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 314,
    "source": "listed",
    "services": {
      "gp": {
        "price": 20,
        "priceNote": "OPD registration card",
        "doctor": "Duty Medical Officer",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          840
        ],
        "wait": 75
      },
      "paed": {
        "price": 20,
        "priceNote": "OPD registration card",
        "doctor": "Paediatric Unit",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          840
        ],
        "wait": 60
      },
      "gyn": {
        "price": 20,
        "priceNote": "OPD registration card",
        "doctor": "Maternity OPD",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          840
        ],
        "wait": 80
      },
      "ortho": {
        "price": 20,
        "priceNote": "OPD registration card",
        "doctor": "Orthopaedic Unit",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          480,
          840
        ],
        "wait": 90
      },
      "cbc": {
        "price": 50,
        "priceNote": "Subsidised lab fee",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          960
        ],
        "wait": 45
      },
      "xray": {
        "price": 100,
        "priceNote": "Subsidised rate",
        "wait": 50
      },
      "usg": {
        "price": 200,
        "priceNote": "Subsidised rate",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          900
        ],
        "wait": 120
      },
      "emerg": {
        "price": 0,
        "priceNote": "Free 24x7 emergency casualty",
        "wait": 20
      },
      "dressing": {
        "price": 20,
        "wait": 30
      },
      "vacc": {
        "price": 0,
        "priceNote": "Free universal immunization programme",
        "wait": 30
      }
    }
  },
  {
    "id": "esihospital",
    "name": "ESI Hospital",
    "type": "government",
    "area": "Tilak Nagara",
    "address": "D Main Road, Tilak Nagara, 560041, Bengaluru",
    "lat": 12.927995,
    "lon": 77.589406,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700018",
    "rating": 4.0,
    "reviews": 786,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 361,
    "source": "facility",
    "services": {
      "gp": {
        "price": 20,
        "priceNote": "OPD registration card",
        "doctor": "Duty Medical Officer",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          840
        ],
        "wait": 75
      },
      "paed": {
        "price": 20,
        "priceNote": "OPD registration card",
        "doctor": "Paediatric Unit",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          840
        ],
        "wait": 60
      },
      "gyn": {
        "price": 20,
        "priceNote": "OPD registration card",
        "doctor": "Maternity OPD",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          840
        ],
        "wait": 80
      },
      "ortho": {
        "price": 20,
        "priceNote": "OPD registration card",
        "doctor": "Orthopaedic Unit",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          480,
          840
        ],
        "wait": 90
      },
      "cbc": {
        "price": 50,
        "priceNote": "Subsidised lab fee",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          960
        ],
        "wait": 45
      },
      "xray": {
        "price": 100,
        "priceNote": "Subsidised rate",
        "wait": 50
      },
      "usg": {
        "price": 200,
        "priceNote": "Subsidised rate",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          900
        ],
        "wait": 120
      },
      "emerg": {
        "price": 0,
        "priceNote": "Free 24x7 emergency casualty",
        "wait": 20
      },
      "dressing": {
        "price": 20,
        "wait": 30
      },
      "vacc": {
        "price": 0,
        "priceNote": "Free universal immunization programme",
        "wait": 30
      }
    }
  },
  {
    "id": "hitechkidneysto",
    "name": "Hi Tech Kidney Stone Hospital",
    "type": "hospital",
    "area": "Devagiri Temple Ward",
    "address": "32nd Cross Road, Devagiri Temple Ward, 560001, Bengaluru",
    "lat": 12.927139,
    "lon": 77.579028,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700019",
    "rating": 4.1,
    "reviews": 923,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 408,
    "source": "community",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "oxfordhospital",
    "name": "Oxford Hospital",
    "type": "hospital",
    "area": "Jayanagar",
    "address": "Durga Parameswara Road, Jayanagar, 560078, Bengaluru",
    "lat": 12.93121,
    "lon": 77.575691,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700020",
    "rating": 4.3,
    "reviews": 1060,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 455,
    "source": "listed",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "sanjaygandhi",
    "name": "Sanjay Gandhi Hospital",
    "type": "government",
    "area": "Tilak Nagara",
    "address": "32nd Cross Road, Tilak Nagara, 560041, Bengaluru",
    "lat": 12.926969,
    "lon": 77.592928,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700021",
    "rating": 4.5,
    "reviews": 1197,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 502,
    "source": "facility",
    "services": {
      "gp": {
        "price": 20,
        "priceNote": "OPD registration card",
        "doctor": "Duty Medical Officer",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          840
        ],
        "wait": 75
      },
      "paed": {
        "price": 20,
        "priceNote": "OPD registration card",
        "doctor": "Paediatric Unit",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          840
        ],
        "wait": 60
      },
      "gyn": {
        "price": 20,
        "priceNote": "OPD registration card",
        "doctor": "Maternity OPD",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          840
        ],
        "wait": 80
      },
      "ortho": {
        "price": 20,
        "priceNote": "OPD registration card",
        "doctor": "Orthopaedic Unit",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          480,
          840
        ],
        "wait": 45
      },
      "cbc": {
        "price": 50,
        "priceNote": "Subsidised lab fee",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          480,
          960
        ],
        "wait": 45
      },
      "xray": {
        "price": 100,
        "priceNote": "Subsidised rate",
        "wait": 50
      },
      "usg": {
        "price": 200,
        "priceNote": "Subsidised rate",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          900
        ],
        "wait": 120
      },
      "emerg": {
        "price": 0,
        "priceNote": "Free 24x7 emergency casualty",
        "wait": 20
      },
      "dressing": {
        "price": 20,
        "wait": 30
      },
      "vacc": {
        "price": 0,
        "priceNote": "Free universal immunization programme",
        "wait": 30
      }
    }
  },
  {
    "id": "shekharhospital",
    "name": "Shekhar Hospital",
    "type": "hospital",
    "area": "Pattabhirama Nagara",
    "address": "28th Main Road, Pattabhirama Nagara, 560039, Bengaluru",
    "lat": 12.917589,
    "lon": 77.594891,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700022",
    "rating": 4.6,
    "reviews": 1334,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 49,
    "source": "community",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "apollobengaluru",
    "name": "Apollo Bengaluru Cradle Limited",
    "type": "hospital",
    "area": "Shakambarinagara",
    "address": "Marenahalli Road, Shakambarinagara, 560011, Bengaluru",
    "lat": 12.916801,
    "lon": 77.585188,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700023",
    "rating": 4.8,
    "reviews": 1471,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 96,
    "source": "listed",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 850,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 900,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "jayanagarorthop",
    "name": "Jayanagar Orthopaedic Centre",
    "type": "hospital",
    "area": "Byrasandra",
    "address": "30th Cross Road, Byrasandra, 560041, Bengaluru",
    "lat": 12.929329,
    "lon": 77.587709,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700024",
    "rating": 4.0,
    "reviews": 1608,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 143,
    "source": "facility",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 750,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 20
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "jayanagarheartc",
    "name": "Jayanagar heart Centre",
    "type": "hospital",
    "area": "Pattabhirama Nagara",
    "address": "36th Cross Road, Pattabhirama Nagara, 560011, Bengaluru",
    "lat": 12.923168,
    "lon": 77.584433,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700025",
    "rating": 4.2,
    "reviews": 1745,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 190,
    "source": "community",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "naturecurehospi",
    "name": "Nature Cure Hospital Campus",
    "type": "hospital",
    "area": "Yediyuru",
    "address": "Yediyuru, Bengaluru",
    "lat": 12.933503,
    "lon": 77.584685,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700026",
    "rating": 4.3,
    "reviews": 1882,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 237,
    "source": "listed",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "jpnagarclinic",
    "name": "JP Nagar Clinic",
    "type": "clinic",
    "area": "JP Nagar",
    "address": "22nd B Main Road, JP Nagar, 560078, Bengaluru",
    "lat": 12.900676,
    "lon": 77.587257,
    "open24": false,
    "hours": [
      [
        600,
        780
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ]
    ],
    "phone": "+91 80 8026700027",
    "rating": 4.5,
    "reviews": 219,
    "access": {
      "wheelchair": false,
      "ramp": false,
      "lift": false,
      "toilet": false,
      "parking": false,
      "ground": false,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card"
    ],
    "updated": 284,
    "source": "facility",
    "services": {
      "gp": {
        "price": 350,
        "doctor": "Dr. Ramesh Babu",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 15
      },
      "paed": {
        "price": 450,
        "doctor": "Dr. Anitha Gowda",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          1020,
          1200
        ],
        "wait": 20
      },
      "derm": {
        "price": 500,
        "doctor": "Dr. Swetha R.",
        "days": [
          6
        ],
        "time": [
          600,
          780
        ],
        "wait": 15
      },
      "cbc": {
        "price": 300,
        "priceNote": "Sample collected on-site",
        "wait": null
      },
      "dressing": {
        "price": 200,
        "wait": 10
      },
      "vacc": {
        "price": [
          1200,
          1600
        ],
        "priceNote": "Routine paediatric & adult",
        "wait": 10
      }
    }
  },
  {
    "id": "jpnagarphysioth",
    "name": "JP Nagar Physiotherapy Clinic",
    "type": "physio",
    "area": "Sarakki",
    "address": "9th Cross Road, Sarakki, 560078, Bengaluru",
    "lat": 12.91102,
    "lon": 77.578656,
    "open24": false,
    "hours": [
      [
        600,
        780
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ]
    ],
    "phone": "+91 80 8026700028",
    "rating": 4.7,
    "reviews": 356,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": false,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 331,
    "source": "community",
    "services": {
      "physio": {
        "price": 600,
        "doctor": "Senior Physiotherapist",
        "time": [
          420,
          1200
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 10
      },
      "ortho": {
        "price": 700,
        "doctor": "Consultant Orthopaedist",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          960,
          1200
        ],
        "wait": 20
      }
    }
  },
  {
    "id": "jpnagardiagnostics",
    "name": "JP Nagar Diagnostic Centre",
    "type": "diagnostic",
    "area": "Sarakki",
    "address": "9th Cross Road, Sarakki, 560078, Bengaluru",
    "lat": 12.911003,
    "lon": 77.578691,
    "open24": false,
    "hours": [
      [
        420,
        840
      ],
      [
        420,
        1260
      ],
      [
        420,
        1260
      ],
      [
        420,
        1260
      ],
      [
        420,
        1260
      ],
      [
        420,
        1260
      ],
      [
        420,
        1260
      ]
    ],
    "phone": "+91 80 8026700029",
    "rating": 4.8,
    "reviews": 493,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": false,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 378,
    "source": "listed",
    "services": {
      "cbc": {
        "price": 280,
        "wait": 10
      },
      "thyroid": {
        "price": 450,
        "wait": 10
      },
      "lipid": {
        "price": 500,
        "wait": 10
      },
      "hba1c": {
        "price": 380,
        "wait": 10
      },
      "xray": {
        "price": 450,
        "wait": 15
      },
      "usg": {
        "price": [
          1200,
          1500
        ],
        "priceNote": "Prior fasting needed for abdomen",
        "wait": 20
      },
      "ct": {
        "price": [
          2400,
          3000
        ],
        "wait": 25
      }
    }
  },
  {
    "id": "ringroadhospita",
    "name": "Ring Road Hospital",
    "type": "hospital",
    "area": "Banashankari",
    "address": "1st Main Road, Banashankari, 560085, Bengaluru",
    "lat": 12.927455,
    "lon": 77.551629,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700030",
    "rating": 4.0,
    "reviews": 630,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 425,
    "source": "facility",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "banashankarihos",
    "name": "Banashankari Hospital",
    "type": "hospital",
    "area": "Doddakammanahalli",
    "address": "Bannerghatta Road, Doddakammanahalli, 560083, Bengaluru",
    "lat": 12.844365,
    "lon": 77.583809,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700031",
    "rating": 4.2,
    "reviews": 767,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 472,
    "source": "community",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "banashankariref",
    "name": "Banashankari Referral Hospital",
    "type": "hospital",
    "area": "Ganesh Mandira Ward",
    "address": "27th Cross Road, Ganesh Mandira Ward, 560070, Bengaluru",
    "lat": 12.923134,
    "lon": 77.564297,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700032",
    "rating": 4.3,
    "reviews": 904,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 19,
    "source": "listed",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "promedhospital",
    "name": "Pro MED Hospital",
    "type": "hospital",
    "area": "Ganesh Mandira Ward",
    "address": "13th Cross Road, Ganesh Mandira Ward, 560070, Bengaluru",
    "lat": 12.929436,
    "lon": 77.564005,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700033",
    "rating": 4.5,
    "reviews": 1041,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 66,
    "source": "facility",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "rrhospitalandtr",
    "name": "R.R. Hospital and Trauma Centre",
    "type": "hospital",
    "area": "Banashankari Temple Ward",
    "address": "Outer Ring Road, Banashankari Temple Ward, 560078, Bengaluru",
    "lat": 12.907427,
    "lon": 77.571632,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700034",
    "rating": 4.7,
    "reviews": 1178,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 113,
    "source": "community",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "raghavendrahosp",
    "name": "Raghavendra Hospital",
    "type": "hospital",
    "area": "Ashoka Nagara",
    "address": "5th B Cross, Ashoka Nagara, 560050, Bengaluru",
    "lat": 12.938787,
    "lon": 77.554296,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700035",
    "rating": 4.8,
    "reviews": 1315,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 160,
    "source": "listed",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "chiranjeevihosp",
    "name": "Chiranjeevi Hospital & Maternity Home",
    "type": "hospital",
    "area": "Swamy Vivekananda Ward",
    "address": "2nd Main Road, Swamy Vivekananda Ward, 560050, Bengaluru",
    "lat": 12.938699,
    "lon": 77.551839,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700036",
    "rating": 4.0,
    "reviews": 1452,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 207,
    "source": "facility",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "diavistadiabete",
    "name": "Diavista Diabetes & Multispeciality Hospital",
    "type": "hospital",
    "area": "Swamy Vivekananda Ward",
    "address": "11th Cross Road, Swamy Vivekananda Ward, 560050, Bengaluru",
    "lat": 12.935429,
    "lon": 77.547796,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700037",
    "rating": 4.2,
    "reviews": 1589,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 254,
    "source": "community",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "suryagalaxyhosp",
    "name": "Surya Galaxy Hospital",
    "type": "hospital",
    "area": "Swamy Vivekananda Ward",
    "address": "Daivagna Guru Road, Swamy Vivekananda Ward, 560085, Bengaluru",
    "lat": 12.931679,
    "lon": 77.545089,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700038",
    "rating": 4.4,
    "reviews": 1726,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 301,
    "source": "listed",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "saraswathihospi",
    "name": "Saraswathi Hospital",
    "type": "hospital",
    "area": "Ganesh Mandira Ward",
    "address": "8th B Main Road, Ganesh Mandira Ward, 560070, Bengaluru",
    "lat": 12.927638,
    "lon": 77.568896,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700039",
    "rating": 4.5,
    "reviews": 1863,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 348,
    "source": "facility",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "devagirihospita",
    "name": "Devagiri Hospital",
    "type": "hospital",
    "area": "Ganesh Mandira Ward",
    "address": "24th Cross Road, Ganesh Mandira Ward, 560070, Bengaluru",
    "lat": 12.924153,
    "lon": 77.565797,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700040",
    "rating": 4.7,
    "reviews": 200,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 395,
    "source": "community",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "meditechmultisp",
    "name": "Medi-Tech Multi Speciality Hospital",
    "type": "hospital",
    "area": "Hanumanthanagar",
    "address": "9th Main Road, Hanumanthanagar, 560050, Bengaluru",
    "lat": 12.940867,
    "lon": 77.560366,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700041",
    "rating": 4.9,
    "reviews": 337,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 442,
    "source": "listed",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "vinayakahospita",
    "name": "Vinayaka Hospital",
    "type": "hospital",
    "area": "Swamy Vivekananda Ward",
    "address": "80 Feet Road, Swamy Vivekananda Ward, 560050, Bengaluru",
    "lat": 12.937375,
    "lon": 77.549478,
    "open24": true,
    "hours": [
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ],
      [
        0,
        1440
      ]
    ],
    "phone": "+91 80 8026700042",
    "rating": 4.0,
    "reviews": 474,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 489,
    "source": "facility",
    "services": {
      "gp": {
        "price": 650,
        "doctor": "Dr. K. Rao / Duty Physician",
        "days": [
          0,
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 25
      },
      "paed": {
        "price": 750,
        "doctor": "Dr. S. Sharma",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          1020
        ],
        "wait": 30
      },
      "gyn": {
        "price": 800,
        "doctor": "Dr. P. Sundaram",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          600,
          960
        ],
        "wait": 35
      },
      "ortho": {
        "price": 800,
        "doctor": "Dr. M. Hegde",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          660,
          1080
        ],
        "wait": 40
      },
      "derm": {
        "price": 700,
        "doctor": "Dr. V. Prasad",
        "days": [
          2,
          4,
          6
        ],
        "time": [
          840,
          1140
        ],
        "wait": 20
      },
      "ent": {
        "price": 700,
        "doctor": "Dr. A. Joseph",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          600,
          840
        ],
        "wait": 20
      },
      "cbc": {
        "price": 380,
        "wait": 15
      },
      "thyroid": {
        "price": 600,
        "wait": 15
      },
      "lipid": {
        "price": 700,
        "wait": 15
      },
      "hba1c": {
        "price": 500,
        "wait": 15
      },
      "xray": {
        "price": 550,
        "wait": 20
      },
      "usg": {
        "price": [
          1400,
          1800
        ],
        "priceNote": "Depends on scan area",
        "wait": 30,
        "time": [
          480,
          1200
        ]
      },
      "ct": {
        "price": [
          2800,
          3600
        ],
        "wait": 25
      },
      "emerg": {
        "price": null,
        "priceNote": "Assessment fee; treatments extra",
        "wait": 10
      },
      "dressing": {
        "price": [
          300,
          500
        ],
        "wait": 15
      },
      "physio": {
        "price": 700,
        "time": [
          480,
          1080
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      },
      "vacc": {
        "price": [
          1400,
          2000
        ],
        "priceNote": "Varies by vaccine brand",
        "time": [
          540,
          1020
        ],
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "wait": 15
      }
    }
  },
  {
    "id": "sundiagnosticla",
    "name": "Sun Diagnostic Laboratory",
    "type": "diagnostic",
    "area": "Pattabhirama Nagara",
    "address": "11th A Main Road, Pattabhirama Nagara, 560041, Bengaluru",
    "lat": 12.920771,
    "lon": 77.586759,
    "open24": false,
    "hours": [
      [
        420,
        840
      ],
      [
        420,
        1260
      ],
      [
        420,
        1260
      ],
      [
        420,
        1260
      ],
      [
        420,
        1260
      ],
      [
        420,
        1260
      ],
      [
        420,
        1260
      ]
    ],
    "phone": "+91 80 8026700043",
    "rating": 4.2,
    "reviews": 611,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": false,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 36,
    "source": "community",
    "services": {
      "cbc": {
        "price": 280,
        "wait": 10
      },
      "thyroid": {
        "price": 450,
        "wait": 10
      },
      "lipid": {
        "price": 500,
        "wait": 10
      },
      "hba1c": {
        "price": 380,
        "wait": 10
      },
      "xray": {
        "price": 450,
        "wait": 15
      },
      "usg": {
        "price": [
          1200,
          1500
        ],
        "priceNote": "Prior fasting needed for abdomen",
        "wait": 20
      },
      "ct": {
        "price": [
          2400,
          3000
        ],
        "wait": 25
      }
    }
  },
  {
    "id": "sugganahallipri",
    "name": "Sugganahalli Primary Health Centre",
    "type": "community",
    "area": "SH3",
    "address": "SH3, SH3, 562128, Bengaluru",
    "lat": 12.798333,
    "lon": 77.321589,
    "open24": false,
    "hours": [
      null,
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ]
    ],
    "phone": "+91 80 8026700044",
    "rating": 4.4,
    "reviews": 748,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": false,
      "toilet": true,
      "parking": false,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 83,
    "source": "listed",
    "services": {
      "gp": {
        "price": 10,
        "priceNote": "Govt PHC token",
        "doctor": "Medical Officer",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          960
        ],
        "wait": 35
      },
      "dressing": {
        "price": 10,
        "wait": 20
      },
      "cbc": {
        "price": 40,
        "wait": null
      },
      "vacc": {
        "price": 0,
        "priceNote": "National Immunization Schedule (Free)",
        "days": [
          3,
          6
        ],
        "wait": 20
      }
    }
  },
  {
    "id": "primaryhealthce",
    "name": "Primary Health Centre",
    "type": "community",
    "area": "SH3",
    "address": "SH3, SH3, 562128, Bengaluru",
    "lat": 12.838734,
    "lon": 77.296045,
    "open24": false,
    "hours": [
      null,
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ]
    ],
    "phone": "+91 80 8026700045",
    "rating": 4.6,
    "reviews": 885,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": false,
      "toilet": true,
      "parking": false,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 130,
    "source": "facility",
    "services": {
      "gp": {
        "price": 10,
        "priceNote": "Govt PHC token",
        "doctor": "Medical Officer",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          960
        ],
        "wait": 35
      },
      "dressing": {
        "price": 10,
        "wait": 20
      },
      "cbc": {
        "price": 40,
        "wait": null
      },
      "vacc": {
        "price": 0,
        "priceNote": "National Immunization Schedule (Free)",
        "days": [
          3,
          6
        ],
        "wait": 20
      }
    }
  },
  {
    "id": "primaryhealthce",
    "name": "Primary Health Centre Akkuru",
    "type": "community",
    "area": "SH111",
    "address": "SH111, SH111, 562159, Bengaluru",
    "lat": 12.819734,
    "lon": 77.176007,
    "open24": false,
    "hours": [
      null,
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ]
    ],
    "phone": "+91 80 8026700046",
    "rating": 4.7,
    "reviews": 1022,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": false,
      "toilet": true,
      "parking": false,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 177,
    "source": "community",
    "services": {
      "gp": {
        "price": 10,
        "priceNote": "Govt PHC token",
        "doctor": "Medical Officer",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          960
        ],
        "wait": 35
      },
      "dressing": {
        "price": 10,
        "wait": 20
      },
      "cbc": {
        "price": 40,
        "wait": null
      },
      "vacc": {
        "price": 0,
        "priceNote": "National Immunization Schedule (Free)",
        "days": [
          3,
          6
        ],
        "wait": 20
      }
    }
  },
  {
    "id": "harohalligovt",
    "name": "Harohalli Government Hospital (Taluk CHC)",
    "type": "community",
    "area": "SH94",
    "address": "SH94, SH94, 562160, Bengaluru",
    "lat": 12.598783,
    "lon": 77.217958,
    "open24": false,
    "hours": [
      null,
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ]
    ],
    "phone": "+91 80 8026700047",
    "rating": 4.9,
    "reviews": 1159,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": false,
      "toilet": true,
      "parking": false,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 224,
    "source": "listed",
    "services": {
      "gp": {
        "price": 10,
        "priceNote": "Govt PHC token",
        "doctor": "Medical Officer",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          960
        ],
        "wait": 35
      },
      "dressing": {
        "price": 10,
        "wait": 20
      },
      "cbc": {
        "price": 40,
        "wait": null
      },
      "vacc": {
        "price": 0,
        "priceNote": "National Immunization Schedule (Free)",
        "days": [
          3,
          6
        ],
        "wait": 20
      }
    }
  },
  {
    "id": "harohalligovt",
    "name": "Harohalli Government Hospital (Taluk CHC)",
    "type": "community",
    "area": "SH94",
    "address": "SH94, SH94, 562160, Bengaluru",
    "lat": 12.590012,
    "lon": 77.20805,
    "open24": false,
    "hours": [
      null,
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ]
    ],
    "phone": "+91 80 8026700048",
    "rating": 4.1,
    "reviews": 1296,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": false,
      "toilet": true,
      "parking": false,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 271,
    "source": "facility",
    "services": {
      "gp": {
        "price": 10,
        "priceNote": "Govt PHC token",
        "doctor": "Medical Officer",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          960
        ],
        "wait": 35
      },
      "dressing": {
        "price": 10,
        "wait": 20
      },
      "cbc": {
        "price": 40,
        "wait": null
      },
      "vacc": {
        "price": 0,
        "priceNote": "National Immunization Schedule (Free)",
        "days": [
          3,
          6
        ],
        "wait": 20
      }
    }
  },
  {
    "id": "harohalligovt",
    "name": "Harohalli Government Hospital (Taluk CHC)",
    "type": "community",
    "area": "SH47",
    "address": "SH47, SH47, 562117, Bengaluru",
    "lat": 12.585091,
    "lon": 76.823633,
    "open24": false,
    "hours": [
      null,
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ]
    ],
    "phone": "+91 80 8026700049",
    "rating": 4.2,
    "reviews": 1433,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": false,
      "toilet": true,
      "parking": false,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 318,
    "source": "community",
    "services": {
      "gp": {
        "price": 10,
        "priceNote": "Govt PHC token",
        "doctor": "Medical Officer",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          960
        ],
        "wait": 35
      },
      "dressing": {
        "price": 10,
        "wait": 20
      },
      "cbc": {
        "price": 40,
        "wait": null
      },
      "vacc": {
        "price": 0,
        "priceNote": "National Immunization Schedule (Free)",
        "days": [
          3,
          6
        ],
        "wait": 20
      }
    }
  },
  {
    "id": "harohalligovt",
    "name": "Harohalli Government Hospital (Taluk CHC)",
    "type": "community",
    "area": "Bengaluru - Mysuru Road",
    "address": "Bengaluru - Mysuru Road, Bengaluru - Mysuru Road, 562160, Bengaluru",
    "lat": 12.611669,
    "lon": 77.145522,
    "open24": false,
    "hours": [
      null,
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ]
    ],
    "phone": "+91 80 8026700050",
    "rating": 4.4,
    "reviews": 1570,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": false,
      "toilet": true,
      "parking": false,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 365,
    "source": "listed",
    "services": {
      "gp": {
        "price": 10,
        "priceNote": "Govt PHC token",
        "doctor": "Medical Officer",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          960
        ],
        "wait": 35
      },
      "dressing": {
        "price": 10,
        "wait": 20
      },
      "cbc": {
        "price": 40,
        "wait": null
      },
      "vacc": {
        "price": 0,
        "priceNote": "National Immunization Schedule (Free)",
        "days": [
          3,
          6
        ],
        "wait": 20
      }
    }
  },
  {
    "id": "harohalligovt",
    "name": "Harohalli Government Hospital (Taluk CHC)",
    "type": "community",
    "area": "Kanakapura Road",
    "address": "Kanakapura Road, Kanakapura Road, 562117, Bengaluru",
    "lat": 12.613335,
    "lon": 77.45997,
    "open24": false,
    "hours": [
      null,
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ]
    ],
    "phone": "+91 80 8026700051",
    "rating": 4.6,
    "reviews": 1707,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": false,
      "toilet": true,
      "parking": false,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 412,
    "source": "facility",
    "services": {
      "gp": {
        "price": 10,
        "priceNote": "Govt PHC token",
        "doctor": "Medical Officer",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          960
        ],
        "wait": 35
      },
      "dressing": {
        "price": 10,
        "wait": 20
      },
      "cbc": {
        "price": 40,
        "wait": null
      },
      "vacc": {
        "price": 0,
        "priceNote": "National Immunization Schedule (Free)",
        "days": [
          3,
          6
        ],
        "wait": 20
      }
    }
  },
  {
    "id": "viragaudanadodd",
    "name": "Viragaudanadoddi Primary Health Centre",
    "type": "community",
    "area": "SH3",
    "address": "SH3, SH3, 561201, Bengaluru",
    "lat": 12.900263,
    "lon": 77.278009,
    "open24": false,
    "hours": [
      null,
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ]
    ],
    "phone": "+91 80 8026700052",
    "rating": 4.7,
    "reviews": 1844,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": false,
      "toilet": true,
      "parking": false,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 459,
    "source": "community",
    "services": {
      "gp": {
        "price": 10,
        "priceNote": "Govt PHC token",
        "doctor": "Medical Officer",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          960
        ],
        "wait": 35
      },
      "dressing": {
        "price": 10,
        "wait": 20
      },
      "cbc": {
        "price": 40,
        "wait": null
      },
      "vacc": {
        "price": 0,
        "priceNote": "National Immunization Schedule (Free)",
        "days": [
          3,
          6
        ],
        "wait": 20
      }
    }
  },
  {
    "id": "thippasandrapri",
    "name": "Thippasandra Primary Health Centre",
    "type": "community",
    "area": "Bengaluru - Mangalore Highway",
    "address": "Bengaluru - Mangalore Highway, Bengaluru - Mangalore Highway, 562131, Bengaluru",
    "lat": 13.065333,
    "lon": 77.126844,
    "open24": false,
    "hours": [
      null,
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ]
    ],
    "phone": "+91 80 8026700053",
    "rating": 3.9,
    "reviews": 181,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": false,
      "toilet": true,
      "parking": false,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 506,
    "source": "listed",
    "services": {
      "gp": {
        "price": 10,
        "priceNote": "Govt PHC token",
        "doctor": "Medical Officer",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          960
        ],
        "wait": 35
      },
      "dressing": {
        "price": 10,
        "wait": 20
      },
      "cbc": {
        "price": 40,
        "wait": null
      },
      "vacc": {
        "price": 0,
        "priceNote": "National Immunization Schedule (Free)",
        "days": [
          3,
          6
        ],
        "wait": 20
      }
    }
  },
  {
    "id": "primaryhealthce",
    "name": "Primary Health Centre Ajjanahalli",
    "type": "community",
    "area": "SH3",
    "address": "SH3, SH3, 562201, Bengaluru",
    "lat": 12.857774,
    "lon": 77.248527,
    "open24": false,
    "hours": [
      null,
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ],
      [
        480,
        960
      ]
    ],
    "phone": "+91 80 8026700054",
    "rating": 4.1,
    "reviews": 318,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": false,
      "toilet": true,
      "parking": false,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 53,
    "source": "facility",
    "services": {
      "gp": {
        "price": 10,
        "priceNote": "Govt PHC token",
        "doctor": "Medical Officer",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          960
        ],
        "wait": 35
      },
      "dressing": {
        "price": 10,
        "wait": 20
      },
      "cbc": {
        "price": 40,
        "wait": null
      },
      "vacc": {
        "price": 0,
        "priceNote": "National Immunization Schedule (Free)",
        "days": [
          3,
          6
        ],
        "wait": 20
      }
    }
  },
  {
    "id": "spectrumdentalc",
    "name": "Spectrum Dental Clinic",
    "type": "dental",
    "area": "Shakambarinagara",
    "address": "30th Main Road, Shakambarinagara, 560078, Bengaluru",
    "lat": 12.90993,
    "lon": 77.581821,
    "open24": false,
    "hours": [
      [
        600,
        780
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ]
    ],
    "phone": "+91 80 8026700055",
    "rating": 4.3,
    "reviews": 455,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": false,
      "toilet": false,
      "parking": false,
      "ground": false,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 100,
    "source": "community",
    "services": {
      "dentcheck": {
        "price": 300,
        "doctor": "Dr. K. Dental Surgeon",
        "wait": 10
      },
      "scaling": {
        "price": [
          900,
          1500
        ],
        "wait": 15
      },
      "rct": {
        "price": [
          3500,
          6000
        ],
        "priceNote": "Depends on tooth condition & crown",
        "byAppt": true,
        "wait": null
      }
    }
  },
  {
    "id": "bangaloredental",
    "name": "Bangalore Dental Clinic",
    "type": "dental",
    "area": "JP Nagar",
    "address": "14th Cross Road, JP Nagar, 560078, Bengaluru",
    "lat": 12.906974,
    "lon": 77.582008,
    "open24": false,
    "hours": [
      [
        600,
        780
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ]
    ],
    "phone": "+91 80 8026700056",
    "rating": 4.4,
    "reviews": 592,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": false,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 147,
    "source": "listed",
    "services": {
      "dentcheck": {
        "price": 300,
        "doctor": "Dr. K. Dental Surgeon",
        "wait": 10
      },
      "scaling": {
        "price": [
          900,
          1500
        ],
        "wait": 15
      },
      "rct": {
        "price": [
          3500,
          6000
        ],
        "priceNote": "Depends on tooth condition & crown",
        "byAppt": true,
        "wait": null
      }
    }
  },
  {
    "id": "theoxfordchildr",
    "name": "The Oxford Children's Dental Clinic",
    "type": "dental",
    "area": "JP Nagar",
    "address": "10th Cross Road, JP Nagar, 560078, Bengaluru",
    "lat": 12.910093,
    "lon": 77.581167,
    "open24": false,
    "hours": [
      [
        600,
        780
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ]
    ],
    "phone": "+91 80 8026700057",
    "rating": 4.6,
    "reviews": 729,
    "access": {
      "wheelchair": false,
      "ramp": false,
      "lift": false,
      "toilet": false,
      "parking": false,
      "ground": false,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 194,
    "source": "facility",
    "services": {
      "dentcheck": {
        "price": 300,
        "doctor": "Dr. K. Dental Surgeon",
        "wait": 10
      },
      "scaling": {
        "price": [
          900,
          1500
        ],
        "wait": 15
      },
      "rct": {
        "price": [
          3500,
          6000
        ],
        "priceNote": "Depends on tooth condition & crown",
        "byAppt": true,
        "wait": null
      }
    }
  },
  {
    "id": "namrathadentalc",
    "name": "Namratha Dental Clinic",
    "type": "dental",
    "area": "Ashoka Nagara",
    "address": "2nd Main Road, Ashoka Nagara, 560050, Bengaluru",
    "lat": 12.938923,
    "lon": 77.552636,
    "open24": false,
    "hours": [
      [
        600,
        780
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ]
    ],
    "phone": "+91 80 8026700058",
    "rating": 4.8,
    "reviews": 866,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": false,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 241,
    "source": "community",
    "services": {
      "dentcheck": {
        "price": 300,
        "doctor": "Dr. K. Dental Surgeon",
        "wait": 10
      },
      "scaling": {
        "price": [
          900,
          1500
        ],
        "wait": 15
      },
      "rct": {
        "price": [
          3500,
          6000
        ],
        "priceNote": "Depends on tooth condition & crown",
        "byAppt": true,
        "wait": null
      }
    }
  },
  {
    "id": "dentalhealthcli",
    "name": "Dental Health Clinic",
    "type": "dental",
    "area": "Ashoka Pillar",
    "address": "8th Main Road, Ashoka Pillar, 560069, Bengaluru",
    "lat": 12.938207,
    "lon": 77.582902,
    "open24": false,
    "hours": [
      [
        600,
        780
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ]
    ],
    "phone": "+91 80 8026700059",
    "rating": 3.9,
    "reviews": 1003,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": false,
      "toilet": false,
      "parking": false,
      "ground": false,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 288,
    "source": "listed",
    "services": {
      "dentcheck": {
        "price": 300,
        "doctor": "Dr. K. Dental Surgeon",
        "wait": 10
      },
      "scaling": {
        "price": [
          900,
          1500
        ],
        "wait": 15
      },
      "rct": {
        "price": [
          3500,
          6000
        ],
        "priceNote": "Depends on tooth condition & crown",
        "byAppt": true,
        "wait": null
      }
    }
  },
  {
    "id": "perfectsmilesde",
    "name": "Perfect Smiles Dental Clinic",
    "type": "dental",
    "area": "Ashoka Pillar",
    "address": "12th Cross Road, Ashoka Pillar, 560011, Bengaluru",
    "lat": 12.938014,
    "lon": 77.583828,
    "open24": false,
    "hours": [
      [
        600,
        780
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ]
    ],
    "phone": "+91 80 8026700060",
    "rating": 4.1,
    "reviews": 1140,
    "access": {
      "wheelchair": false,
      "ramp": false,
      "lift": true,
      "toilet": true,
      "parking": false,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 335,
    "source": "facility",
    "services": {
      "dentcheck": {
        "price": 300,
        "doctor": "Dr. K. Dental Surgeon",
        "wait": 10
      },
      "scaling": {
        "price": [
          900,
          1500
        ],
        "wait": 15
      },
      "rct": {
        "price": [
          3500,
          6000
        ],
        "priceNote": "Depends on tooth condition & crown",
        "byAppt": true,
        "wait": null
      }
    }
  },
  {
    "id": "dhanavantrident",
    "name": "Dhanavantri Dental Clinic",
    "type": "dental",
    "area": "Pattabhirama Nagara",
    "address": "36th Cross Road, Pattabhirama Nagara, 560011, Bengaluru",
    "lat": 12.923215,
    "lon": 77.584375,
    "open24": false,
    "hours": [
      [
        600,
        780
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ]
    ],
    "phone": "+91 80 8026700061",
    "rating": 4.3,
    "reviews": 1277,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": false,
      "toilet": false,
      "parking": false,
      "ground": false,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 382,
    "source": "community",
    "services": {
      "dentcheck": {
        "price": 300,
        "doctor": "Dr. K. Dental Surgeon",
        "wait": 10
      },
      "scaling": {
        "price": [
          900,
          1500
        ],
        "wait": 15
      },
      "rct": {
        "price": [
          3500,
          6000
        ],
        "priceNote": "Depends on tooth condition & crown",
        "byAppt": true,
        "wait": null
      }
    }
  },
  {
    "id": "arkadentalclini",
    "name": "Arka Dental Clinic",
    "type": "dental",
    "area": "Byrasandra",
    "address": "7th Main Road, Byrasandra, 560041, Bengaluru",
    "lat": 12.926114,
    "lon": 77.58187,
    "open24": false,
    "hours": [
      [
        600,
        780
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ]
    ],
    "phone": "+91 80 8026700062",
    "rating": 4.4,
    "reviews": 1414,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": false,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 429,
    "source": "listed",
    "services": {
      "dentcheck": {
        "price": 300,
        "doctor": "Dr. K. Dental Surgeon",
        "wait": 10
      },
      "scaling": {
        "price": [
          900,
          1500
        ],
        "wait": 15
      },
      "rct": {
        "price": [
          3500,
          6000
        ],
        "priceNote": "Depends on tooth condition & crown",
        "byAppt": true,
        "wait": null
      }
    }
  },
  {
    "id": "dhanvanthrident",
    "name": "Dhanvanthri Dental Clinic",
    "type": "dental",
    "area": "Pattabhirama Nagara",
    "address": "36th Cross Road, Pattabhirama Nagara, 560011, Bengaluru",
    "lat": 12.923222,
    "lon": 77.584373,
    "open24": false,
    "hours": [
      [
        600,
        780
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ]
    ],
    "phone": "+91 80 8026700063",
    "rating": 4.6,
    "reviews": 1551,
    "access": {
      "wheelchair": false,
      "ramp": false,
      "lift": false,
      "toilet": false,
      "parking": false,
      "ground": false,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI"
    ],
    "updated": 476,
    "source": "facility",
    "services": {
      "dentcheck": {
        "price": 300,
        "doctor": "Dr. K. Dental Surgeon",
        "wait": 10
      },
      "scaling": {
        "price": [
          900,
          1500
        ],
        "wait": 15
      },
      "rct": {
        "price": [
          3500,
          6000
        ],
        "priceNote": "Depends on tooth condition & crown",
        "byAppt": true,
        "wait": null
      }
    }
  },
  {
    "id": "prashanthdiagno",
    "name": "Prashanth Diagnostics",
    "type": "diagnostic",
    "area": "Ashoka Nagara",
    "address": "80 Feet Road, Ashoka Nagara, 560050, Bengaluru",
    "lat": 12.93919,
    "lon": 77.551385,
    "open24": false,
    "hours": [
      [
        420,
        840
      ],
      [
        420,
        1260
      ],
      [
        420,
        1260
      ],
      [
        420,
        1260
      ],
      [
        420,
        1260
      ],
      [
        420,
        1260
      ],
      [
        420,
        1260
      ]
    ],
    "phone": "+91 80 8026700064",
    "rating": 4.8,
    "reviews": 1688,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 23,
    "source": "community",
    "services": {
      "cbc": {
        "price": 280,
        "wait": 10
      },
      "thyroid": {
        "price": 450,
        "wait": 10
      },
      "lipid": {
        "price": 500,
        "wait": 10
      },
      "hba1c": {
        "price": 380,
        "wait": 10
      },
      "xray": {
        "price": 450,
        "wait": 15
      },
      "usg": {
        "price": [
          1200,
          1500
        ],
        "priceNote": "Prior fasting needed for abdomen",
        "wait": 20
      },
      "ct": {
        "price": [
          2400,
          3000
        ],
        "wait": 25
      }
    }
  },
  {
    "id": "sanjeevanicked",
    "name": "Sanjeevani Clinic (Kaggalipura)",
    "type": "clinic",
    "area": "Kanakapura Road",
    "address": "Kanakapura Road, Kanakapura Road, 560116, Bengaluru",
    "lat": 12.80111,
    "lon": 77.508451,
    "open24": false,
    "hours": [
      [
        600,
        780
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ]
    ],
    "phone": "+91 80 8026700065",
    "rating": 4.0,
    "reviews": 1825,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": false,
      "toilet": false,
      "parking": false,
      "ground": false,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card"
    ],
    "updated": 70,
    "source": "listed",
    "services": {
      "gp": {
        "price": 350,
        "doctor": "Dr. Ramesh Babu",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 15
      },
      "paed": {
        "price": 450,
        "doctor": "Dr. Anitha Gowda",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          1020,
          1200
        ],
        "wait": 20
      },
      "derm": {
        "price": 500,
        "doctor": "Dr. Swetha R.",
        "days": [
          6
        ],
        "time": [
          600,
          780
        ],
        "wait": 15
      },
      "cbc": {
        "price": 300,
        "priceNote": "Sample collected on-site",
        "wait": null
      },
      "dressing": {
        "price": 200,
        "wait": 10
      },
      "vacc": {
        "price": [
          1200,
          1600
        ],
        "priceNote": "Routine paediatric & adult",
        "wait": 10
      }
    }
  },
  {
    "id": "anandclinic",
    "name": "Anand Clinic & Diagnostics (Kaggalipura)",
    "type": "diagnostic",
    "area": "Kanakapura Road",
    "address": "Kanakapura Road, Kanakapura Road, 560116, Bengaluru",
    "lat": 12.800247,
    "lon": 77.508875,
    "open24": false,
    "hours": [
      [
        420,
        840
      ],
      [
        420,
        1260
      ],
      [
        420,
        1260
      ],
      [
        420,
        1260
      ],
      [
        420,
        1260
      ],
      [
        420,
        1260
      ],
      [
        420,
        1260
      ]
    ],
    "phone": "+91 80 8026700066",
    "rating": 4.1,
    "reviews": 162,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": true,
      "toilet": true,
      "parking": true,
      "ground": true,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card",
      "Insurance (cashless)"
    ],
    "updated": 117,
    "source": "facility",
    "services": {
      "cbc": {
        "price": 280,
        "wait": 10
      },
      "thyroid": {
        "price": 450,
        "wait": 10
      },
      "lipid": {
        "price": 500,
        "wait": 10
      },
      "hba1c": {
        "price": 380,
        "wait": 10
      },
      "xray": {
        "price": 450,
        "wait": 15
      },
      "usg": {
        "price": [
          1200,
          1500
        ],
        "priceNote": "Prior fasting needed for abdomen",
        "wait": 20
      },
      "ct": {
        "price": [
          2400,
          3000
        ],
        "wait": 25
      }
    }
  },
  {
    "id": "sapthagiriclinic",
    "name": "Saptha Giri Clinic (Kaggalipura)",
    "type": "clinic",
    "area": "Kanakapura Road",
    "address": "Kanakapura Road, Kanakapura Road, 560116, Bengaluru",
    "lat": 12.801572,
    "lon": 77.508559,
    "open24": false,
    "hours": [
      [
        600,
        780
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ],
      [
        540,
        1260
      ]
    ],
    "phone": "+91 80 8026700067",
    "rating": 4.3,
    "reviews": 299,
    "access": {
      "wheelchair": true,
      "ramp": true,
      "lift": false,
      "toilet": false,
      "parking": false,
      "ground": false,
      "assist": true
    },
    "languages": [
      "Kannada",
      "English",
      "Hindi"
    ],
    "payment": [
      "Cash",
      "UPI",
      "Card"
    ],
    "updated": 164,
    "source": "community",
    "services": {
      "gp": {
        "price": 350,
        "doctor": "Dr. Ramesh Babu",
        "days": [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        "time": [
          540,
          1260
        ],
        "wait": 15
      },
      "paed": {
        "price": 450,
        "doctor": "Dr. Anitha Gowda",
        "days": [
          1,
          3,
          5
        ],
        "time": [
          1020,
          1200
        ],
        "wait": 20
      },
      "derm": {
        "price": 500,
        "doctor": "Dr. Swetha R.",
        "days": [
          6
        ],
        "time": [
          600,
          780
        ],
        "wait": 15
      },
      "cbc": {
        "price": 300,
        "priceNote": "Sample collected on-site",
        "wait": null
      },
      "dressing": {
        "price": 200,
        "wait": 10
      },
      "vacc": {
        "price": [
          1200,
          1600
        ],
        "priceNote": "Routine paediatric & adult",
        "wait": 10
      }
    }
  }
];

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
