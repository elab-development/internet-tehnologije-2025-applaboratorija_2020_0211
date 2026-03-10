# 🔬 ResearchHub - Naučno-istraživačka platforma

ResearchHub je sveobuhvatna web aplikacija dizajnirana za centralizovano upravljanje laboratorijskim procesima, naučnim projektima, eksperimentima i laboratorijskom opremom.

---

## 🎯 Ciljevi projekta
- Objedinjeno čuvanje i organizacija naučnih radova (PDF fajlovi)
- Sigurno kreiranje i vođenje eksperimenata i uzoraka
- Praćenje opreme kroz napredan sistem rezervacija (bez preklapanja termina)
- Jasno definisane uloge i dozvole pristupa (IDOR zaštita)

---

## 🛠 Tehnologije
- **Frontend:** React 19, Vite, Material UI, React Router, Recharts/Google Charts
- **Backend:** Laravel 11, PHP 8.2, Sanctum (Token Auth)
- **Baza podataka:** MySQL 8.0
- **DevOps & Cloud:** Docker, Docker Compose, GitHub Actions (CI/CD), Vercel (Front), Render (Back)

---

## 👥 Uloge korisnika
1. **Admin** - Potpuna kontrola, upravljanje korisnicima, dodavanje/brisanje opreme, odobravanje/brisanje prijavljenih radova
2. **Researcher** - Aktivni učesnik: kreira projekte, dodaje PDF radove, vodi eksperimente i uzorke, rezerviše opremu
3. **User** - Režim pregleda: pretraga radova, preuzimanje PDF-a, čuvanje radova u ličnu "Omiljenu" kolekciju

---

## 🚀 Pokretanje aplikacije (Lokalno)

Projekat je potpuno **dockerizovan**. Nema potrebe za lokalnom instalacijom PHP-a ili Node.js-a.

### Korak 1: Kloniranje
```bash
git clone https://github.com/vas-username/researchhub.git
cd researchhub
```

### Korak 2: Pokretanje Docker Compose
```bash
docker-compose up -d --build
```

Ova komanda će:
- Podigla MySQL bazu (researchhub)
- Pokrenula automatske migracije baze (`migrate:fresh --seed`)
- Startovati Backend i Frontend kontejner

### Korak 3: Pristup aplikaciji
- **Frontend aplikacija:** http://localhost:3000
- **Laravel Backend API:** http://localhost:8000/api

---

## 🔑 Testni Nalozi (Seederi)

Lozinka za sve naloge je: `password123`

| Uloga | Email | Lozinka |
|-------|-------|---------|
| Admin | admin@researchhub.app | password123 |
| Istraživač | marija@researchhub.app | password123 |
| Korisnik | stefan@researchhub.app | password123 |

---

## 📚 API Dokumentacija (Swagger)

API specifikacija je automatski generisana pomoću Swagger (OpenAPI) alata.

Nakon podizanja Docker kontejnera, Swagger UI interfejsu pristupate na:

👉 **http://localhost:8000/api/documentation**

Tamo možete:
- Videti sve dostupne rute
- Testirati rutte direktno iz interfejsa
- Uneti Bearer token klikom na "Authorize" dugme

---

## 🛡 Implementirane bezbednosne mere

Aplikacija je zaštićena od najčešćih ranjivosti:

### 1. **XSS (Cross-Site Scripting)**
- **Backend:** `SanitizeInputMiddleware` briše opasne tagove pre baze
- **Frontend:** Koristi `DOMPurify` za renderovanje
- **Headers:** Dodat je `Content-Security-Policy` header

### 2. **IDOR (Insecure Direct Object Reference)**
- Implementirane su **Laravel Policies**
- Korisnik ne može brisati tuđe projekte ili rezervacije
- API vraća **403 Forbidden** ako nema dozvole

### 3. **Brute Force / Rate Limiting**
- Konfigurisani Limiteri na backendu
- Login: 10 pokušaja po minuti
- Registracija: 5 pokušaja po minuti
- Opšti API zahtevi: 60 po minuti

