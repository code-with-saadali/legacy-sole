"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";

const questions = [
  {
    question: "Where should I start?",
    answer:
      "Start with your everyday wardrobe. Court Classic works with simple, relaxed outfits. Aero Runner brings a sportier shape, while Shadow Runner keeps the palette dark and understated.",
  },
  {
    question: "Are the styles unisex?",
    answer:
      "Yes. The current collection is presented as unisex. Choose the silhouette and colour you like, then check the fit before making a purchase.",
  },
  {
    question: "How do I choose a size?",
    answer:
      "Measure both feet while standing, wearing the socks you normally use. Use the longer foot as your reference, and check the specific shoe's size information when ordering. Fit can vary between styles.",
  },
  {
    question: "Can I place an order on this website?",
    answer:
      "This page currently showcases the collection. Online ordering and checkout are not available yet.",
  },
  {
    question: "How do I keep my pair looking fresh?",
    answer:
      "Brush away dry dust, spot clean gently with a damp cloth, and let your shoes air dry away from direct heat. You can find more tips in the shoe-care section below.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="questions"
      aria-labelledby="faq-title"
      className="grid scroll-mt-28 gap-10 px-[5%] py-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24 lg:py-24"
    >
      <div>
        <p className="text-[10px] tracking-[0.2em] text-[#76776e]">
          A FEW THINGS TO KNOW
        </p>

        <h2
          id="faq-title"
          className="mt-5 text-4xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl"
        >
          Before you
          <br />
          <span className="font-serif italic">step out.</span>
        </h2>

        <p className="mt-5 max-w-64 text-sm leading-7 text-[#76776e]">
          A little guidance for finding and looking after your next favourite
          pair.
        </p>
      </div>

      <div className="border-t border-black/10">
        {questions.map(({ question, answer }, index) => {
          const isOpen = openIndex === index;

          return (
            <div key={question} className="border-b border-black/10">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center gap-4 py-6 text-left text-sm font-medium"
              >
                <span className="text-[10px] font-normal text-[#76776e]">
                  0{index + 1}
                </span>

                <span className="flex-1">{question}</span>

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 transition-colors duration-300 hover:bg-black hover:text-white">
                  <FiPlus
                    size={16}
                    className={`transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isOpen ? "rotate-45" : "rotate-0"
                    }`}
                  />
                </span>
              </button>

              <div
                className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              >
                <div className="overflow-hidden">
                  <p
                    className={`max-w-xl pl-8 pr-12 text-sm leading-7 text-[#76776e] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? "pb-6 opacity-100 translate-y-0" : "pb-0 opacity-0 -translate-y-2"}`}
                  >
                    {answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
