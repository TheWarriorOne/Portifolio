# Capa

- **Título do Projeto**: E-coGram.
- **Nome do Estudante**: Michael Aparecido Varaldo.
- **Curso**: Engenharia de Software.
- **Data de Entrega**: [xx/xx/xxxx].

# Resumo
O projeto E-coGram consiste na criação de uma página web para controle de imagens em um e-commerce, voltada para administradores de conteúdo. A ferramenta facilita a seleção, organização e envio de imagens de produtos, integrando-se ao site existente. Com uma interface intuitiva, uploads eficientes e foco na curadoria visual, espera-se reduzir o tempo de publicação e minimizar erros operacionais, melhorando a experiência do cliente final.

## 1. Introdução

O projeto surge no âmbito de um e-commerce que necessita de uma solução eficiente para gerenciar o conteúdo visual de seus produtos. Com o aumento da demanda por atualizações rápidas e precisas no site, o manual de manipulação de imagens torna-se um processo demorado e suscetível a erros, impactando a experiência do usuário e a agilidade operacional.

Justificativa:
Imagens de qualidade são cruciais no e-commerce, com estudos indicando que 80% dos consumidores consideram o conteúdo visual um fator decisivo na compra (Fonte: Nielsen, 2023). A automação de processos repetitivos, uma prática central na engenharia de software, aumenta a eficiência e reduz falhas. O E-coGram é relevante por otimizar a curadoria visual, alinhando-se a tendências de DevOps e escalabilidade, contribuindo para a agilidade operacional e a satisfação do cliente.

Objetivos:
- Principal: Desenvolver uma página de controle de imagens que simplifique a seleção e envio de imagens para um e-commerce, otimizando o fluxo de publicação.

- Secundários:
 - Criar uma interface com tempo de aprendizado inferior a 5 minutos.
 - Garantir integração confiável com a API do e-commerce.
 - Desenvolver uma solução expansível para futuras funcionalidades, como categorização avançada.

## 2. Descrição do Projeto

O E-coGram é uma aplicação web standalone para administradores de conteúdo de um e-commerce, permitindo selecionar, organizar e enviar imagens de produtos de forma eficiente. A ferramenta será integrada ao sistema existente do site, com foco em usabilidade e otimização do processo de publicação visual.

Problemas a Solucionador:
Ineficiência no gerenciamento manual: Eliminar o tempo excessivo gasto na seleção e upload de imagens realizadas de forma manual.
Falta de organização: Resolver a desordem no fluxo de imagens, garantindo que apenas as selecionadas sejam enviadas ao site.
Erros humanos: Reduzir inconsistências ou falhas no processo de publicação, como envio de imagens erradas ou duplicadas.
Dificuldade de integração: Facilitar a conexão entre o controle de imagens e a plataforma de e-commerce já em uso.

Limitações:
O projeto não abordará o desenvolvimento de um sistema completo de edição de imagens (como configurações de tamanho ou filtros), focando apenas na seleção e envio. Também não incluirá a criação de uma infraestrutura de armazenamento de imagens, assumindo que o e-commerce já possui um servidor ou banco de dados para essa finalidade. Por fim, questões relacionadas à segurança avançada, como criptografia de dados, serão exclusivas do escopo inicial, sendo consideradas como possíveis melhorias futuras.

## 3. Especificação Técnica
Descrição detalhada da proposta, incluindo requisitos de software, protocolos, algoritmos, procedimentos, formatos de dados, etc.

## 3.1. Requisitos de Software

**Requisitos Funcionais (RF):**

- RF01: O sistema deve permitir que o usuário faça upload de imagens a partir de seu dispositivo local.
- RF02: O sistema deve exibir uma pré-visualização das imagens selecionadas antes do envio.
- RF03: O sistema deve permitir a organização das imagens por meio de arrastar e soltar.
- RF04: O sistema deve possibilitar a exclusão de imagens selecionadas antes do envio.
- RF05: O sistema deve integrar-se à API do e-commerce para envio das imagens ao servidor.
- RF06: O sistema deve notificar o usuário sobre o sucesso ou falha do upload de imagens.
- RF07: O sistema deve permitir a seleção de múltiplas imagens simultaneamente.
 
**Requisitos Não-Funcionais (RNF):**

- RNF01: A interface deve ser intuitiva e responsiva, com tempo de carregamento inferior a 2 segundos em conexões de 10 Mbps.
- RNF02: O sistema deve suportar até 100 imagens por sessão de upload sem degradação de desempenho.
- RNF03: A aplicação deve ser compatível com os navegadores Chrome, Firefox, Safari e Edge (versões mais recentes).
- RNF04: O sistema deve garantir que as imagens sejam exibidas com resolução adequada para pré-visualização (máximo de 1 MB por imagem).
- RNF05: A aplicação deve ser escalável para suportar até 100 usuários simultâneos.

Representação dos Requisitos:

![Diagrama de Casos de Uso](./Caso_de_uso_uml.png)

## 3.2. Considerações de Design

O design da aplicação prioriza simplicidade e eficiência, com uma interface de usuário minimalista para reduzir a curva de aprendizado. Foram consideradas duas abordagens principais:

- Aplicação Monolítica: Simplicidade no desenvolvimento, mas limitada para CI/CD e escalabilidade.
- Arquitetura Baseada em Componentes: Flexibilidade e reutilização, com maior complexidade inicial. Escolhida por suportar expansões futuras.

Visão Inicial da Arquitetura

A arquitetura da aplicação é composta por três camadas principais:

