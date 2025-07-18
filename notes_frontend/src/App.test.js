import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders Personal Notes app main branding', () => {
  render(<App />);
  const brand = screen.getByText(/NoteKit/i);
  expect(brand).toBeInTheDocument();
});

test('can create a new note', () => {
  render(<App />);
  const addBtn = screen.getByTitle(/New Note/i);
  fireEvent.click(addBtn);
  const input = screen.getByPlaceholderText(/Title/i);
  fireEvent.change(input, { target: { value: 'Sample Note' } });
  const save = screen.getByText(/Save/i);
  fireEvent.click(save);
  expect(screen.getByText(/Sample Note/i)).toBeInTheDocument();
});

test('displays empty state when no note selected', () => {
  render(<App />);
  expect(screen.getByText(/No note selected/i)).toBeInTheDocument();
});
