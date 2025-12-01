# Dockerfile (opção A: Debian slim com apt-get)
FROM node:18-bullseye-slim

WORKDIR /app

# instalar locales e gerar en_US.UTF-8
RUN apt-get update && apt-get install -y locales \
    && sed -i 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen \
    && locale-gen en_US.UTF-8 \
    && rm -rf /var/lib/apt/lists/*

# variáveis de ambiente
ENV LANG=en_US.UTF-8 \
    LC_ALL=en_US.UTF-8 \
    PYTHONIOENCODING=utf-8

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["node","src/server.js"]
