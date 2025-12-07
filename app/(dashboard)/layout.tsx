import React from 'react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Nav */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <span className="font-bold text-xl text-blue-900">NC BondFlow</span>
        <div className="flex gap-4">
          <Link href="/login" className="text-sm text-red-500 hover:underline">Logout</Link>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        {children}
      </main>

      {/* Bottom Nav */}
      <footer className="bg-white border-t px-6 py-4 flex justify-center gap-4 text-sm text-slate-500">
        <span>© 2025 BondFlow</span>
        <a href="#" className="hover:text-blue-600">Support</a>
        <a href="#" className="hover:text-blue-600">Privacy</a>
      </footer>
    </div>
  );
}