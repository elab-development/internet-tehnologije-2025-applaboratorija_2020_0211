import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeHtml, sanitizeUrl } from '../utils/sanitize.js';

/**
 * Unit testovi za DOMPurify sanitize utility.
 * Pokriva XSS zaštitu na frontend strani.
 */
describe('sanitizeText()', () => {

    it('vraća prazan string za null input', () => {
        expect(sanitizeText(null)).toBe('');
        expect(sanitizeText(undefined)).toBe('');
        expect(sanitizeText('')).toBe('');
    });

    it('vraća nepromenjen string za čist tekst', () => {
        const clean = 'Istraživanje veštačke inteligencije';
        expect(sanitizeText(clean)).toBe(clean);
    });

    it('uklanja script tagove (XSS vektor)', () => {
        const xss = '<script>alert("XSS")</script>Legitiman tekst';
        const result = sanitizeText(xss);

        expect(result).not.toContain('<script>');
        expect(result).not.toContain('alert(');
        expect(result).toContain('Legitiman tekst');
    });

    it('uklanja img onerror napad (XSS vektor)', () => {
        const xss = '<img src=x onerror=alert(1)>Tekst';
        const result = sanitizeText(xss);

        expect(result).not.toContain('<img');
        expect(result).not.toContain('onerror');
    });

    it('uklanja sve HTML tagove', () => {
        const html = '<b>Bold</b> <i>Italic</i> <p>Pasus</p>';
        const result = sanitizeText(html);

        expect(result).not.toContain('<b>');
        expect(result).not.toContain('<i>');
        expect(result).not.toContain('<p>');
        expect(result).toContain('Bold');
        expect(result).toContain('Italic');
        expect(result).toContain('Pasus');
    });

    it('uklanja data: URI napad', () => {
        const xss = '<a href="data:text/html,<script>alert(1)</script>">klik</a>';
        const result = sanitizeText(xss);

        expect(result).not.toContain('data:');
        expect(result).not.toContain('<a');
    });

    it('čuva specijalne karaktere koji nisu opasni', () => {
        const safe = 'Cena: 100€ & popust: 10% – za sve korisnike!';
        const result = sanitizeText(safe);
        expect(result).toBeTruthy();
    });
});

describe('sanitizeUrl()', () => {

    it('dozvoljava https URL', () => {
        const url = 'https://researchhub.app/papers/1.pdf';
        expect(sanitizeUrl(url)).toBe(url);
    });

    it('dozvoljava http URL', () => {
        const url = 'http://localhost:8000/storage/documents/paper.pdf';
        expect(sanitizeUrl(url)).toBe(url);
    });

    it('blokira javascript: protokol (XSS vektor)', () => {
        const malicious = 'javascript:alert("XSS")';
        const result = sanitizeUrl(malicious);
        expect(result).toBe('');
    });

    it('blokira data: protokol (XSS vektor)', () => {
        const malicious = 'data:text/html,<script>alert(1)</script>';
        const result = sanitizeUrl(malicious);
        expect(result).toBe('');
    });

    it('vraća prazan string za null/undefined', () => {
        expect(sanitizeUrl(null)).toBe('');
        expect(sanitizeUrl(undefined)).toBe('');
    });

    it('vraća prazan string za nevalidan URL', () => {
        expect(sanitizeUrl('nije-url')).toBe('');
    });
});

describe('sanitizeHtml()', () => {

    it('dozvoljava bezbedne tagove', () => {
        const html = '<b>Bold</b> <i>Italic</i>';
        const result = sanitizeHtml(html);
        expect(result).toContain('<b>');
        expect(result).toContain('<i>');
    });

    it('blokira script tagove', () => {
        const html = '<script>alert(1)</script><b>Tekst</b>';
        const result = sanitizeHtml(html);
        expect(result).not.toContain('<script>');
        expect(result).toContain('<b>');
    });

    it('blokira event handler atribute', () => {
        const html = '<b onclick="alert(1)">Klik</b>';
        const result = sanitizeHtml(html);
        expect(result).not.toContain('onclick');
    });
});
