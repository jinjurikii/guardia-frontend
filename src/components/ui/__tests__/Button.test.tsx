import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  it('should render children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });

  it('should apply primary variant by default', () => {
    const { container } = render(<Button>Click me</Button>);
    const button = container.firstChild as HTMLElement;
    expect(button.className).toContain('bg-[#e8a060]');
  });

  it('should apply secondary variant', () => {
    const { container } = render(<Button variant="secondary">Click me</Button>);
    const button = container.firstChild as HTMLElement;
    expect(button.className).toContain('bg-[#1c1c1e]');
  });

  it('should apply ghost variant', () => {
    const { container } = render(<Button variant="ghost">Click me</Button>);
    const button = container.firstChild as HTMLElement;
    expect(button.className).toContain('text-[#6a6a6a]');
  });
});
