# lab-front/Dockerfile

# STAGE 1: Build aplikacije
FROM node:20-alpine AS builder

WORKDIR /app

# Kopiranje package fajlova i instalacija zavisnosti
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Kopiranje celog koda i bildovanje
COPY . .
RUN npm run build


# STAGE 2: Serviranje pomoću Nginx-a
FROM nginx:alpine

# Uklanjanje default Nginx statičnih fajlova
RUN rm -rf /usr/share/nginx/html/*

# Kopiranje buildovanih fajlova iz prvog stage-a
COPY --from=builder /app/dist /usr/share/nginx/html

# Kopiranje custom Nginx konfiguracije za React Router (SPA)
# Build kontekst je roditeljski direktorijum, pa referenciraj lab-front/nginx.conf
COPY lab-front/nginx.conf /etc/nginx/conf.d/default.conf

# Otvaranje porta 3000
EXPOSE 3000

# Pokretanje Nginxa
CMD ["nginx", "-g", "daemon off;"]