- Frontend: Interface React para interação.
- Backend: API RESTful para comunicação com o servidor do e-commerce, implementada com Node.js e Express.
- Serviço Externo: Integração com o servidor de armazenamento de imagens do e-commerce.

Padrões de Arquitetura

O padrão MVC (Model-View-Controller) será utilizado no frontend:

- Model: Gerencia os dados das imagens (seleção, organização, status).
- View: Interface gráfica com componentes React.
- Controller: Lógica de interação, como manipulação de eventos de upload e arrastar/soltar.

No backend, será adotada uma abordagem Endpoints como /upload e /status seguem padrões RESTful para simplicidade.

**Modelos C4**

Nível 1: Contexto

![Modelo C4](./ModeloC4.png)

Nível 2: Contêineres

- Aplicação Web: React, via HTTPS.
- API Gateway: Node.js/Express, HTTPS.
- Serviço de Armazenamento: Servidor externo do e-commerce.

Nível 3: Componentes

- Upload: Usa FileReader para leitura de arquivos.
- Visualização: Componente React para pré-visualizações.
- Notificação: Exibe alertas com react-toastify.
- API Client: Integra com a API do e-commerce.

Nível 4: Códigos: 

Os componentes React serão estruturados em arquivos JSX, com hooks para gerenciamento de estado (useState, useEffect).

Exemplo:

```javascript
app.post('/upload', (req, res) => {
  // Lógica de upload
  res.status(200).json({ message: 'Upload concluído' });
});
```

## 3.3. Stack Tecnológica

Linguagens de Programação

- JavaScript (ES6+): Escolhido para o frontend e backend devido à sua ampla adoção, suporte a frameworks modernos e integração com APIs REST.
- HTML5/CSS3: Para estruturação e estilização da interface.

Frameworks e Bibliotecas

- React (18.x): Para construção de componentes reutilizáveis e gerenciamento dinâmico da interface.
- Node.js (20.x) com Express: Para criação da API RESTful, devido à sua leveza e compatibilidade com JavaScript.
- Tailwind CSS: Para estilização rápida e responsiva da interface.
- Axios: Para chamadas HTTP à API do e-commerce.
- React-DnD: Para funcionalidade de arrastar e soltar.
- React Hook Form: Validação de formulários.
- Jest: Testes unitários.

Ferramentas de Desenvolvimento e Gestão de Projeto

- VS Code: Editor de código com suporte a extensões para JavaScript e React.
- Git/GitHub: Controle de versão e colaboração.
- Vite: Ferramenta de build para o frontend, por sua rapidez e suporte a React.
- Postman: Teste de APIs durante o desenvolvimento.

Outras Tecnologias

- ESLint/Prettier: Para padronização e formatação de código.
- Vitest: Para testes unitários no frontend.

## 3.4. Considerações de Segurança

Análise de Riscos

- Upload de Arquivos Maliciosos: Arquivos não-imagem ou com scripts maliciosos podem ser enviados.
- Ataques de Negação de Serviço (DoS): Uploads massivos podem sobrecarregar o servidor.
- Acesso Não Autorizado: Usuários não autenticados podem tentar acessar a API.

Mitigações

- Validação de Arquivos: file-type para restringir a JPEG, PNG, WEBP (< 5 MB).
- Rate Limiting: Limitar requisições na API.
- Cabeçalhos HTTP: Implementar Content-Security-Policy contra XSS.
- Sanitização: Verificar entradas no frontend e backend.
- Privacidade: Remover metadados com bibliotecas como exif-js.

## 4. Próximos Passos
| Fase                  | Atividade                                     | Prazo         |
|-----------------------|----------------------------------------------|---------------|
| **Portfólio I**       |                                              |               |
| Prototipagem          | Desenvolvimento da UI com React              | 01/06/2025    |
| Backend               | Implementação da API com Express             | 10/06/2025    |
| Integração            | Conexão com API do e-commerce                | 15/06/2025    |
| Testes Iniciais       | Testes unitários e de integração             | 30/06/2025    |
| Deploy em Staging     | Implantação em ambiente de staging           | 05/07/2025    |

## 5. Referências
Sommerville, I. (2018). Engenharia de Software, 10ª ed. Pearson.

Nielsen Norman Group. (2023). E-commerce UX: The Impact of Visual Content.

React Documentation. (2025). Disponível em: https://react.dev/.

Node.js v20.10.0 Documentation. (2025). Disponível em: https://nodejs.org/.

Tailwind CSS Documentation. (2025). Disponível em: https://tailwindcss.com/.

Pressman, R., & Maxim, B. (2020). Software Engineering: A Practitioner's Approach, 9ª ed. McGraw-Hill.

WCAG 2.1 Guidelines. (2025). Disponível em: https://www.w3.org/WAI/standards-guidelines/wcag/.

Shopify Case Study: Image Optimization. (2024). Disponível em: https://shopify.dev/.

## 6. Apêndices (Opcionais)

Wireframe (Descrição Textual)

- Tela Principal: Barra superior com botão "Upload"; grade central com pré-visualizações (arrastar/soltar); botão "Enviar" no canto inferior direito.
- Notificações: Pop-up no canto superior direito para sucesso/erro.

Especificações da API
- POST /upload: Envia imagens ao servidor. Parâmetros: images (array de base64). Resposta: { status: 'success', message: 'Upload concluído' }.
- GET /status: Verifica status do upload. Resposta: { uploaded: number, failed: number }.

## 7. Avaliações de Professores
Adicionar três páginas no final do RFC para que os Professores escolhidos possam fazer suas considerações e assinatura:

Considerações Professor/a:
Considerações Professor/a:
Considerações Professor/a:

