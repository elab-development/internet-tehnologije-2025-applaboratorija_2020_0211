# ResearchHub – Bezbednosna dokumentacija

## Implementirane zaštite

### 1. XSS (Cross-Site Scripting)

**Rizik:** Napadač unosi maliciozni JavaScript kod u formular
(npr. `<script>document.cookie</script>` kao ime projekta),
koji se zatim izvršava u browser-u drugih korisnika.

**Mere zaštite:**

#### Backend (`SanitizeInputMiddleware.php`)
- `strip_tags()` se primenjuje na sve string inpute pre obrade u kontroleru
- Aktivira se automatski na svakom API zahtevu

#### Backend (`SecurityHeadersMiddleware.php`)
- `Content-Security-Policy` header ograničava koje skripte se mogu učitati
- `X-XSS-Protection` aktivira browser-level XSS filter

#### Frontend (`src/utils/sanitize.js`)
- `DOMPurify.sanitize()` se primenjuje na sve user-generated stringove pre prikaza
- `sanitizeUrl()` blokira `javascript:` i `data:` protokole u URL-ovima

---

### 2. IDOR (Insecure Direct Object Reference)

**Rizik:** Korisnik menja ID u URL-u (npr. `PUT /api/projects/5`)
i pristupa/menja tuđi resurs.

**Mere zaštite:**

#### Backend (Laravel Policies)
- `ProjectPolicy` – samo vlasnik ili admin može menjati/brisati projekat
- `ExperimentPolicy` – samo vlasnik projekta ili član može menjati eksperiment
- `ReservationPolicy` – samo kreator rezervacije može da je obriše
- `$this->authorize()` u kontroleru automatski vraća 403 ako korisnik nema pravo

#### Primer:
DELETE /api/projects/99 (tuđi projekat) → 403 Forbidden: "Nemate dozvolu za ovu akciju."

---

### 3. Brute Force / Rate Limiting

**Rizik:** Napadač šalje hiljade zahteva za login/register
u pokušaju da pogodi lozinku ili kreira botove.

**Mere zaštite:**

#### Backend (`AppServiceProvider.php`)
| Endpoint | Limit | Po |
|----------|-------|----|
| POST /api/login | 10 req/min | IP adresi |
| POST /api/register | 5 req/min | IP adresi |
| POST /api/reports | 3 req/min | Korisniku |
| Sve ostale API rute | 60 req/min | Korisniku/IP |

→ 429 Too Many Requests: "Previše pokušaja prijave. Pokušajte ponovo za 1 minut."

---

### 4. SQL Injection

**Rizik:** Napadač ubacuje SQL kod u input (`'; DROP TABLE users; --`)
koji se izvršava na bazi podataka.

**Mera zaštite:**
- Laravel Eloquent ORM koristi **PDO Prepared Statements** za SVE upite
- Korisnički input se NIKADA ne konkatenira direktno u SQL string
- Automatska zaštita bez dodatne konfiguracije

---

### 5. Clickjacking

**Rizik:** Maliciozna stranica embedduje aplikaciju u `<iframe>`
i navodi korisnika da klikne na nevidljive elemente.

**Mera zaštite:**
- `X-Frame-Options: DENY` header (SecurityHeadersMiddleware)
- Aplikacija se ne može učitati ni u jednom iframe-u

---

### 6. CSRF (Cross-Site Request Forgery)

**Rizik:** Maliciozna stranica šalje zahteve u ime korisnika
koristeći njihov session.

**Mera zaštite:**
- Laravel Sanctum koristi **Bearer token** autentifikaciju za SPA
- Token se čuva u `localStorage` i šalje eksplicitno u `Authorization` header
- Zahtevi bez tokena dobijaju 401 odgovor
- `withCredentials: true` u axios konfiguraciji

---

### 7. Information Disclosure

**Rizik:** Server vraća tehničke detalje o greški
(stack trace, verzija PHP-a, itd.)

**Mera zaštite:**
- `APP_DEBUG=false` u production `.env`
- `SecurityHeadersMiddleware` uklanja `X-Powered-By` i `Server` header
- Sve greške se vraćaju kao generičan JSON bez tehničkih detalja

---

## Setup uputstva

### Backend
```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

### Frontend
```bash
npm install dompurify
npm run dev
```

## Testiranje bezbednosti

### 1. XSS Test
- Kreiraj projekat sa naslovom: `<script>alert('XSS')</script>`
- Očekivano: skript se ne izvršava, prikazuje se kao tekst

### 2. IDOR Test
- Login kao korisnik A
- Pokušaj PUT /api/projects/5 gdje je 5 tuđi projekat
- Očekivano: 403 Forbidden

### 3. Rate Limiting Test
- Pokušaj POST /api/login 11 puta sa pogrešnom lozinkom
- Očekivano: 429 Too Many Requests nakon 10. pokušaja

### 4. SQL Injection Test
- Pokušaj search sa: `' OR '1'='1`
- Očekivano: normalno pretraživanje, bez SQL greške

---

## Checklist – Bezbednost je sigurna kada:

Backend:
- [x] SecurityHeadersMiddleware dodaje X-Frame-Options: DENY na sve odgovore
- [x] SanitizeInputMiddleware čisti sve string inpute
- [x] ProjectPolicy, ExperimentPolicy, ReservationPolicy registrovane
- [x] $this->authorize() korišćen u update/delete metodama
- [x] Rate limiters konfigurisani (login: 10/min, register: 5/min, reports: 3/min)
- [x] throttle:login, throttle:register, throttle:api na rutama

Frontend:
- [x] DOMPurify instaliran (npm install dompurify)
- [x] src/utils/sanitize.js postoji sa svim funkcijama
- [x] Papers.jsx koristi sanitizeText() za title, name, description
- [x] PaperDetail.jsx koristi sanitizeText() i sanitizeUrl()
- [x] Projects.jsx koristi sanitizeText()
- [x] axiosClient.js ima timeout, 401, 429, 403 handlere
- [x] docs/security.md dokumentacija napisana

---

## Dodatni saveti

1. **Production deployment:**
   - Postaviti `APP_DEBUG=false`
   - Koristiti HTTPS (HSTS header se aktivira automatski)
   - Redovno ažurirati zavisnosti (`composer update`, `npm update`)

2. **Monitoring:**
   - Pratiti log fajlove za sumnjive zahteve (429 rate limit)
   - Monitoring SQL query-ja za injections (Laravel Query Log)

3. **Redovne provere:**
   - Testirati OWASP Top 10 mesečno
   - Ažurirati DOMPurify verziju
   - Pregledalac sigurnosti (SecurityHeaders.com)
