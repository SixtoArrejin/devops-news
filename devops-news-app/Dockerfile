# Dockerfile para DevOps News Frontend - Multi-stage con Debian
# Etapa 1: Build con Debian (más compatible)
FROM node:20-bullseye AS builder

WORKDIR /app

# Instalar dependencias del sistema que Vite/Rollup necesita
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias
COPY package*.json ./

# Limpiar e instalar dependencias
RUN npm cache clean --force
RUN rm -rf node_modules package-lock.json
RUN npm install

# Copiar código fuente
COPY . .

# Hacer build de producción
RUN npm run build

# Etapa 2: Servidor con nginx
FROM nginx:alpine

# Copiar archivos construidos desde la etapa anterior
COPY --from=builder /app/build /usr/share/nginx/html

# Crear template de configuración de nginx
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
    try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
    proxy_pass ${API_URL}/api/; \
    proxy_set_header Host $host; \
    proxy_set_header X-Real-IP $remote_addr; \
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
    proxy_set_header X-Forwarded-Proto $scheme; \
    } \
    }' > /etc/nginx/conf.d/default.conf.template

# Crear script de inicio que sustituye variables
RUN echo '#!/bin/sh\n\
    # Sustituir variables de entorno en la configuración\n\
    envsubst "\$API_URL" < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf\n\
    # Iniciar nginx\n\
    nginx -g "daemon off;"\n\
    ' > /start-nginx.sh && chmod +x /start-nginx.sh

EXPOSE 80

# Variable de entorno por defecto para desarrollo local
ENV API_URL=http://localhost:3000

CMD ["/start-nginx.sh"]