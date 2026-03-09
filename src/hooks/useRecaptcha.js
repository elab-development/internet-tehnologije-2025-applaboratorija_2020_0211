import { useCallback } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

/**
 * Custom hook koji enkapsulira Google reCAPTCHA v3 logiku.
 *
 * Korišćenje:
 *   const { getToken, isReady } = useRecaptcha();
 *   const token = await getToken('login');
 *
 * @returns {{ getToken: Function, isReady: boolean }}
 */
export function useRecaptcha() {
    const { executeRecaptcha } = useGoogleReCaptcha();

    const isReady = !!executeRecaptcha;

    /**
     * Generiše reCAPTCHA v3 token za zadatu akciju.
     * @param {string} action - Naziv akcije (npr. 'login', 'register')
     * @returns {Promise<string|null>} - Token ili null ako reCAPTCHA nije spreman
     */
    const getToken = useCallback(
        async (action) => {
            if (!executeRecaptcha) {
                console.warn(
                    '[reCAPTCHA] executeRecaptcha nije spreman. ' +
                    'Proverite da li je VITE_RECAPTCHA_SITE_KEY podešen.'
                );
                return null;
            }

            try {
                const token = await executeRecaptcha(action);
                return token;
            } catch (err) {
                console.error('[reCAPTCHA] Greška pri generisanju tokena:', err);
                return null;
            }
        },
        [executeRecaptcha]
    );

    return { getToken, isReady };
}
