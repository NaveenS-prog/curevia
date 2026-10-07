import urllib.request
import urllib.parse
import json
import time

queries = [
    'hospital near Kanakapura Road Bengaluru',
    'clinic near Kanakapura Road Bengaluru',
    'hospital near Jayanagar Bengaluru',
    'diagnostics Bengaluru',
    'hospital Harohalli Ramanagara',
    'eye hospital Bengaluru',
    'dental clinic Kanakapura Road Bengaluru'
]

seen_names = set()
results = []

for q in queries:
    url = f"https://nominatim.openstreetmap.org/search?format=json&q={urllib.parse.quote(q)}&limit=15&addressdetails=1"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "CureviaHealthcareStudentProject/1.0 (academic research)"}
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            print(f"Query: {q} -> Found: {len(data)}")
            for item in data:
                name = item.get("display_name", "").split(",")[0].strip()
                if name and name not in seen_names:
                    seen_names.add(name)
                    results.append(item)
    except Exception as e:
        print(f"Error for {q}: {e}")
    time.sleep(1) # Nominatim policy: 1 req/sec

print(f"\nTotal unique real places found: {len(results)}")
for r in results[:15]:
    name = r.get("display_name", "").split(",")[0].strip()
    addr = r.get("address", {})
    area = addr.get("suburb") or addr.get("neighbourhood") or addr.get("road") or addr.get("city_district") or "Bengaluru"
    print(f"- {name} [{r.get('type')}] ({r.get('lat')}, {r.get('lon')}) - {area}")
