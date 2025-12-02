# Stage 1: builder (instala dependências)
FROM node:18-bullseye-slim AS builder
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /app

# Copia apenas package files para aproveitar cache
COPY package*.json ./

# Instala dependências de produção (omitir dev)
RUN npm ci --omit=dev

# Copia código-fonte
COPY . .

# Stage 2: runtime (imagem final enxuta)
FROM node:18-bullseye-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    LANG=en_US.UTF-8 \
    LC_ALL=en_US.UTF-8 \
    PYTHONIOENCODING=utf-8

# Copia node_modules e app do builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# Cria usuário não-root e ajusta permissões
RUN groupadd -r app && useradd -r -g app app \
    && chown -R app:app /app

USER app

EXPOSE 3000

# Opcional: HEALTHCHECK se você tiver endpoint de health
# HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
