import type { Metadata } from 'next';
import siteMetadata from '@/app/metadata.json';
import AboutPageContent from '@/components/about-page-content';
import { Suspense } from 'react';

export const metadata: Metadata = siteMetadata['/about'];

export default function AboutPage() {
  return (
    <Suspense fallback={<div />}> 
      <AboutPageContent />
    </Suspense>
  );
}


