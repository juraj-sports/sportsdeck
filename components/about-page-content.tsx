"use client"

import { useRouter } from 'next/navigation';
import { SharedHeader } from "@/components/shared-header";
import { SubmitModal } from "@/components/submit-modal";
import { useState } from "react";
import { Edit3 } from "lucide-react";

export default function AboutPageContent() {
  const router = useRouter();
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  return (
    <div className="bg-white min-h-screen">
      <SharedHeader />
      
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* About Label */}
        <div className="mb-12">
          <p className="text-gray-500 text-sm">About</p>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8 leading-tight">
          I love discovering new sports apps, tools and creators, and I realized many great ones go unnoticed, so I built a place to bring them together.</h1>

        {/* Body Paragraphs */}
        <div className="space-y-6 text-gray-700 leading-relaxed mb-8">
          <p>
            I’m Juraj, working across product and marketing growth, and a lifelong sports fan. I grew up playing hockey for a few years before spending a decade on the basketball court. I’ve been following sports for over 20 years and have always been fascinated by how technology and creativity shape the way we experience the game.</p>
          <p>
            This platform is a curated collection for those, like me, who care about how we experience sports. Submitting your app or project is free, and if it fits the collection, I’d love to feature it.</p>
          </div>

        {/* Submit Deck Button */}
        <div className="mb-16">
          <button 
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center space-x-2 px-6 py-2.5 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-full text-gray-700 font-bold text-sm transition-colors"
          >
            <span>Get featured</span>
          </button>
        </div>

        {/* Feedback Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Feedback
          </h2>
          
          <div className="space-y-6 text-gray-700 leading-relaxed mb-8">
            <p>
              I’d love to hear your thoughts and suggestions about SportsDeck. Your feedback helps me improve the platform and better serve the sports community.</p>
            </div>

          {/* Share Feedback Button */}
          <a 
            href="https://form.typeform.com/to/uJnsZuQ8"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-full text-gray-700 font-bold text-sm transition-colors"
          >
            Share feedback
          </a>
        </div>

      </div>

      {/* Submit Modal */}
      <SubmitModal open={showSubmitModal} onOpenChange={setShowSubmitModal} />
    </div>
  );
}






