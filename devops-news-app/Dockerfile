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
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración de nginx para SPA
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
    try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
    proxy_pass http://api:3000/api/; \
    proxy_set_header Host $host; \
    proxy_set_header X-Real-IP $remote_addr; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]