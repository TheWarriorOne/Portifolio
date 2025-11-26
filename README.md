cat > README.md <<EOF

# Portifolio - Gerenciador de Imagens

Aplicação para upload, listagem e exclusão de imagens, com backend em Node.js/Express e frontend em React/Vite.

## Instalação

1. Clone o repositório:
   \`\`\`bash
   git clone <TheWarriorOne/Portifolio>
   cd Portifolio
   \`\`\`

2. Instale dependências do backend:
   \`\`\`bash
   cd backend
   pnpm install
   \`\`\`

3. Instale dependências do frontend:
   \`\`\`bash
   cd ../frontend
   pnpm install
   \`\`\`

4. Configure variáveis de ambiente:
   \`\`\`bash
   cp backend/.env.example backend/.env
   \`\`\`

5. Rode o backend:
   \`\`\`bash
   cd backend
   pnpm dev
   \`\`\`

6. Rode o frontend:
   \`\`\`bash
   cd ../frontend
   pnpm dev
   \`\`\`

7. Acesse `http://localhost:5173`.

## Endpoints

- **GET /**: Verifica se a API está online.
- **POST /api/upload**: Faz upload de uma imagem.
- **GET /images**: Lista imagens.
- **DELETE /images/:name**: Exclui uma imagem.

## Tecnologias

- Backend: Node.js, Express, Multer, file-type
- Frontend: React, Vite, Axios, Tailwind CSS
- Ferramentas: pnpm, nodemon, Git

## Licença

MIT
EOF
