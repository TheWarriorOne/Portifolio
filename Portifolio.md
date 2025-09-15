# Michael Aparecido Varaldo

**E-co Gram**  
**Gerenciador de Imagens para E-commerce**  
**Engenharia de Software**

**Data:** 03/07/2025

---

## Resumo

A ideia de criar um gerenciador de imagens surgiu quando eu trabalhava na área de e-commerce, tínhamos um problema para importar e gerenciar as imagens para a plataforma da V-tex, onde a importação tinha que ser imagem a imagem e se caso eu quisesse colocar uma imagem em uma ordem específica tinha que apagar todas as imagens e subir todas novamente na ordem desejada.

O desenvolvimento da aplicação web **E-coGram** visa otimizar o gerenciamento de imagens, oferecendo aos administradores de conteúdo uma solução eficiente. A ferramenta atende à crescente demanda por agilidade e precisão na publicação de imagens, promovendo uma experiência de usuário aprimorada e reduzindo erros operacionais.

---

## 1. Introdução

O projeto surge no âmbito de um e-commerce que necessita de uma solução eficiente para gerenciar o conteúdo visual de seus produtos. Com o aumento da demanda por atualizações rápidas e precisas no site, o manual de manipulação de imagens torna-se um processo demorado e suscetível a erros, impactando a experiência do usuário e a agilidade operacional.

Imagens de qualidade são cruciais no e-commerce, com estudos indicando que 80% dos consumidores consideram o conteúdo visual um fator decisivo na compra (Fonte: Nielsen, 2023). A automação de processos repetitivos, uma prática central na engenharia de software, aumenta a eficiência e reduz falhas.

O **E-coGram** é relevante por otimizar a curadoria visual, alinhando-se a tendências de DevOps e escalabilidade, contribuindo para a agilidade operacional e a satisfação do cliente.

Para alcançar esses benefícios, a aplicação web E-coGram foi projetada para administradores de conteúdo, facilitando a seleção, organização e envio de imagens de produtos, com integração ao site de e-commerce existente. A interface intuitiva e o sistema de uploads eficientes permitem agilizar a curadoria visual, reduzindo o tempo de publicação e minimizando erros operacionais.

A eficiência e a redução de falhas serão mensuradas por meio de métricas como o tempo médio de processamento de imagens e a taxa de erros em uploads, garantindo uma apresentação visual consistente e de alta qualidade, o que melhora a experiência do cliente final.

### Objetivo Principal

Desenvolver um sistema de gerenciamento de imagens que simplifique a seleção, organização e envio de imagens para um e-commerce, integrando-se ao fluxo de publicação para aumentar a eficiência e reduzir o tempo de processamento.

### Objetivos Secundários

- Desenvolver uma interface intuitiva que permita aos usuários realizar a seleção e envio de imagens em menos de 5 minutos, com design focado em usabilidade e feedback visual claro.
- Implementar uma integração estável com a API do e-commerce, garantindo que o envio de imagens ocorra sem erros em pelo menos 99% das tentativas, com tempo de resposta inferior a 2 segundos.
- Projetar uma arquitetura modular que permita adicionar funcionalidades futuras, como categorização automática de imagens por tipo ou tamanho, sem comprometer o desempenho do fluxo de publicação atual.

---

## 2. Descrição do Projeto

O projeto **E-coGram** é uma aplicação web para administradores de um e-commerce, independentemente do tipo de negócio, projetado para otimizar a organização, seleção e upload de imagens de produtos.

### Problemas a Solucionar

- **Ineficiência no gerenciamento manual:** eliminar o tempo excessivo gasto na seleção e upload de imagens realizadas de forma manual.
- **Falta de organização:** resolver a desordem no fluxo de imagens, garantindo que apenas as selecionadas sejam enviadas ao site.
- **Erros humanos:** reduzir inconsistências ou falhas no processo de publicação, como envio de imagens erradas ou duplicadas.
- **Dificuldade de integração:** facilitar a conexão entre o controle de imagens e a plataforma de e-commerce já em uso.

### Limitações

- O projeto não incluirá o desenvolvimento de um sistema completo de edição de imagens.
- Não será desenvolvida uma infraestrutura própria de armazenamento de imagens.
- Questões de segurança avançada, como criptografia de dados, não serão abordadas no escopo inicial.

---

## 3. Especificação Técnica

