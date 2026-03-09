/**
 * Konfiguracija eksternih API integracija
 *
 * EKSTERNI API #1: Google reCAPTCHA v3
 * ─────────────────────────────────────
 * Svrha: Zaštita Login i Register formi od botova i automatizovanih napada.
 * Tip: Invisible (nema vidljivog challenge-a za korisnika)
 * Flow:
 *   1. Frontend poziva executeRecaptcha('action') → dobija token
 *   2. Token se šalje backendu zajedno sa payload-om forme
 *   3. Backend verifikuje token pozivom Google API-ja:
 *      POST https://www.google.com/recaptcha/api/siteverify
 *      { secret: RECAPTCHA_SECRET_KEY, response: token }
 *   4. Google vraća { success: true, score: 0.9 }
 *   5. Backend prihvata zahtev ako je score >= 0.5
 *
 * Dokumentacija: https://developers.google.com/recaptcha/docs/v3
 *
 * EKSTERNI API #2: Resend (Email notifikacije)
 * ─────────────────────────────────────────────
 * Svrha: Slanje transakcionalnih email obaveštenja.
 * Implementacija: ISKLJUČIVO na Laravel backendu.
 * Frontend ne komunicira direktno sa Resend API-jem.
 *
 * Emailovi koji se šalju:
 *   - Prijava problema (SK16):
 *       Trigger: POST /api/reports
 *       Primalac: Admin (svi korisnici sa role='admin')
 *       Sadržaj: Ko je prijavio, koji rad, opis problema
 *
 *   - Brisanje rada (SK17):
 *       Trigger: DELETE /api/projects/:id (od strane admina)
 *       Primalac: Researcher koji je vlasnik rada
 *       Sadržaj: Naziv rada, razlog brisanja
 *
 *   - Dobrodošlica (SK1):
 *       Trigger: POST /api/register
 *       Primalac: Novoregistrovani korisnik
 *       Sadržaj: Potvrda registracije, link ka aplikaciji
 */

export const RECAPTCHA_CONFIG = {
    siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY || '',
    actions: {
        LOGIN: 'login',
        REGISTER: 'register',
    },
    minScore: 0.5, // Backend prihvata score >= 0.5
};

export const API_CONFIG = {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
};
