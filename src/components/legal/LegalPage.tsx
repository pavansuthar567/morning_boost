"use client";

import React from "react";

type LegalSection = {
  title: string;
  body: string[];
  bullets?: string[];
};

interface LegalPageProps {
  eyebrow?: string;
  title: string;
  description: string;
  updatedAt?: string;
  sections: LegalSection[];
}

const LegalPage: React.FC<LegalPageProps> = ({
  eyebrow,
  title,
  description,
  updatedAt,
  sections,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <header className="px-4 py-12 mx-auto max-w-5xl text-center sm:px-6 lg:px-8">
        <div className="inline-flex flex-col items-center justify-center gap-3 mb-8">
          <div className="flex items-center gap-2 px-5 py-2 rounded-full border border-brand-100 bg-white shadow-sm dark:border-brand-900/40 dark:bg-gray-900/40">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-500 text-white text-lg font-semibold">
              N
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold tracking-wide text-brand-600 dark:text-brand-400">
                NiftySwift
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Virtual Trading Suite
              </p>
            </div>
          </div>
          <div className="h-1 w-12 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-80"></div>
        </div>
        {eyebrow && (
          <p className="mb-2 text-sm font-semibold tracking-wide text-brand-500 uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl dark:text-white/90">
          {title}
        </h1>
        <p className="max-w-3xl mx-auto mt-4 text-base text-gray-600 dark:text-gray-400">
          {description}
        </p>
        {updatedAt && (
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">
            Last updated: {updatedAt}
          </p>
        )}
      </header>

      <main className="px-4 pb-16 mx-auto max-w-4xl sm:px-6 lg:px-8">
        <div className="space-y-8">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-gray-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/50"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white/90">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {section.body.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}

                {section.bullets && (
                  <ul className="space-y-2 list-disc list-inside">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default LegalPage;

