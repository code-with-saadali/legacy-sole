import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const cities = JSON.parse(readFileSync("public/data/pakistan-cities.json", "utf8"));
test("city data covers all seven regions with major cities and unique names", () => {
  const examples = { Punjab: "Lahore", Sindh: "Karachi", Balochistan: "Quetta", "Khyber Pakhtunkhwa": "Peshawar", "Islamabad Capital Territory": "Islamabad", "Azad Jammu and Kashmir": "Muzaffarabad", "Gilgit-Baltistan": "Skardu" };
  assert.deepEqual(Object.keys(cities).sort(), Object.keys(examples).sort());
  for (const [region, example] of Object.entries(examples)) {
    assert.ok(cities[region].includes(example));
    assert.equal(new Set(cities[region]).size, cities[region].length);
    assert.ok(cities[region].every(name => typeof name === "string" && name.trim()));
  }
  assert.ok(Object.values(cities).flat().length > 100000);
});

const exports = {};
const source = ts.transpileModule(readFileSync("src/app/_data/order-document.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
vm.runInNewContext(source, { exports, require: createRequire(import.meta.url) });
const order = { id: "test", createdAt: "2026-10-07T00:00:00Z", status: "Pending", customer: { name: "Customer", email: "customer@example.invalid", phone: "03000000000", address: "Test street", city: "Lahore", postalCode: "54000" }, items: [], total: 0 };
test("invoice and packing slip retain province and escape supplied address", () => {
  for (const kind of ["invoice", "packing"]) {
    const html = exports.orderDocument({ ...order, customer: { ...order.customer, province: "Punjab <script>" } }, kind);
    assert.ok(html.includes("Lahore, Punjab &lt;script&gt;, 54000"));
    assert.ok(!html.includes("<script>"));
  }
});
test("older orders without a province still print their address", () => {
  const html = exports.orderDocument(order, "invoice");
  assert.ok(html.includes("Lahore, 54000"));
  assert.ok(!html.includes("undefined"));
});
