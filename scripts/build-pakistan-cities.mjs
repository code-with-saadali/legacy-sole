// Source: https://download.geonames.org/export/dump/PK.zip (GeoNames CC BY 4.0).
// Usage: node scripts/build-pakistan-cities.mjs path/to/PK.txt
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const regions = {
  "02": "Balochistan",
  "03": "Khyber Pakhtunkhwa",
  "04": "Punjab",
  "05": "Sindh",
  "06": "Azad Jammu and Kashmir",
  "07": "Gilgit-Baltistan",
  "08": "Islamabad Capital Territory",
};
const cities = Object.fromEntries(
  Object.values(regions).map((name) => [name, new Set()]),
);
for (const line of readFileSync(process.argv[2], "utf8").split("\n")) {
  const fields = line.split("\t");
  if (fields[8] !== "PK" || !/^PPL(?:A[1-5]?|C|G)?$/.test(fields[7])) continue;
  const province = regions[fields[10]];
  const name = (fields[2] || fields[1]).trim();
  if (province && name) cities[province].add(name);
}
for (const [province, names] of Object.entries({
  Punjab: [
    "Lahore",
    "Rawalpindi",
    "Faisalabad",
    "Multan",
    "Sialkot",
    "Gujranwala",
    "Bahawalpur",
    "Sargodha",
  ],
  Sindh: ["Karachi", "Hyderabad", "Sukkur"],
  Balochistan: ["Quetta"],
  "Khyber Pakhtunkhwa": ["Peshawar", "Abbottabad"],
  "Islamabad Capital Territory": ["Islamabad"],
  "Azad Jammu and Kashmir": ["Muzaffarabad", "Mirpur"],
  "Gilgit-Baltistan": ["Gilgit", "Skardu"],
})) {
  names.forEach((name) => cities[province].add(name));
}
const output = Object.fromEntries(
  Object.entries(cities).map(([province, values]) => [
    province,
    [...values].sort((a, b) => a.localeCompare(b, "en")),
  ]),
);
mkdirSync("public/data", { recursive: true });
writeFileSync("public/data/pakistan-cities.json", JSON.stringify(output));
console.log(
  Object.fromEntries(
    Object.entries(output).map(([province, values]) => [
      province,
      values.length,
    ]),
  ),
);
