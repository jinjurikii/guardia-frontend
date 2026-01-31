import { render, screen, fireEvent } from '@testing-library/react';
import TestButton from '../TestButton';

describe('TestButton', () => {
  it('renders with children', () => {
    render(<TestButton>Click Me</TestButton>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('handles onClick events', () => {
    const handleClick = jest.fn();
    render(<TestButton onClick={handleClick}>Click Me</TestButton>);

    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<TestButton variant="primary">Primary</TestButton>);
    expect(screen.getByTestId('test-button')).toHaveClass('bg-blue-600');

    rerender(<TestButton variant="secondary">Secondary</TestButton>);
    expect(screen.getByTestId('test-button')).toHaveClass('bg-gray-200');

    rerender(<TestButton variant="ghost">Ghost</TestButton>);
    expect(screen.getByTestId('test-button')).toHaveClass('text-gray-700');
  });

  it('disables button when disabled prop is true', () => {
    render(<TestButton disabled>Disabled</TestButton>);
    expect(screen.getByTestId('test-button')).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<TestButton className="custom-class">Custom</TestButton>);
    expect(screen.getByTestId('test-button')).toHaveClass('custom-class');
  });
});
