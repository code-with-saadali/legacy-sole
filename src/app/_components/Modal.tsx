"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { FiX } from "react-icons/fi";
export default function Modal({
  title,
  onClose,
  children,
  variant = "default",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  variant?: "default" | "image";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = previous;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={`fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] rounded-3xl border border-black/10 p-0 text-[#20211e] shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm ${variant === "image" ? "max-w-5xl overflow-hidden bg-white" : "max-w-2xl overflow-y-auto bg-[#F4F1E9]"}`}
      data-lenis-prevent
    >
      <div className="flex items-center justify-between gap-4 border-b border-black/10 px-5 py-4">
        <h2
          id={titleId}
          className={
            variant === "image"
              ? "truncate text-base font-medium"
              : "text-2xl font-medium"
          }
        >
          {title}
        </h2>
        <button
          type="button"
          aria-label="Close dialog"
          onClick={onClose}
          className="shrink-0 rounded-full border border-black/10 p-2 hover:bg-[#E9E2D7]"
        >
          <FiX />
        </button>
      </div>
      <div className={variant === "image" ? "overflow-hidden" : "p-6"}>
        {children}
      </div>
    </dialog>
  );
}
