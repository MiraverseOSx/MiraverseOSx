import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the OS menu bar', () => {
  render(<App />);
  const brand = screen.getByText(/MiraverseOSx/i);
  expect(brand).toBeInTheDocument();
});
