import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mockovi
vi.mock('../axiosClient.js', () => ({
    default: {
        get: vi.fn(),
        interceptors: {
            request:  { use: vi.fn() },
            response: { use: vi.fn() },
        },
    },
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock('../context/ContextProvider.jsx', () => ({
    useStateContext: () => ({
        user: { id: 1, role: 'researcher', name: 'Test User' },
    }),
}));

const mockPapersResponse = {
    data: {
        data: [
            {
                id: 1,
                title: 'Veštačka inteligencija u medicini',
                description: 'Opis rada 1',
                category: 'IT',
                status: 'active',
                budget: '50000',
                end_date: '2026-01-01',
                document_url: null,
                leader: { id: 1, name: 'Dr Marija Ivanović' },
            },
            {
                id: 2,
                title: 'CRISPR istraživanje',
                description: 'Opis rada 2',
                category: 'Biology',
                status: 'active',
                budget: '80000',
                end_date: '2026-06-01',
                document_url: null,
                leader: { id: 2, name: 'Dr Nikola Petrović' },
            },
        ],
    },
};

const mockFavoritesResponse = {
    data: { favorites: [] },
};

import axiosClient from '../axiosClient.js';
import { Papers } from '../pages/Papers.jsx';

const renderPapers = () => {
    return render(
        <MemoryRouter>
            <Papers />
        </MemoryRouter>
    );
};

describe('Papers stranica', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        axiosClient.get.mockImplementation((url) => {
            if (url === '/favorites') return Promise.resolve(mockFavoritesResponse);
            return Promise.resolve(mockPapersResponse);
        });
    });

    it('renderuje search input polje', () => {
        renderPapers();

        expect(
            screen.getByPlaceholderText(/pretraži po naslovu/i)
        ).toBeInTheDocument();
    });

    it('renderuje filter za kategoriju', () => {
        renderPapers();

        expect(screen.getByText('Kategorija')).toBeInTheDocument();
    });

    it('renderuje sort select', () => {
        renderPapers();

        expect(screen.getByText('Sortiraj po')).toBeInTheDocument();
    });

    it('prikazuje rezultate posle učitavanja', async () => {
        renderPapers();

        await waitFor(() => {
            expect(
                screen.getByText('Veštačka inteligencija u medicini')
            ).toBeInTheDocument();
        });

        expect(screen.getByText('CRISPR istraživanje')).toBeInTheDocument();
    });

    it('ažurira search state na unos teksta', async () => {
        renderPapers();

        const searchInput = screen.getByPlaceholderText(/pretraži po naslovu/i);
        await userEvent.type(searchInput, 'inteligencija');

        expect(searchInput.value).toBe('inteligencija');
    });

    it('poziva API sa search parametrom', async () => {
        renderPapers();

        const searchInput = screen.getByPlaceholderText(/pretraži po naslovu/i);

        // Čekamo inicijalni load
        await waitFor(() => expect(axiosClient.get).toHaveBeenCalled());

        vi.clearAllMocks();
        axiosClient.get.mockResolvedValue(mockPapersResponse);

        await userEvent.type(searchInput, 'test');

        await waitFor(() => {
            expect(axiosClient.get).toHaveBeenCalledWith(
                '/projects/search',
                expect.objectContaining({
                    params: expect.objectContaining({ q: 'test' }),
                })
            );
        });
    });

    it('prikazuje poruku kada nema rezultata', async () => {
        axiosClient.get.mockImplementation((url) => {
            if (url === '/favorites') return Promise.resolve(mockFavoritesResponse);
            return Promise.resolve({ data: { data: [] } });
        });

        renderPapers();

        await waitFor(() => {
            expect(
                screen.getByText(/nema rezultata pretrage/i)
            ).toBeInTheDocument();
        });
    });
});
