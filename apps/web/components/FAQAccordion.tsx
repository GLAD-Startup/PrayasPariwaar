"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Is my donation tax-deductible under Indian law?",
    answer:
      "Yes. Prayas Pariwaar is registered under Section 12A and Section 80G of the Income Tax Act. All donations are eligible for 50% tax deduction. You will receive an official 80G tax receipt within 48 hours of your confirmed donation via email.",
  },
  {
    question: "How do I know my money actually reached the child?",
    answer:
      "Every student sponsor receives quarterly academic report cards, attendance records, and handwritten thank-you letters from the child they support. We also send annual field photographs showing the student's progress and school activities.",
  },
  {
    question: "Can I visit the study centers or field operations in Vrindavan?",
    answer:
      "Absolutely. We encourage donors and supporters to visit our evening study centers, plantation sites, and medical equipment bank in Vrindavan. Please contact our office at +91 94122 79000 to schedule a visit, and our field coordinator will personally guide you.",
  },
  {
    question: "What is your administrative overhead?",
    answer:
      "Zero. 100% of public donations reach direct beneficiaries — students, patients, and plantation drives. All administrative and operational costs are covered separately by our founding members and local volunteers. This is independently verified by our chartered accountant's annual audit.",
  },
  {
    question: "How can I borrow free medical equipment for a family member?",
    answer:
      "Visit our Medical Equipment Bank page or call +91 94122 79000. We provide free temporary home loans of 10-litre oxygen concentrators, adjustable hospital beds, wheelchairs, BiPAP machines, and patient monitors. You only need to provide a valid ID and a refundable security deposit that is returned when the equipment is returned.",
  },
  {
    question: "Can my company partner with Prayas under CSR?",
    answer:
      "Yes. We welcome corporate CSR partnerships for education sponsorship, medical equipment sponsorship, tree plantation drives, and employee volunteering programs. Please fill out our Corporate Partnership Inquiry form or email us at info@prayaspariwaar.com with your company's CSR objectives.",
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-3">
      {faqItems.map((item, idx) => (
        <div
          key={idx}
          className="border border-prayas-rule bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-card transition-shadow"
        >
          <button
            onClick={() => toggle(idx)}
            className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-prayas-neem"
          >
            <span className="font-serif text-sm sm:text-base font-bold text-prayas-ink pr-4 leading-snug">
              {item.question}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-prayas-muted shrink-0 faq-chevron ${openIndex === idx ? "open" : ""}`}
            />
          </button>
          <div className={`faq-answer px-5 ${openIndex === idx ? "open" : ""}`}>
            <p className="text-xs sm:text-sm text-prayas-muted leading-relaxed border-t border-prayas-rule pt-3">
              {item.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
