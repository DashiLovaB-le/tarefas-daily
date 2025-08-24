# Tarefas Daily - Gerenciador de Tarefas Moderno

Um moderno e responsivo gerenciador de tarefas (To-Do list) construído com as tecnologias mais recentes do ecossistema React, projetado para organizar seu dia a dia com eficiência e estilo.

<!-- Adicione um screenshot da aplicação aqui quando possível -->
<!-- ![Screenshot da Aplicação](caminho/para/screenshot.png) -->

---

## ✨ Funcionalidades

### Gerenciamento Completo de Tarefas
- **Criação Rápida:** Adicione novas tarefas através de um modal intuitivo.
- **Edição e Exclusão:** Modifique ou remova tarefas com facilidade.
- **Status da Tarefa:** Marque tarefas como **concluídas** ou **pendentes** com um único clique.
- **Priorização:** Destaque tarefas importantes marcando-as como **favoritas** (com estrela).
- **Atributos Detalhados:** Adicione contexto às suas tarefas com:
  - Prioridade (Alta, Média, Baixa)
  - Data de Vencimento
  - Projeto Associado
  - Responsável pela Tarefa

### Organização e Visualização Inteligente
- **Dashboard Principal:** Tenha uma visão geral do seu progresso com estatísticas de tarefas totais, pendentes, concluídas e para hoje.
- **Filtros Dinâmicos:** Encontre o que precisa rapidamente com:
  - **Busca por texto** no título e na descrição.
  - **Filtro por status** (pendentes ou concluídas).
  - **Filtro por prioridade**.
- **Vistas Dedicadas:** Navegue por seções pré-definidas para focar no que importa:
  - `Hoje`: Tarefas com vencimento no dia atual.
  - `Próximas`: Tarefas futuras.
  - `Favoritas`: Tarefas marcadas com estrela.
  - `Concluídas`: Histórico de tarefas finalizadas.
- **Agrupamento por Projetos:** Organize e visualize tarefas dentro de contextos ou projetos específicos.

### Experiência do Usuário
- **Design Responsivo:** A interface se adapta perfeitamente a desktops, tablets e celulares.
- **Tema Claro e Escuro (Light/Dark Mode):** Alterne entre os temas para melhor conforto visual (dependência `next-themes` inclusa).
- **Notificações (Toasts):** Receba feedback visual para ações como criação ou exclusão de tarefas.
- **Navegação Intuitiva:** Uma sidebar lateral colapsável permite focar no conteúdo e navegar facilmente entre as seções.

---

## 🚀 Tecnologias Utilizadas

- **Framework Frontend:** [React](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI:** [shadcn/ui](https://ui.shadcn.com/)
- **Roteamento:** [React Router DOM](https://reactrouter.com/)
- **Gerenciamento de Estado de Servidor:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Gerenciamento de Formulários:** [React Hook Form](https://react-hook-form.com/)
- **Validação de Esquemas:** [Zod](https://zod.dev/)
- **Ícones:** [Lucide React](https://lucide.dev/)

---

## 🏁 Como Executar o Projeto

Para executar este projeto localmente, siga os passos abaixo.

**Pré-requisitos:**
- [Node.js](https://nodejs.org/en) (versão 18 ou superior)
- Um gerenciador de pacotes como `npm`, `yarn` ou `bun`.

**Passos:**

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO_GIT>
    cd tarefas-daily
    ```

2.  **Instale as dependências:**
    ```bash
    # Se você usa Bun (recomendado, pois o projeto tem bun.lockb)
    bun install

    # Ou com npm
    npm install

    # Ou com yarn
    yarn install
    ```

3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    bun run dev
    ```
    O servidor iniciará em `http://localhost:5173` (ou outra porta, se a 5173 estiver em uso).

---

## 📜 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento com Vite.
- `npm run build`: Compila a aplicação para produção.
- `npm run lint`: Executa o ESLint para analisar o código em busca de erros e problemas de estilo.
- `npm run preview`: Inicia um servidor local para visualizar a build de produção.