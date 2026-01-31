import { render, screen, fireEvent } from '@testing-library/react';
import ChatInput from '../ChatInput';

describe('ChatInput', () => {
  const mockOnChange = jest.fn();
  const mockOnSend = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnSend.mockClear();
  });

  it('should render with placeholder', () => {
    render(
      <ChatInput
        value=""
        onChange={mockOnChange}
        onSend={mockOnSend}
        placeholder="Type a message..."
      />
    );
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
  });

  it('should call onChange when typing', () => {
    render(
      <ChatInput
        value=""
        onChange={mockOnChange}
        onSend={mockOnSend}
      />
    );
    const input = screen.getByPlaceholderText('Message Giovanni...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should call onSend when send button is clicked', () => {
    render(
      <ChatInput
        value="Hello"
        onChange={mockOnChange}
        onSend={mockOnSend}
      />
    );
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockOnSend).toHaveBeenCalled();
  });

  it('should call onSend when Enter key is pressed', () => {
    render(
      <ChatInput
        value="Hello"
        onChange={mockOnChange}
        onSend={mockOnSend}
      />
    );
    const input = screen.getByPlaceholderText('Message Giovanni...');
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
    expect(mockOnSend).toHaveBeenCalled();
  });

  it('should not call onSend when Shift+Enter is pressed', () => {
    render(
      <ChatInput
        value="Hello"
        onChange={mockOnChange}
        onSend={mockOnSend}
      />
    );
    const input = screen.getByPlaceholderText('Message Giovanni...');
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('should disable input and button when disabled', () => {
    render(
      <ChatInput
        value="Hello"
        onChange={mockOnChange}
        onSend={mockOnSend}
        disabled={true}
      />
    );
    const input = screen.getByPlaceholderText('Message Giovanni...');
    const button = screen.getByRole('button');
    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('should disable button when value is empty', () => {
    render(
      <ChatInput
        value=""
        onChange={mockOnChange}
        onSend={mockOnSend}
      />
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
