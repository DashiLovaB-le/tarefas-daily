# Guia para Implementação de Neumorfismo na Interface

Este guia detalha o passo a passo para transformar a interface atual do projeto para um design neumórfico, mantendo a funcionalidade existente.

## O que é Neumorfismo?

Neumorfismo (ou "Soft UI") é um design que combina elementos de flat design e material design, criando interfaces que parecem "embutidas" no fundo com efeitos sutis de sombra e iluminação.

## Passo 1: Atualizar Configurações de Cores no Tailwind

### 1.1. Atualizar `src/index.css`

Vamos modificar o arquivo de estilos para incluir as cores e efeitos neumórficos:

```css
/* Adicione estas variáveis ao :root no src/index.css */
:root {
  /* Neumorphism Colors */
  --nm-bg: 210 22 31; /* Azul escuro de fundo */
  --nm-bg-inset: 210 25 27; /* Cor para elementos inset */
  --nm-shadow-light: 210 20 35; /* Sombra clara */
  --nm-shadow-dark: 210 30 20; /* Sombra escura */
  --nm-text: 210 15 85; /* Cor do texto */
  --nm-text-muted: 210 10 70; /* Texto secundário */
  --nm-accent: 210 80 70; /* Cor de destaque */
  --nm-accent-hover: 210 85 75; /* Cor de destaque hover */
}
```

## Passo 2: Criar Classes Utilitárias para Neumorfismo

### 2.1. Adicionar classes ao `src/index.css`

```css
@layer components {
  /* Neumorphism Base */
  .nm-base {
    background: hsl(var(--nm-bg));
    color: hsl(var(--nm-text));
  }

  /* Neumorphism Card */
  .nm-card {
    background: hsl(var(--nm-bg));
    border-radius: 20px;
    box-shadow: 
      8px 8px 16px hsl(var(--nm-shadow-dark) / 0.4),
      -8px -8px 16px hsl(var(--nm-shadow-light) / 0.4);
    transition: all 0.3s ease;
  }

  /* Neumorphism Inset Card */
  .nm-card-inset {
    background: hsl(var(--nm-bg-inset));
    border-radius: 20px;
    box-shadow: 
      inset 4px 4px 8px hsl(var(--nm-shadow-dark) / 0.3),
      inset -4px -4px 8px hsl(var(--nm-shadow-light) / 0.3);
  }

  /* Neumorphism Button */
  .nm-btn {
    background: hsl(var(--nm-bg));
    color: hsl(var(--nm-text));
    border-radius: 16px;
    box-shadow: 
      4px 4px 8px hsl(var(--nm-shadow-dark) / 0.3),
      -4px -4px 8px hsl(var(--nm-shadow-light) / 0.3);
    transition: all 0.2s ease;
    border: none;
    padding: 12px 24px;
    font-weight: 500;
  }

  .nm-btn:hover {
    box-shadow: 
      2px 2px 4px hsl(var(--nm-shadow-dark) / 0.2),
      -2px -2px 4px hsl(var(--nm-shadow-light) / 0.2);
  }

  .nm-btn:active {
    box-shadow: 
      inset 4px 4px 8px hsl(var(--nm-shadow-dark) / 0.3),
      inset -4px -4px 8px hsl(var(--nm-shadow-light) / 0.3);
  }

  /* Neumorphism Input */
  .nm-input {
    background: hsl(var(--nm-bg-inset));
    border-radius: 16px;
    box-shadow: 
      inset 4px 4px 8px hsl(var(--nm-shadow-dark) / 0.3),
      inset -4px -4px 8px hsl(var(--nm-shadow-light) / 0.3);
    border: none;
    padding: 12px 16px;
    color: hsl(var(--nm-text));
    transition: all 0.2s ease;
  }

  .nm-input:focus {
    outline: none;
    box-shadow: 
      inset 6px 6px 12px hsl(var(--nm-shadow-dark) / 0.4),
      inset -6px -6px 12px hsl(var(--nm-shadow-light) / 0.4),
      0 0 0 2px hsl(var(--nm-accent));
  }

  /* Neumorphism Badge */
  .nm-badge {
    background: hsl(var(--nm-bg));
    border-radius: 12px;
    box-shadow: 
      2px 2px 4px hsl(var(--nm-shadow-dark) / 0.3),
      -2px -2px 4px hsl(var(--nm-shadow-light) / 0.3);
    padding: 4px 12px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  /* Neumorphism Switch */
  .nm-switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 30px;
  }

  .nm-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .nm-switch-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: hsl(var(--nm-bg-inset));
    border-radius: 30px;
    box-shadow: 
      inset 4px 4px 8px hsl(var(--nm-shadow-dark) / 0.3),
      inset -4px -4px 8px hsl(var(--nm-shadow-light) / 0.3);
    transition: .4s;
  }

  .nm-switch-slider:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 4px;
    bottom: 4px;
    background: hsl(var(--nm-bg));
    border-radius: 50%;
    box-shadow: 
      2px 2px 4px hsl(var(--nm-shadow-dark) / 0.3),
      -2px -2px 4px hsl(var(--nm-shadow-light) / 0.3);
    transition: .4s;
  }

  input:checked + .nm-switch-slider {
    background: hsl(var(--nm-bg-inset));
  }

  input:checked + .nm-switch-slider:before {
    transform: translateX(30px);
  }
}
```

