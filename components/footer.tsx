"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NewsletterSubscription } from "@/components/newsletter-subscription";
export default function Footer() {
  const pathname = usePathname();
  const isAppDetailPage = pathname.startsWith("/apps/");
  
  return (
    <footer className="bg-white border-t border-gray-200">
      {/* About SportsDeck Banner — hidden on app detail pages */}
      {!isAppDetailPage && (
        <div className="w-full px-6 lg:px-10 py-12 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Logo */}
          <div className="shrink-0">
            <img
              src="https://assets.macaly-user-data.dev/cdn-cgi/image/format=webp,width=2000,height=2000,fit=scale-down,quality=90,anim=true/n9vqtt1eze5iybbawq57tn30/new-chat/4nxzs5XXRQ3yhBbM5utid/logo-orange-black.png"
              alt="SportsDeck"
              className="h-10 w-auto"
            />
          </div>
          {/* Description */}
          <p className="text-gray-500 text-base leading-relaxed max-w-sm text-left">
            The home for the best sports apps and tools, picked for fans who want more from their sport.</p>
          </div>
        </div>
      )}

      <div className="w-full px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Left: Newsletter */}
          <div>
            <h2 className="font-display text-2xl uppercase tracking-wide text-gray-900 mb-6">SportsDeck® newsletter</h2>
            <NewsletterSubscription 
              placeholder="Enter your email for weekly picks" 
              className="max-w-full"
            />
            <p className="text-gray-500 text-sm mt-4">
              Planning to make it a weekly thing, let's see how it goes.</p>
          </div>

          {/* Right: Social Icons */}
          <div className="flex justify-end gap-5 items-start">
            <a 
              href="https://x.com/SportsDeckIO" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-900 hover:text-gray-600 transition-colors"
              aria-label="X (Twitter)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a 
              href="https://www.linkedin.com/company/sportsdeck" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-900 hover:text-gray-600 transition-colors"
              aria-label="LinkedIn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom: Copyright */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            All rights reserved © {new Date().getFullYear()} SportsDeck® curated by Juraj Mihalik
          </p>
        </div>
      </div>
      
    </footer>
  );
}







