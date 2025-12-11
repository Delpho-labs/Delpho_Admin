import React from "react";
import type { SectionProps } from "../types";

const Section: React.FC<SectionProps> = ({ title, subtitle, children }) => (
  <section className="rounded-3xl border border-white/5 bg-[#0B1212] px-6 py-5 shadow-[0_15px_80px_-35px_rgba(0,0,0,0.45)]">
    <header className="mb-4">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {subtitle && <p className="text-xs text-[#9BB5AE]">{subtitle}</p>}
    </header>
    {children}
  </section>
);

export default Section;

