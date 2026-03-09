import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'; // ← NOVO

import { ContextProvider } from './context/ContextProvider.jsx';
import { RECAPTCHA_CONFIG } from './config/externalApis.js';          // ← NOVO
import router from './router.jsx';
import './index.css';

/**
 * Redosled wrappera (od spolja ka unutra):
 * GoogleReCaptchaProvider → ContextProvider → RouterProvider
 *
 * GoogleReCaptchaProvider mora biti IZVAN ContextProvider-a kako bi
 * useGoogleReCaptcha hook bio dostupan u svim komponentama.
 */
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <GoogleReCaptchaProvider
            reCaptchaKey={RECAPTCHA_CONFIG.siteKey}
            scriptProps={{
                async: true,
                defer: true,
                appendTo: 'head',
            }}
            language="sr"  // srpski jezik badge-a
        >
            <ContextProvider>
                <RouterProvider router={router} />
            </ContextProvider>
        </GoogleReCaptchaProvider>
    </StrictMode>
);
