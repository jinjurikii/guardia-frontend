import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../Input';

describe('Input', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render with placeholder', () => {
    render(<Input value="" onChange={mockOnChange} placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should call onChange when value changes', () => {
    render(<Input value="" onChange={mockOnChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(mockOnChange).toHaveBeenCalledWith('Hello');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input value="" onChange={mockOnChange} disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should handle keydown events', () => {
    const handleKeyDown = jest.fn();
    render(<Input value="test" onChange={mockOnChange} onKeyDown={handleKeyDown} />);
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(handleKeyDown).toHaveBeenCalled();
  });

  it('should display value', () => {
    render(<Input value="test value" onChange={mockOnChange} />);
    expect(screen.getByDisplayValue('test value')).toBeInTheDocument();
  });
});
