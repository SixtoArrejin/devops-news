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

# Instalar gettext para envsubst
RUN apk add --no-cache gettext

# Copiar archivos construidos desde la etapa anterior
COPY --from=builder /app/build /usr/share/nginx/html

# Crear template de configuración de nginx
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    \n\
    location / {\n\
    try_files $uri $uri/ /index.html;\n\
    }\n\
    \n\
    location /api/ {\n\
    proxy_pass ${API_URL}/api/;\n\
    proxy_set_header Host $host;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
    proxy_set_header X-Forwarded-Proto $scheme;\n\
    }\n\
    }\n' > /etc/nginx/conf.d/default.conf.template

# Crear script de inicio que sustituye variables
RUN printf '#!/bin/sh\n# Sustituir variables de entorno en la configuración\nenvsubst "$API_URL" < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf\n# Iniciar nginx\nexec nginx -g "daemon off;"\n' > /start-nginx.sh && \
    chmod +x /start-nginx.sh

EXPOSE 80

# Variable de entorno por defecto para desarrollo local
ENV API_URL=http://localhost:3000

CMD ["/start-nginx.sh"]