"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { FiCheck } from "react-icons/fi";
import { FaAngleDown } from "react-icons/fa";

export type SelectOption = { value: string; label: string; disabled?: boolean };
type Props = {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export default function CustomSelect({
  id,
  name,
  value,
  onChange,
  options,
  label,
  placeholder = "Choose an option",
  disabled = false,
  className = "",
}: Props) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const typed = useRef({ text: "", time: 0 });
  const selected = options.find((option) => option.value === value);
  useEffect(() => {
    if (!open || disabled) return;
    const position = () => {
      const rect = button.current?.getBoundingClientRect();
      const list = menu.current;
      if (!rect || !list) return;
      const below = window.innerHeight - rect.bottom - 12;
      const above =
        below < Math.min(280, options.length * 44 + 12) && rect.top > below;
      const width = Math.min(Math.max(rect.width, 180), window.innerWidth - 24);
      Object.assign(list.style, {
        width: `${width}px`,
        left: `${Math.max(12, Math.min(rect.left, window.innerWidth - width - 12))}px`,
        top: above ? "auto" : `${rect.bottom + 6}px`,
        bottom: above ? `${window.innerHeight - rect.top + 6}px` : "auto",
        maxHeight: `${Math.min(280, Math.max(80, above ? rect.top - 12 : below))}px`,
      });
    };
    position();
    menu.current?.showPopover?.();
    const outside = (event: PointerEvent) => {
      if (
        !button.current?.contains(event.target as Node) &&
        !menu.current?.contains(event.target as Node)
      )
        setOpen(false);
    };
    const scroll = (event: Event) => {
      if (!menu.current?.contains(event.target as Node)) position();
    };
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", scroll, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", scroll, true);
    };
  }, [open, disabled, options.length]);
  useEffect(() => {
    if (open)
      menu.current
        ?.querySelector(`[data-index="${active}"]`)
        ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);
  const choose = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    setOpen(false);
    button.current?.focus();
  };
  const show = () => {
    setActive(
      Math.max(
        0,
        options.findIndex(
          (option) => option.value === value && !option.disabled,
        ),
      ),
    );
    setOpen(true);
  };
  const keyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (event.key === "Escape") {
      if (open) event.stopPropagation();
      setOpen(false);
      return;
    }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      if (!open) {
        show();
        return;
      }
      const direction = event.key === "ArrowUp" || event.key === "End" ? -1 : 1;
      let next =
        event.key === "Home"
          ? -1
          : event.key === "End"
            ? options.length
            : active;
      for (let count = 0; count < options.length; count++) {
        next = (next + direction + options.length) % options.length;
        if (!options[next].disabled) {
          setActive(next);
          break;
        }
      }
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) choose(active);
      else show();
    } else if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      const now = Date.now();
      typed.current = {
        text:
          (now - typed.current.time < 700 ? typed.current.text : "") +
          event.key.toLowerCase(),
        time: now,
      };
      const index = options.findIndex(
        (option) =>
          !option.disabled &&
          option.label.toLowerCase().startsWith(typed.current.text),
      );
      if (index >= 0) {
        setActive(index);
        setOpen(true);
      }
    }
  };
  return (
    <div className={`relative min-w-0 ${className}`}>
      {name && (
        <input type="hidden" name={name} value={value} disabled={disabled} />
      )}
      <button
        ref={button}
        id={controlId}
        type="button"
        role="combobox"
        aria-label={label}
        aria-expanded={open && !disabled}
        aria-controls={`${controlId}-options`}
        aria-haspopup="listbox"
        aria-activedescendant={
          open ? `${controlId}-option-${active}` : undefined
        }
        disabled={disabled}
        onKeyDown={keyDown}
        onBlur={(event) => {
          if (!menu.current?.contains(event.relatedTarget)) setOpen(false);
        }}
        onClick={() => (open ? setOpen(false) : show())}
        className="custom-select-trigger flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-black/15 bg-[#F8F6F1] px-4 py-3 text-left text-sm font-normal normal-case tracking-normal text-[#20211e] outline-none transition hover:border-[#b66b4d] focus-visible:ring-2 focus-visible:ring-[#b66b4d]/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <FaAngleDown
          aria-hidden
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && !disabled && (
        <div
          ref={menu}
          popover="manual"
          role="listbox"
          id={`${controlId}-options`}
          aria-label={label}
          data-lenis-prevent
          className="fixed z-[300] m-0 overflow-y-auto overscroll-contain rounded-2xl border border-black/10 bg-[#F8F6F1] p-1.5 text-[#20211e] shadow-[0_16px_50px_#0002]"
        >
          {options.length ? (
            options.map((option, index) => (
              <div
                key={option.value}
                id={`${controlId}-option-${index}`}
                data-index={index}
                role="option"
                aria-selected={value === option.value}
                aria-disabled={option.disabled}
                onPointerDown={(event) => event.preventDefault()}
                onPointerMove={() => !option.disabled && setActive(index)}
                onClick={() => choose(index)}
                className={`flex min-h-10 cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-sm normal-case tracking-normal ${active === index ? "bg-[#E9E2D7]" : ""} ${option.disabled ? "cursor-not-allowed opacity-40" : ""}`}
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <FiCheck aria-hidden className="shrink-0 text-[#4b5a42]" />
                )}
              </div>
            ))
          ) : (
            <p className="p-3 text-sm text-black/50">No options available</p>
          )}
        </div>
      )}
    </div>
  );
}
