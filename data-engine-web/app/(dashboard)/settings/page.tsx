'use client';

import { TopBar } from '@/components/layout/TopBar';

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <TopBar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <p className="text-gray-400">Settings page content goes here...</p>
      </div>
    </div>
  );
}
