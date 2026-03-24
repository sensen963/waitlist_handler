import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Input from '../../../components/ui/Input';

describe('Input Component', () => {
  it('renders correctly with label', () => {
    render(<Input label="Name" placeholder="Enter your name" />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  it('updates value correctly', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'John Doe' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled={true} />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('applies custom class names', () => {
    render(<Input className="custom-input-class" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input-class');
  });
});
