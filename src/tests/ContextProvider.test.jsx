import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';

// Mock axiosClient
vi.mock('../axiosClient.js', () => ({
    default: {
        get: vi.fn(),
        interceptors: {
            request:  { use: vi.fn() },
            response: { use: vi.fn() },
        },
    },
}));

import { ContextProvider } from "../context/ContextProvider.jsx";
import { useStateContext } from "../context/useStateContext.js";
import axiosClient from '../axiosClient.js';

// Test komponenta koja koristi context
const TestConsumer = () => {
    const { user, token, loading } = useStateContext();

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div data-testid="user-name">{user?.name || 'no-user'}</div>
            <div data-testid="token">{token || 'no-token'}</div>
        </div>
    );
};

// Test komponenta za setToken
const TokenSetter = () => {
    const { setToken } = useStateContext();

    return (
        <button onClick={() => setToken('new-test-token')}>
            Set Token
        </button>
    );
};

describe('ContextProvider', () => {

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('pruža inicijalnu null vrednost za user i token', () => {
        render(
            <ContextProvider>
                <TestConsumer />
            </ContextProvider>
        );

        expect(screen.getByTestId('user-name').textContent).toBe('no-user');
        expect(screen.getByTestId('token').textContent).toBe('no-token');
    });

    it('učitava korisnika sa /me ako postoji token u localStorage', async () => {
        localStorage.setItem('ACCESS_TOKEN', 'existing-token');

        axiosClient.get.mockResolvedValueOnce({
            data: {
                user: { id: 1, name: 'Marija Ivanović', email: 'marija@test.com', role: 'researcher' },
            },
        });

        render(
            <ContextProvider>
                <TestConsumer />
            </ContextProvider>
        );

        // Inicijalno loading...
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        // Posle fetchanja
        await waitFor(() => {
            expect(screen.getByTestId('user-name').textContent).toBe('Marija Ivanović');
        });

        // API je pozvan sa tokenom
        expect(axiosClient.get).toHaveBeenCalledWith('/me');
    });

    it('čuva token u localStorage kada se pozove setToken', async () => {
        render(
            <ContextProvider>
                <TokenSetter />
            </ContextProvider>
        );

        const button = screen.getByRole('button', { name: /set token/i });

        await act(async () => {
            button.click();
        });

        expect(localStorage.getItem('ACCESS_TOKEN')).toBe('new-test-token');
    });

    it('briše token iz localStorage kada se setToken pozove sa null', async () => {
        localStorage.setItem('ACCESS_TOKEN', 'stari-token');

        axiosClient.get.mockRejectedValueOnce(new Error('Unauthorized'));

        const NullTokenSetter = () => {
            const { setToken } = useStateContext();
            return (
                <button onClick={() => setToken(null)}>Clear Token</button>
            );
        };

        render(
            <ContextProvider>
                <NullTokenSetter />
            </ContextProvider>
        );

        await waitFor(() => {
            expect(localStorage.getItem('ACCESS_TOKEN')).toBeNull();
        });
    });

    it('čisti user i token kada /me vrati grešku', async () => {
        localStorage.setItem('ACCESS_TOKEN', 'invalid-token');

        axiosClient.get.mockRejectedValueOnce({
            response: { status: 401 },
        });

        render(
            <ContextProvider>
                <TestConsumer />
            </ContextProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('user-name').textContent).toBe('no-user');
            expect(screen.getByTestId('token').textContent).toBe('no-token');
        });
    });
});
