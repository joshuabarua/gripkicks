"use client";

import React from "react";

interface EditorialContentProps {
  sectionNumber: string;
  asideContent: string;
  heading: string;
  description: string;
  ink: string;
  paper: string;
}

export function EditorialContent({ sectionNumber, asideContent, heading, description, ink, paper }: EditorialContentProps) {
  return (
    <section className="relative px-6 md:px-16 py-20" style={{ background: paper }}>
      <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-10">
        <aside className="md:col-span-3 space-y-2 font-mono text-[10px] uppercase tracking-widest">
          <div>§ {sectionNumber}</div>
          <div className="pt-4">{asideContent}</div>
        </aside>

        <div className="md:col-span-9 space-y-6">
          <h1 className="font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight italic">
            {heading}
          </h1>

          <div className="h-px w-24" style={{ background: ink }} />

          <p className="font-mono text-xs leading-relaxed max-w-lg">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
