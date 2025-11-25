FROM node:18-alpine
WORKDIR /app

# copiar apenas package*
COPY package*.json ./

# bloquear comportamento de links do pnpm
RUN npm config set fund false \
    && npm config set package-lock true \
    && npm config set legacy-peer-deps true \
    && npm config set omit dev \
    && npm config set link=false \
    && npm config set node-linker=default

# instalar dependências sem symlinks
RUN npm install --production

# copiar resto do app
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "run", "start"]
