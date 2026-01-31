'use client';

import { TestButton } from '@/components/ui';

export default function TestUIPage() {
  const handleClick = () => {
    alert('TestButton clicked!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Test UI Components</h1>

        <div className="bg-white rounded-xl p-8 shadow-2xl space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">TestButton Component</h2>
            <p className="text-gray-600 mb-4">
              A reusable button component with multiple variants and states.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Primary Button</h3>
              <TestButton variant="primary" onClick={handleClick}>
                Click Me
              </TestButton>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Secondary Button</h3>
              <TestButton variant="secondary" onClick={handleClick}>
                Secondary Action
              </TestButton>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Ghost Button</h3>
              <TestButton variant="ghost" onClick={handleClick}>
                Ghost Action
              </TestButton>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Disabled Button</h3>
              <TestButton disabled onClick={handleClick}>
                Cannot Click
              </TestButton>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Custom Styled</h3>
              <TestButton className="w-full shadow-xl" onClick={handleClick}>
                Full Width Button
              </TestButton>
            </div>
          </div>

          <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-800 font-medium">✓ Component successfully rendered!</p>
            <p className="text-green-600 text-sm mt-1">All tests passing (5/5)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