### 4. **SQL Injection**
- Korišćen **Laravel Eloquent ORM**
- Koristi **PDO Prepared Statements** automatski
- Korisnički input se NIKADA ne konkatenira direktno

### 5. **CORS & CSRF**
- Konfigurisan `config/cors.php`
- Dozvoljava pristup samo navedenim frontend domenama
- Koristi **Laravel Sanctum** za Bearer token autentifikaciju

---

## 🌐 Eksterni API servisi

Aplikacija komunicira sa 2 eksterna servisa:

1. **Google reCAPTCHA v3**
   - Zaštićuje rute za Login i Registraciju
   - Invisible token integracija
   - Verifikacija na backendu

2. **Resend (Email API)**
   - Welcome email pri registraciji
   - Notifikacije Adminu
   - Obaveštenja autorima radova

---

## 📊 CI/CD i Testovi (GitHub Actions)

Implementiran je **CI/CD pipeline** u `.github/workflows/ci.yml`.

Na svaki push ili Pull Request na `main` i `develop` grane automatski se pokreću:

- ✅ **Backend testovi (PHPUnit)** - Autentifikacija, IDOR zaštita, preklapanje rezervacija
- ✅ **Frontend testovi (Vitest)** - Renderovanje komponenti, DOMPurify zaštita, validacija
- ✅ **Docker build provera** - Verifikacija da se images uspešno bilduju

### Pokretanje testova lokalno (u Docker kontejneru)
```bash
docker exec -it researchhub_backend php artisan test
docker exec -it researchhub_frontend npm run test:run
```

---

## 🌳 Git Grane (Branching Strategy)

Projekat prati **profesionalni Git flow**:

- **main** - Stabilna, produkciona verzija (povezana na Cloud)
- **develop** - Integraciona grana za testiranje pred puštanje
- **feature/*** - Grane za new features (npr. `feature/docker`, `feature/tests`)

---

## ☁️ Cloud Deployment

### Frontend (Vercel)
1. Povežite GitHub repozitorijum sa Vercel
2. Vercel će automatski detektovati `lab-front` direktorijum
3. `vercel.json` konfiguracija osigurava React Router routing
4. Deploy je automatski na svakom push na `main`

### Backend (Render.com)
1. Povežite GitHub repozitorijum sa Render
2. Render čita `render.yaml` za Infrastructure as Code
3. Automatski builduje Docker image i deployuje
4. PostgreSQL baza se automatski kreira
5. Environment varijable se postavljaju kroz Render Dashboard

---

## 📁 Projektna struktura

```
researchhub/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions pipeline
├── lab-backend/                    # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/       # API kontroleri (sa Swagger anotacijama)
│   │   ├── Models/                 # Eloquent modeli
│   │   ├── Policies/               # IDOR zaštita
│   │   └── Services/               # Poslovna logika
│   ├── database/
│   │   ├── migrations/             # Struktura baze
│   │   ├── factories/              # Test data generators
│   │   └── seeders/                # Inicijalni podaci
│   ├── tests/                      # PHPUnit testovi
│   ├── Dockerfile                  # PHP 8.2 FPM
│   └── docker-entrypoint.sh        # Automatske migracije
├── lab-front/                      # React aplikacija
│   ├── src/
│   │   ├── components/             # React komponente
│   │   ├── pages/                  # Stranice (React Router)
│   │   ├── utils/                  # Utility funkcije (sanitize.js)
│   │   └── tests/                  # Vitest testovi
│   ├── Dockerfile                  # Multi-stage Node + Nginx
│   ├── nginx.conf                  # SPA routing
│   ├── vite.config.js              # Vite konfiguracija
│   └── vercel.json                 # Vercel SPA routing
├── docker-compose.yml              # Kompletna infrastruktura
├── render.yaml                     # Render.com IaC
└── README.md                       # Ova dokumentacija
```

---

## 🎓 Autori

Projekat je izrađen kao deo predmeta **Tehnologije u Internetu** (Internet Tehnologije).

---

## 📄 Licenca

MIT License - Slobodno ga koristite i menjajte!
