import type { Metadata } from 'next';
import siteMetadata from '@/app/metadata.json';
import AdminPageContent from '@/components/admin-page-content';
import { AdminPasswordGate } from '@/components/admin-password-gate';
import { Suspense } from 'react';

export const metadata: Metadata = siteMetadata['/admin'];

export default function AdminPage() {
  return (
    <AdminPasswordGate>
      <Suspense fallback={<div />}>
        <AdminPageContent />
      </Suspense>
    </AdminPasswordGate>
  );
}
