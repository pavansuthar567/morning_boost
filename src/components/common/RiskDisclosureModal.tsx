"use client";
import React, { useState, useEffect } from "react";

const RISK_DISCLOSURE_KEY = "niftyswift_risk_accepted";

export default function RiskDisclosureModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    // Check if already accepted in this session
    const isAccepted = localStorage.getItem(RISK_DISCLOSURE_KEY);
    if (!isAccepted) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    if (!accepted) return;
    localStorage.setItem(RISK_DISCLOSURE_KEY, "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-red-50 dark:bg-red-900/20 px-6 py-4 border-b border-red-100 dark:border-red-900/30">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-400">
              Risk Disclosures on Derivatives
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="font-semibold text-amber-800 dark:text-amber-400 mb-2">
                📊 Key Statistics from SEBI Study:
              </p>
              <ul className="space-y-2 text-amber-900 dark:text-amber-300">
                <li className="flex gap-2">
                  <span>•</span>
                  <span><strong>9 out of 10</strong> individual traders in equity Futures and Options Segment incurred net losses.</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>On average, loss makers registered net trading loss close to <strong>₹50,000</strong>.</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Loss makers expended an additional <strong>28%</strong> of net trading losses as transaction costs.</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Profit makers incurred between <strong>15% to 50%</strong> of such profits as transaction costs.</span>
                </li>
              </ul>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              Source: <a href="https://www.sebi.gov.in/reports-and-statistics/research/jan-2023/study-analysis-of-profit-and-loss-of-individual-traders-dealing-in-equity-fando-segment_67525.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">SEBI</a> study dated January 25, 2023 on &quot;Analysis of Profit and Loss of Individual Traders dealing in equity Futures and Options (F&O) Segment&quot;, wherein Aggregate Level findings are based on annual Profit/Loss incurred by individual traders in equity F&O during FY 2021-22.
            </p>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">
                  I have read and understand the risks involved in trading derivatives. I accept all the terms & conditions.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleAccept}
            disabled={!accepted}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              accepted
                ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            }`}
          >
            I Understand & Continue
          </button>
        </div>
      </div>
    </div>
  );
}

// Export the key for use in logout
export { RISK_DISCLOSURE_KEY };

