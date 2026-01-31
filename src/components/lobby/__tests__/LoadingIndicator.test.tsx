import { render } from '@testing-library/react';
import LoadingIndicator from '../LoadingIndicator';

describe('LoadingIndicator', () => {
  it('should render loading animation', () => {
    const { container } = render(<LoadingIndicator />);
    const dots = container.querySelectorAll('.animate-bounce');
    expect(dots.length).toBe(3);
  });

  it('should show Giovanni avatar', () => {
    const { container } = render(<LoadingIndicator />);
    const avatar = container.querySelector('.text-\\[\\#e8a060\\]');
    expect(avatar).toBeInTheDocument();
  });

  it('should have proper styling', () => {
    const { container } = render(<LoadingIndicator />);
    const wrapper = container.querySelector('.bg-\\[\\#1c1c1e\\]');
    expect(wrapper).toBeInTheDocument();
  });
});
