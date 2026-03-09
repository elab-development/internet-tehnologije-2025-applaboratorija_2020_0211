import DOMPurify from 'dompurify';

/**
 * BEZBEDNOST #1 – XSS zaštita na frontendu
 *
 * DOMPurify uklanja maliciozni HTML/JavaScript iz stringa
 * pre nego što se prikaže u DOM-u.
 *
 * Primeri XSS vektora koje ovo blokira:
 *   '<script>alert("XSS")</script>'
 *   '<img src=x onerror=alert(1)>'
 *   '<a href="javascript:alert(1)">klik</a>'
 */

/**
 * Sanitizuje string za prikaz kao plain text (uklanja sav HTML).
 * Koristiti za: naslove, opise, imena korisnika.
 *
 * @param {string} dirty - Neočišćeni string iz API-ja
 * @returns {string} Čist, siguran string
 */
export function sanitizeText(dirty) {
    if (!dirty || typeof dirty !== 'string') return '';

    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [],   // Ne dozvoli nijedan HTML tag
        ALLOWED_ATTR: [],   // Ne dozvoli nijedan atribut
    });
}

/**
 * Sanitizuje string za prikaz kao HTML (dozvoljeni su samo bezopasni tagovi).
 * Koristiti za: opis koji može imati bold, italic, liste.
 * NAPOMENA: U ovoj aplikaciji se ne koristi direktno, ali je dostupan.
 *
 * @param {string} dirty - Neočišćeni HTML string
 * @returns {string} Sanitizovani HTML string
 */
export function sanitizeHtml(dirty) {
    if (!dirty || typeof dirty !== 'string') return '';

    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'ul', 'ol', 'li', 'br'],
        ALLOWED_ATTR: [],
    });
}

/**
 * Sanitizuje URL (sprečava javascript: protokol).
 * Koristiti za: href atribute koji dolaze iz API-ja.
 *
 * @param {string} url - URL iz API-ja
 * @returns {string} Čist URL ili prazan string
 */
export function sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return '';

    // Blokira javascript: i data: protokole
    const cleaned = DOMPurify.sanitize(url, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
    });

    try {
        const parsed = new URL(cleaned);
        const allowedProtocols = ['http:', 'https:'];
        return allowedProtocols.includes(parsed.protocol) ? cleaned : '';
    } catch {
        return '';
    }
}
