"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { FiX } from "react-icons/fi";
export default function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => { const dialog = ref.current; const previous = document.body.style.overflow; document.body.style.overflow = "hidden"; dialog?.showModal(); return () => { dialog?.close(); document.body.style.overflow = previous; }; }, []);
  return <dialog ref={ref} aria-labelledby={titleId} onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-3xl border border-black/10 bg-[#F4F1E9] p-0 text-[#20211e] shadow-2xl backdrop:bg-black/45 backdrop:backdrop-blur-sm" data-lenis-prevent><div className="flex items-center justify-between gap-4 border-b border-black/10 px-6 py-5"><h2 id={titleId} className="text-2xl font-medium">{title}</h2><button type="button" aria-label="Close dialog" onClick={onClose} className="rounded-full border border-black/10 p-2 hover:bg-[#E9E2D7]"><FiX /></button></div><div className="p-6">{children}</div></dialog>;
}
