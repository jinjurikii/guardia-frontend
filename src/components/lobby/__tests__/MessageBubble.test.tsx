import { render, screen } from '@testing-library/react';
import MessageBubble from '../MessageBubble';
import { Message } from '../LobbyShell';

describe('MessageBubble', () => {
  const userMessage: Message = {
    role: 'user',
    content: 'Hello, this is a test message',
  };

  const assistantMessage: Message = {
    role: 'assistant',
    content: 'This is a response from the assistant',
  };

  it('should render user message correctly', () => {
    render(<MessageBubble message={userMessage} isUser={true} />);
    expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
  });

  it('should render assistant message correctly', () => {
    render(<MessageBubble message={assistantMessage} isUser={false} />);
    expect(screen.getByText('This is a response from the assistant')).toBeInTheDocument();
  });

  it('should show avatar for assistant messages', () => {
    const { container } = render(<MessageBubble message={assistantMessage} isUser={false} />);
    const avatar = container.querySelector('.text-\\[\\#e8a060\\]');
    expect(avatar).toBeInTheDocument();
  });

  it('should not show avatar for user messages', () => {
    const { container } = render(<MessageBubble message={userMessage} isUser={true} />);
    const avatar = container.querySelector('.text-\\[\\#e8a060\\]');
    expect(avatar).not.toBeInTheDocument();
  });

  it('should apply correct styling for user messages', () => {
    const { container } = render(<MessageBubble message={userMessage} isUser={true} />);
    const bubble = container.querySelector('.bg-\\[\\#e8a060\\]');
    expect(bubble).toBeInTheDocument();
  });

  it('should apply correct styling for assistant messages', () => {
    const { container } = render(<MessageBubble message={assistantMessage} isUser={false} />);
    const bubble = container.querySelector('.bg-\\[\\#1c1c1e\\]');
    expect(bubble).toBeInTheDocument();
  });
});
