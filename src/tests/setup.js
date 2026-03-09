/**
 * Vitest globalni setup fajl.
 * Poziva se pre svakog test fajla.
 */
import '@testing-library/jest-dom';

// Mock za localStorage (jsdom ga ima, ali resetujemo ga između testova)
beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
});

// Mock za window.open (koristi se u Papers.jsx za PDF download)
Object.defineProperty(window, 'open', {
    writable: true,
    value: vi.fn(),
});

// Mock za console.error (sprečava buku u testu output-u)
const originalConsoleError = console.error;
beforeAll(() => {
    console.error = (...args) => {
        // Ignoriši React prop-type warnings u testovima
        if (args[0]?.includes?.('Warning:')) return;
        originalConsoleError(...args);
    };
});
afterAll(() => {
    console.error = originalConsoleError;
});
