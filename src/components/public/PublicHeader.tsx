"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { useAuth } from "@/context/AuthContext";

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 dark:bg-gray-950/80 dark:border-gray-800">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2">
            <Image
              src="/images/logo/logo-icon.svg"
              alt="NiftySwift"
              width={36}
              height={36}
            />
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              NiftySwift
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/home#features"
              className="text-sm font-medium text-gray-600 hover:text-brand-500 transition-colors dark:text-gray-300"
            >
              Features
            </Link>
            <Link
              href="/plans"
              className="text-sm font-medium text-gray-600 hover:text-brand-500 transition-colors dark:text-gray-300"
            >
              Pricing
            </Link>
            <Link
              href="/faq"
              className="text-sm font-medium text-gray-600 hover:text-brand-500 transition-colors dark:text-gray-300"
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-gray-600 hover:text-brand-500 transition-colors dark:text-gray-300"
            >
              Contact
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggleButton />
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors shadow-sm"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-sm font-medium text-gray-700 hover:text-brand-500 transition-colors dark:text-gray-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors shadow-sm"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-col gap-4">
              <Link
              href="/home#features"
              className="text-sm font-medium text-gray-600 hover:text-brand-500 dark:text-gray-300"
              onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/plans"
                className="text-sm font-medium text-gray-600 hover:text-brand-500 dark:text-gray-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/faq"
                className="text-sm font-medium text-gray-600 hover:text-brand-500 dark:text-gray-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-gray-600 hover:text-brand-500 dark:text-gray-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <hr className="border-gray-100 dark:border-gray-800" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Theme</span>
                <ThemeToggleButton />
              </div>
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="text-sm font-medium text-gray-700 hover:text-brand-500 dark:text-gray-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

