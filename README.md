cat > README.md <<EOF

# E-coGram — Gerenciador de Imagens para E-commerce

Sistema completo para upload, organização, ordenação e exclusão de imagens utilizando Node.js/Express, React/Vite, MongoDB Atlas (GridFS) e hospedagem em AWS EC2.

# Acesso ao Sistema

Caro Professor(a)
para acessar o sistemas usar a URL abaixo

http://13.222.123.211:5173/

Login: admin / Senha: Eco1234!

Motivo: Tive um problema com as tasks do ECS (AWS) onde estavam subindo e ficando Stopped, com isso a ligação do front com o Back não estava acontecendo, por isso foi necessario refazer as conexões em EC2, por esse motivo a URL diferente. 

# Funcionalidades
✅ Upload de múltiplas imagens via GridFS

✅ Cadastro produtos (ID, grupo, descrição)

✅ Ordenação das imagens via drag-and-drop

✅ Persistência da nova ordem no MongoDB

✅ Exclusão de imagens (remove do GridFS + do produto)

✅ Listagem de produtos + preview das imagens

✅ API REST estruturada

✅ Autenticação por login (JWT)

✅ Frontend otimizado em React + Vite

# Arquitetura
Frontend (React/Vite)  →  CloudFront  →  EC2 (Nginx opcional)
Backend (Node.js/Express)  →  EC2
MongoDB Atlas (GridFS) →  Armazenamento das imagens

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/TheWarriorOne/Portifolio.git
   cd Portifolio
   ```

2. Instale dependências do backend:
   ```bash
   cd backend
   pnpm install
     ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```

   Edite .env com::
   ```bash
   MONGODB_URI=<sua conexão Atlas>
   JWT_SECRET=<seu segredo>
   GRIDFS_BUCKET=uploads
   PORT=3000
   ```

4. Rode o backend:
   ```bash
   pnpm dev
   ```

5. Acesse `http://localhost:3000`.  

6. Instale dependências do frontend:
   ```bash
   cd ../frontend
   pnpm install
   ```

7. Configure as variáveis de ambiente:
   ```bash
   VITE_API_URL=http://localhost:3000/api
   ```

8. Rode o frontend:
   ```bash
   pnpm dev
   ```

9. Acesse `http://localhost:5173`.

## Endpoints

- **GET /**: Verifica se a API está online.
- **POST /api/upload**: Faz upload de uma imagem.
- **GET /api/products**: Lista os produtos cadastrados.
- **PUT /api/products/:id/order**: Atualizar ordem das imagens.
- **POST /api/uploads** Enviar imagens + dados
- **DELETE /api/products/:id/image/:identifier**: Exclui uma imagem.

## Tecnologias

- Backend: Node.js, Express, Multer, file-type, MongoDB Atlas + GridFS, JWT
- Frontend: React, Vite, Axios, Tailwind CSS, React DnD
- Infra: AWS EC2, MongoDB Atlas
- Ferramentas: pnpm, nodemon, Git

## Licença

MIT