A ferramenta será integrada ao sistema existente do e-commerce por meio de uma API, permitindo uploads eficientes e uma interface intuitiva.

### Principais Processos

- **Upload de Imagens:** Seleção de múltiplas imagens em formatos JPEG, PNG ou WEBP, com validação de tipo e tamanho (< 5 MB).
- **Pré-visualização e Organização:** Exibição de miniaturas com funcionalidade de arrastar e soltar para ordenação e categorização por tipo de produto.
- **Envio ao Servidor:** Transmissão das imagens para o servidor do e-commerce via API, com notificações de status.
- **Protocolos:** Comunicação via HTTPS, utilizando requisições POST para envio de dados codificados em base64 e GET para verificação de status.
- **Formatos de Dados:** Imagens codificadas em base64 no frontend e armazenadas no servidor no formato original.
- **Algoritmos:** Validação de arquivos no backend com a biblioteca `file-type`; ordenação de imagens no frontend com lógica de arrastar e soltar via `react-dnd`.
- **Procedimentos:** Login do administrador, seleção, organização, envio e feedback de sucesso ou falha.

A aplicação prioriza usabilidade, escalabilidade (até 100 usuários simultâneos) e compatibilidade com navegadores modernos (Chrome, Firefox, Safari, Edge).

### 3.1 Requisitos de Software e Casos de Uso

**Requisitos Funcionais (RF):**  
RF01 – RF18 (detalhados no documento original).

**Requisitos Não-Funcionais (RNF):**  
RNF01 – RNF10 (detalhados no documento original).

### 3.2 Considerações de Design

- **Arquitetura:** Baseada em componentes, utilizando padrão MVC no frontend (Model, View, Controller).
- **Frontend:** React para interface.
- **Backend:** API RESTful em Node.js/Express.
- **Serviço Externo:** Integração com o servidor de armazenamento de imagens.

### 3.3 Stack Tecnológica

- **Linguagens:** JavaScript (ES6+), HTML5, CSS3.
- **Frameworks e Bibliotecas:** React, Node.js/Express, Tailwind CSS, Axios, React-DnD, React Hook Form, Jest.
- **Ferramentas:** VS Code, Git/GitHub, Vite, Postman, ESLint/Prettier, Vitest.

### 3.4 Considerações de Segurança

- **Riscos:** Upload de arquivos maliciosos, ataques de negação de serviço, acesso não autorizado.
- **Mitigações:** Validação de arquivos, rate limiting, cabeçalhos HTTP, sanitização, remoção de metadados.

---

## 4. Próximos Passos

| Fase            | Atividade                          | Prazo      |
| --------------- | ---------------------------------- | ---------- |
| Portfólio I     | Elaboração Documento RFC           | 10/07/2025 |
| Prototipagem    | Desenvolvimento da UI com React    | 01/09/2025 |
| Frontend        | App React com Vite                 | 10/09/2025 |
| Backend         | Implementação da API com Express   | 20/09/2025 |
| Integração      | Conexão com API do e-commerce      | 10/10/2025 |
| Testes Iniciais | Testes unitários e de integração   | 20/10/2025 |
| Deploy Staging  | Implantação em ambiente de staging | 01/11/2025 |

---

## 5. Referências

- React Documentation
- Node.js v20.10.0 Documentation
- Tailwind CSS Documentation
- Pressman, R., & Maxim, B. (2020). _Software Engineering: A Practitioner's Approach_, 9ª ed. McGraw-Hill.
- WCAG 2.1 Guidelines
- Shopify Case Study: Image Optimization

---

## 6. Apêndices

### Wireframe (Descrição Textual)

- **Tela Principal:** Barra superior com botão "Upload"; grade central com pré-visualizações (arrastar/soltar); botão "Enviar" no canto inferior direito.
- **Notificações:** Pop-up no canto superior direito para sucesso/erro.

### Especificações da API

- **POST /upload:** Envia imagens ao servidor.

  - **Parâmetros:** `images` (array de base64)
  - **Resposta:** `{ status: 'success', message: 'Upload concluído' }`

- **GET /status:** Verifica status do upload.
  - **Resposta:** `{ uploaded: number, failed: number }`

---

## 7. Avaliações de Professores

- **Professor Claudinei Dias:** _[Considerações a serem inseridas]_
- **Professor Luiz Carlos Camargo:** _[Considerações a serem inseridas]_
- **Professora Edicarsia Barbiero Pillon:** _[Considerações a serem inseridas]_
