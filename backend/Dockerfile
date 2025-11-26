FROM node:18-alpine
WORKDIR /app

# copiar apenas package.json para aproveitar cache
COPY package*.json ./

# instalar dependências de produção
RUN npm install --production

# copiar o restante do código
COPY . .

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]
