import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mock axiosClient pre importa Login komponente
vi.mock('../axiosClient.js', () => ({
    default: {
        post: vi.fn(),
        interceptors: {
            request:  { use: vi.fn() },
            response: { use: vi.fn() },
        },
    },
}));

// Mock react-google-recaptcha-v3
vi.mock('react-google-recaptcha-v3', () => ({
    useGoogleReCaptcha: () => ({
        executeRecaptcha: vi.fn().mockResolvedValue('mock-recaptcha-token'),
    }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock ContextProvider
vi.mock('../context/ContextProvider.jsx', () => ({
    useStateContext: () => ({
        setUser: vi.fn(),
        setToken: vi.fn(),
    }),
}));

// Mock config
vi.mock('../config/externalApis.js', () => ({
    RECAPTCHA_CONFIG: {
        siteKey: 'test-key',
        actions: { LOGIN: 'login', REGISTER: 'register' },
        minScore: 0.5,
    },
}));

import { Login } from '../pages/Login.jsx';
import axiosClient from '../axiosClient.js';

// Helper: renderuje Login unutar potrebnih providera
const renderLogin = () => {
    return render(
        <MemoryRouter>
            <Login />
        </MemoryRouter>
    );
};

describe('Login komponenta', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renderuje email i password polja', () => {
        renderLogin();

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/lozinka/i)).toBeInTheDocument();
    });

    it('renderuje dugme za prijavu', () => {
        renderLogin();

        expect(
            screen.getByRole('button', { name: /prijavite se/i })
        ).toBeInTheDocument();
    });

    it('renderuje link ka registraciji', () => {
        renderLogin();

        expect(screen.getByText(/registrujte se/i)).toBeInTheDocument();
    });

    it('ažurira email polje na unos', async () => {
        renderLogin();

        const emailInput = screen.getByLabelText(/email/i);
        await userEvent.type(emailInput, 'test@test.com');

        expect(emailInput.value).toBe('test@test.com');
    });

    it('ažurira lozinka polje na unos', async () => {
        renderLogin();

        const passwordInput = screen.getByLabelText(/lozinka/i);
        await userEvent.type(passwordInput, 'password123');

        expect(passwordInput.value).toBe('password123');
    });

    it('poziva axiosClient.post na submit forme', async () => {
        axiosClient.post.mockResolvedValueOnce({
            data: {
                token: 'test-token-123',
                user: { id: 1, name: 'Test', email: 'test@test.com', role: 'user' },
            },
        });

        renderLogin();

        await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com');
        await userEvent.type(screen.getByLabelText(/lozinka/i), 'password123');

        fireEvent.click(screen.getByRole('button', { name: /prijavite se/i }));

        await waitFor(() => {
            expect(axiosClient.post).toHaveBeenCalledWith(
                '/login',
                expect.objectContaining({
                    email: 'test@test.com',
                    password: 'password123',
                })
            );
        });
    });

    it('prikazuje grešku za neispravne kredencijale', async () => {
        axiosClient.post.mockRejectedValueOnce({
            response: {
                status: 401,
                data: { message: 'Pogrešan email ili lozinka.' },
            },
        });

        renderLogin();

        await userEvent.type(screen.getByLabelText(/email/i), 'wrong@test.com');
        await userEvent.type(screen.getByLabelText(/lozinka/i), 'wrongpass');

        fireEvent.click(screen.getByRole('button', { name: /prijavite se/i }));

        await waitFor(() => {
            expect(
                screen.getByText(/pogrešan email ili lozinka/i)
            ).toBeInTheDocument();
        });
    });
});
