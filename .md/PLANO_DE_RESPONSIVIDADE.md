# Plano de Ação para Responsividade Absoluta

Este documento detalha um plano em 3 fases para refatorar a aplicação `tarefas-daily` e garantir uma experiência de usuário fluida e consistente em todos os tamanhos de tela, de dispositivos móveis pequenos a desktops largos.

---

## Fase 1: Fundações e Layout Principal

**Meta:** Estabelecer um "esqueleto" de layout global que seja inerentemente responsivo, focando na navegação principal (sidebar) e na estrutura da página.

### Tarefas Detalhadas:

1.  **Revisão dos Breakpoints do Tailwind:**
    *   Verificar o arquivo `tailwind.config.ts` para garantir que os breakpoints padrão (`sm`, `md`, `lg`, `xl`, `2xl`) são adequados para o design. Manter os padrões do Tailwind é geralmente a melhor prática, a menos que um design muito específico exija alterações.

2.  **Implementar o Padrão "Mobile-First" para a Sidebar (`AppSidebar`):**
    *   **Em telas pequenas (abaixo de `md`):** A sidebar deve ficar oculta por padrão. Um botão "hamburger" no cabeçalho principal se tornará visível para controlar a exibição da sidebar.
    *   **Ação do Botão Hamburger:** Ao ser clicado, a sidebar deve surgir como um *overlay* sobre o conteúdo principal, com um fundo escurecido (`backdrop`) para focar a naveção.
    *   **Em telas médias e grandes (`md` e acima):** A sidebar deve se comportar como está hoje, sendo visível e colapsável, empurrando o conteúdo principal. O botão "hamburger" deve ser ocultado.
    *   **Hook `use-mobile`:** Utilizar o hook `use-mobile` ou uma consulta de mídia CSS para alternar entre esses dois comportamentos.

3.  **Ajustar o Cabeçalho Principal (`Dashboard.tsx`):**
    *   O cabeçalho que contém o título "Dashboard" e o botão "Nova Tarefa" deve se adaptar.
    *   **Em telas pequenas:** O título pode ter seu tamanho de fonte reduzido. O texto do botão "Nova Tarefa" pode ser substituído por apenas um ícone de `+` para economizar espaço.

---

## Fase 2: Componentes de Conteúdo e Densidade de Informação

**Meta:** Garantir que os componentes que exibem dados (`StatsCard`, `TaskCard`, filtros) se adaptem para apresentar a informação de forma clara, sem quebras de layout ou excesso de informação em telas menores.

### Tarefas Detalhadas:

1.  **`StatsCard` (Cartões de Estatísticas):**
    *   A grade `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` já é um ótimo começo.
    *   **Ação:** Verificar se os textos e números dentro dos cartões não quebram ou ficam pequenos demais em telas `sm`. Se necessário, ajustar o tamanho da fonte (`text-sm sm:text-base`).

2.  **`TaskCard` (Cartão de Tarefa):**
    *   Este é um componente crítico. O layout interno precisa ser flexível.
    *   **Cabeçalho do Card:** O título da tarefa deve ter quebra de linha (`flex-wrap`) para evitar que empurre os botões de estrela e menu.
    *   **Rodapé do Card:** A seção com prioridade, projeto, responsável e data é a mais propensa a quebrar.
        *   **Ação:** Usar `flex-wrap` no container do rodapé para que os itens que não couberem na mesma linha passem para a linha de baixo.
        *   **Otimização para Mobile:** Em telas muito pequenas (`xs`), podemos ocultar informações menos críticas (como o nome do responsável, deixando talvez só um avatar) ou abreviar textos (ex: "Prioridade Alta" -> "Alta").

3.  **Filtros de Tarefas (`Dashboard.tsx`):**
    *   O padrão `flex-col sm:flex-row` já é o correto.
    *   **Ação:** Garantir que os `Select` e o `Input` de busca ocupem 100% da largura (`w-full`) quando em modo `flex-col` para melhor usabilidade em telas pequenas.

---

## Fase 3: Modais, Formulários e Polimento Final

**Meta:** Assegurar que elementos interativos como modais e formulários sejam totalmente usáveis em dispositivos de toque e realizar uma varredura final para corrigir inconsistências.

### Tarefas Detalhadas:

1.  **`TaskModal` (Modal de Tarefa):**
    *   Modais padrão podem ser difíceis de usar em telas pequenas.
    *   **Ação:** Usar o componente **`Drawer`** do `shadcn/ui`. Podemos usar um hook de responsividade para renderizar um `<Dialog>` (modal) em telas de desktop (`md` e acima) e um `<Drawer>` (painel que desliza de baixo para cima) em telas móveis. Isso é uma prática moderna e muito amigável ao usuário.

2.  **Tamanho de Alvos de Toque (Tap Targets):**
    *   **Ação:** Revisar todos os botões e elementos clicáveis (`DropdownMenu`, `Checkbox`, etc.) para garantir que tenham uma área de toque mínima adequada (padrão recomendado é 44x44 pixels), evitando cliques acidentais em dispositivos móveis. O `shadcn/ui` geralmente lida bem com isso, mas uma verificação manual é importante.

3.  **Remover Dependência de Hover:**
    *   Ações que aparecem apenas com `hover` (passar o mouse) não funcionam no toque.
    *   **Ação:** O `TaskCard` já faz isso corretamente ao colocar as ações de "Editar" e "Excluir" dentro de um `DropdownMenu` (que é ativado por clique/toque), o que é perfeito. Manter esse padrão.

4.  **Teste Final em Dispositivos Reais:**
    *   **Ação:** Após a implementação das fases 1 a 3, realizar testes manuais usando as ferramentas de desenvolvedor do navegador para simular diferentes dispositivos. Se possível, testar em um celular e tablet reais para ter a sensação real da interação.