## Passo 3: Atualizar Componentes Principais

### 3.1. Atualizar TaskCard

Modifique `src/components/tasks/TaskCard.tsx` para usar o estilo neumórfico:

```tsx
// Substitua a div principal do componente por:
<div 
  className={cn(
    "nm-card p-4 animate-fade-in group",
    isCompleted && "opacity-75"
  )}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
>
  {/* O restante do componente permanece similar, mas com estilos neumórficos */}
</div>
```

### 3.2. Atualizar TaskModal

Modifique `src/components/tasks/TaskModal.tsx`:

```tsx
// No DialogContent, substitua por:
<DialogContent className="nm-card max-w-2xl max-h-[90vh] overflow-y-auto border-0">
  {/* Atualize os inputs para usar nm-input */}
  <Input
    className="nm-input"
    // ... outras props
  />
  
  {/* Atualize os botões para usar nm-btn */}
  <Button
    className="nm-btn"
    // ... outras props
  >
    {/* Conteúdo do botão */}
  </Button>
</DialogContent>
```

### 3.3. Atualizar Dashboard

Modifique `src/pages/Dashboard.tsx`:

```tsx
// Atualize o header:
<header className="nm-card px-6 py-4 border-0">

// Atualize o container de filtros:
<div className="nm-card rounded-xl p-6 mb-6 border-0">

// Atualize o input de busca:
<Input
  className="nm-input pl-10"
  // ... outras props
/>

// Atualize os botões:
<Button 
  className="nm-btn"
  // ... outras props
>
  {/* Conteúdo do botão */}
</Button>
```

## Passo 4: Atualizar Componentes UI Personalizados

### 4.1. Atualizar botões

Em `src/components/ui/button.tsx`, modifique as variantes para usar estilos neumórficos:

```tsx
const buttonVariants = cva(
  "nm-btn inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### 4.2. Atualizar inputs

Em `src/components/ui/input.tsx`:

```tsx
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "nm-input flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"
```

## Passo 5: Atualizar Estilos Globais

### 5.1. Modificar o body no `src/index.css`:

```css
body {
  @apply nm-base font-inter antialiased;
}
```

## Passo 6: Atualizar Cores de Prioridade

### 6.1. Atualizar `src/components/tasks/TaskCard.tsx` para usar estilos neumórficos:

```tsx
const priorityConfig = {
  low: {
    color: "text-green-400",
    bg: "nm-badge",
    label: "Baixa"
  },
  medium: {
    color: "text-amber-400", 
    bg: "nm-badge",
    label: "Média"
  },
  high: {
    color: "text-red-400",
    bg: "nm-badge",
    label: "Alta"
  }
}
```

## Passo 7: Testar e Refinar

### 7.1. Verificar todos os componentes

- Teste todos os componentes em diferentes estados (hover, active, focus)
- Verifique a responsividade em diferentes tamanhos de tela
- Confirme que a acessibilidade não foi comprometida

### 7.2. Ajustar conforme necessário

- Refine as sombras e cores se necessário
- Adicione transições suaves para melhor experiência do usuário
- Otimize o desempenho removendo estilos não utilizados

## Passo 8: Atualizar Documentação

### 8.1. Adicionar guia de estilo ao projeto

Crie um documento explicando:
- Como usar os novos estilos neumórficos
- Padrões de cores
- Componentes disponíveis
- Boas práticas

## Considerações Finais

A transição para o neumorfismo requer atenção especial a:

1. **Acessibilidade**: Certifique-se de manter contraste adequado entre texto e fundo
2. **Performance**: Efeitos de sombra podem impactar o desempenho em dispositivos mais antigos
3. **Usabilidade**: O neumorfismo pode ser menos intuitivo que estilos planos para alguns usuários
4. **Consistência**: Mantenha os estilos consistentes em toda a aplicação

Após implementar essas mudanças, você terá uma interface com design neumórfico que mantém a funcionalidade do aplicativo de tarefas.