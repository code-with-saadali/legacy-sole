"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { FiCheck, FiChevronDown, FiMapPin } from "react-icons/fi";

export default function CityCombobox({
  value,
  onChange,
  suggestions,
  disabled,
  help,
}: {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  disabled: boolean;
  help: string;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const expanded = open && !disabled;
  const custom =
    value.trim() &&
    !suggestions.some(
      (city) => city.toLowerCase() === value.trim().toLowerCase(),
    );
  const options = custom ? [...suggestions, value.trim()] : suggestions;
  const choose = (index: number) => {
    const city = options[index];
    if (!city) return;
    onChange(city);
    setOpen(false);
    setActive(-1);
    input.current?.focus();
  };
  useEffect(() => {
    if (!expanded) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [expanded]);
  useEffect(() => {
    if (expanded && active >= 0)
      list.current
        ?.querySelector(`[data-index="${active}"]`)
        ?.scrollIntoView({ block: "nearest" });
  }, [active, expanded]);
  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActive((index) =>
        options.length
          ? (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) %
            options.length
          : -1,
      );
    } else if (event.key === "Enter" && expanded) {
      event.preventDefault();
      if (active >= 0 && active < options.length) choose(active);
      else setOpen(false);
    } else if (event.key === "Escape") {
      if (expanded) {
        event.preventDefault();
        event.stopPropagation();
      }
      setOpen(false);
      setActive(-1);
    } else if (event.key === "Tab") setOpen(false);
  };
  return (
    <div
      ref={root}
      className="relative min-w-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <label htmlFor={id} className="block text-xs font-medium text-black/65">
        Delivery city / town
      </label>
      <div className="relative mt-2">
        <input
          ref={input}
          id={id}
          name="city"
          required
          maxLength={80}
          value={value}
          disabled={disabled}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={`${id}-options`}
          aria-describedby={help ? `${id}-help` : undefined}
          aria-activedescendant={
            expanded && active >= 0 && active < options.length
              ? `${id}-option-${active}`
              : undefined
          }
          placeholder="Search or enter your city"
          onKeyDown={keyDown}
          onClick={() => {
            setOpen(true);
            setActive(-1);
          }}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
            setActive(-1);
          }}
          className="min-h-11 w-full rounded-xl border border-black/15 bg-[#F8F6F1] py-3 pl-4 pr-12 text-sm text-[#20211e] outline-none transition hover:border-[#b66b4d] focus:ring-2 focus:ring-[#b66b4d]/50 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="button"
          aria-label={
            expanded ? "Close city suggestions" : "Show city suggestions"
          }
          aria-expanded={expanded}
          aria-controls={`${id}-options`}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setOpen(!expanded);
            setActive(-1);
            input.current?.focus();
          }}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-black/50 focus-visible:outline-2 focus-visible:outline-[#b66b4d] disabled:opacity-50"
        >
          <FiChevronDown
            aria-hidden
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {expanded && (
        <div className="absolute inset-x-0 top-[74px] z-40 overflow-hidden rounded-2xl border border-black/10 bg-[#F8F6F1] shadow-[0_16px_50px_#0002]">
          <div
            ref={list}
            id={`${id}-options`}
            role="listbox"
            aria-label="Delivery city suggestions"
            data-lenis-prevent
            className="max-h-64 overflow-y-auto overscroll-contain p-1.5"
          >
            {options.map((city, index) => (
              <div
                key={city}
                id={`${id}-option-${index}`}
                data-index={index}
                role="option"
                aria-selected={value === city}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => choose(index)}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#20211e] hover:bg-[#E9E2D7] ${active === index ? "bg-[#E9E2D7]" : ""}`}
              >
                <FiMapPin aria-hidden className="shrink-0 text-black/35" />
                <span className="min-w-0 flex-1 break-words">
                  {custom && index === suggestions.length
                    ? `Use “${city}”`
                    : city}
                </span>
                {value === city && (
                  <FiCheck aria-hidden className="shrink-0 text-[#4b5a42]" />
                )}
              </div>
            ))}
            {!options.length && (
              <p className="px-3 py-4 text-sm text-black/50">
                Type your city name to continue.
              </p>
            )}
          </div>
          {suggestions.length === 100 && (
            <p className="border-t border-black/10 px-4 py-2 text-[11px] text-black/50">
              Keep typing to narrow the results.
            </p>
          )}
        </div>
      )}
      {help && (
        <p id={`${id}-help`} className="mt-2 text-[11px] leading-5 text-black/50">
          {help}
        </p>
      )}
    </div>
  );
}
