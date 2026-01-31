'use client';

import TestButton from '@/components/ui/TestButton';
import { useState } from 'react';

export default function TestButtonDemo() {
  const [clickCount, setClickCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">TestButton Component Demo</h1>

        <div className="space-y-8">
          {/* Basic Variants */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Variants</h2>
            <div className="flex gap-4 flex-wrap">
              <TestButton variant="primary">Primary Button</TestButton>
              <TestButton variant="secondary">Secondary Button</TestButton>
              <TestButton variant="ghost">Ghost Button</TestButton>
            </div>
          </section>

          {/* Interactive Example */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Interactive</h2>
            <div className="flex gap-4 items-center">
              <TestButton onClick={() => setClickCount(clickCount + 1)}>
                Click Me
              </TestButton>
              <span className="text-gray-700">Clicked {clickCount} times</span>
              <TestButton variant="secondary" onClick={() => setClickCount(0)}>
                Reset
              </TestButton>
            </div>
          </section>

          {/* Disabled State */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Disabled State</h2>
            <div className="flex gap-4 flex-wrap">
              <TestButton disabled>Disabled Primary</TestButton>
              <TestButton variant="secondary" disabled>Disabled Secondary</TestButton>
              <TestButton variant="ghost" disabled>Disabled Ghost</TestButton>
            </div>
          </section>

          {/* Custom Styling */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Custom Styling</h2>
            <div className="flex gap-4 flex-wrap">
              <TestButton className="shadow-lg">With Shadow</TestButton>
              <TestButton className="uppercase tracking-wider">Uppercase</TestButton>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
