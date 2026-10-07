"use client";
import { useEffect, useId, useState } from "react";
import { pakistanProvinces } from "../_data/pakistan-regions";
import CustomSelect from "./CustomSelect";
import CityCombobox from "./CityCombobox";
export default function CheckoutCity({
  province,
  city,
  onProvinceChange,
  onCityChange,
  disabled,
}: {
  province: string;
  city: string;
  onProvinceChange: (value: string) => void;
  onCityChange: (value: string) => void;
  disabled: boolean;
}) {
  const listId = useId();
  const [cities, setCities] = useState<Record<string, string[]>>({});
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/data/pakistan-cities.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Unavailable");
        return response.json();
      })
      .then(setCities)
      .catch(() => {
        if (!controller.signal.aborted) setLoadError(true);
      });
    return () => controller.abort();
  }, []);
  const names = cities[province] ?? [];
  const search = city.trim().toLowerCase();
  const suggestions = names
    .filter((name) => name.toLowerCase().startsWith(search))
    .slice(0, 100);
  return (
    <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
      <div>
        <label
          htmlFor={listId}
          className="mb-2 block text-xs font-medium text-black/65"
        >
          Province / territory
        </label>
        <CustomSelect
          id={listId}
          label="Province / territory"
          name="province"
          value={province}
          disabled={disabled}
          placeholder="Choose your province / territory"
          onChange={(value) => {
            onProvinceChange(value);
            onCityChange("");
          }}
          options={pakistanProvinces.map((value) => ({ value, label: value }))}
        />
      </div>
      <CityCombobox
        key={province}
        value={city}
        onChange={onCityChange}
        suggestions={suggestions}
        disabled={disabled || !province}
        help={
          loadError
            ? "City suggestions are unavailable. Enter your city manually."
            : ""
        }
      />
    </div>
  );
}
