import { render } from '@testing-library/react';
import Avatar from '../Avatar';

describe('Avatar', () => {
  it('should render with label', () => {
    const { container } = render(<Avatar label="G" />);
    expect(container.textContent).toBe('G');
  });

  it('should apply small size classes', () => {
    const { container } = render(<Avatar label="G" size="sm" />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain('w-8');
  });

  it('should apply medium size classes by default', () => {
    const { container } = render(<Avatar label="G" />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain('w-10');
  });

  it('should apply large size classes', () => {
    const { container } = render(<Avatar label="G" size="lg" />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain('w-12');
  });

  it('should apply primary variant by default', () => {
    const { container } = render(<Avatar label="G" />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain('bg-[#1c1c1e]');
  });

  it('should apply secondary variant', () => {
    const { container } = render(<Avatar label="G" variant="secondary" />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain('bg-[#e8a060]');
  });
});
