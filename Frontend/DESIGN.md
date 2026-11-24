---
version: alpha
name: 'PPI'
description: 'Organizador de projetos acadêmicos com o cubo azul e a composição da referência fornecida.'
colors:
  primary: '#1261d8'
  primary-hover: '#084ebc'
  primary-soft: '#e7f1ff'
  surface: '#ffffff'
  surface-alt: '#f6f9ff'
  background: '#fcfdff'
  text: '#0c1432'
  muted: '#526383'
  border: '#dde5f1'
  control-border: '#8192ac'
  danger: '#ba3047'
  danger-soft: '#fff0f3'
  success: '#148365'
  success-soft: '#e3f6ef'
  warning: '#916100'
  warning-soft: '#fff3d5'
  scrollbar-thumb: '#bacbe1'
  scrollbar-track: '#f3f6fc'
  scrollbar-hover: '#879ebd'
  scrollbar-active: '#647e9f'
  dark-primary: '#78b1ff'
  dark-primary-hover: '#a6ceff'
  dark-primary-soft: '#172f50'
  dark-surface: '#152137'
  dark-surface-alt: '#101c30'
  dark-background: '#0e182a'
  dark-text: '#eef4ff'
  dark-muted: '#a5b5d1'
  dark-border: '#2c3c56'
  dark-control-border: '#607896'
  dark-danger: '#ff9bad'
  dark-danger-soft: '#3b2130'
  dark-success: '#66d7b4'
  dark-success-soft: '#17382f'
  dark-warning: '#f4ce76'
  dark-warning-soft: '#3b321e'
  dark-scrollbar-thumb: '#435b7b'
  dark-scrollbar-track: '#101c30'
  dark-scrollbar-hover: '#6683a9'
  dark-scrollbar-active: '#8da6c7'
typography:
  body:
    fontFamily: 'Inter, Arial, sans-serif'
    fontSize: '14px'
    lineHeight: '1.55'
  heading:
    fontFamily: 'Inter, Arial, sans-serif'
    fontSize: '30px'
    lineHeight: '1.25'
rounded:
  DEFAULT: '9px'
  control: '7px'
  card: '10px'
  dialog: '16px'
spacing:
  control-gap: '9px'
  grid-gap: '20px'
  dialog-padding: '24px'
  desktop-page-padding: '35px'
  sidebar-width: '232px'
components:
  button: {}
  field: {}
  project-card: {}
  modal: {}
  toast: {}
---

# Design do PPI

## Overview

A referência visual é a colagem de sete páginas fornecida com o pedido: cubo azul, ilustrações vetoriais suaves, superfícies brancas e navegação lateral. A implementação deve continuar reconhecível como essa composição. O projeto acadêmico é identificado no `../README.md`; não substituir sua identidade por outra marca institucional.

O público organiza projetos, tarefas, anotações e colaboradores. A interface usa português brasileiro. A raiz é uma apresentação com convite para entrar ou criar conta; as demais páginas têm linguagem de ferramenta e priorizam legibilidade e ações previsíveis.

A assinatura visual é o cubo azul e seu vocabulário de pastas, checklist, pessoa e documento. Manter esse destaque nas ilustrações; os controles de trabalho permanecem discretos. Evitar fotografias genéricas, paletas de outra marca e ornamentação que não esteja na referência.

**Propriedade dos tokens:** modelo B. `src/styles.css` é a fonte canônica de valores em execução; este documento espelha os valores aceitos e explica seu uso. Não há exportador ou um segundo tema independente. Alterações duráveis devem atualizar CSS e este documento juntos.

## Colors

Azul identifica ações, links, seleção e foco. Navy identifica texto principal; cinza azulado identifica ajuda e metadados. Bordas claras separam regiões sem criar caixas pesadas. Verde, âmbar e vermelho comunicam estado acompanhados de texto ou ícone.

O tema escuro substitui os mesmos papéis sem alterar a hierarquia. O seletor é `:root[data-theme='dark']`, controlado por `ThemeService`. As ilustrações preservam o azul da marca. A preferência visual é a única informação persistida por esse serviço.

| Tokens deste documento                                                        | Fonte em execução                                              | Consumidores                                                                                       |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `colors.primary`, `primary-hover`, `primary-soft`                             | `--primary`, `--primary-hover`, `--primary-soft`               | Links, foco, navegação ativa e controles compartilhados.                                           |
| `surface`, `surface-alt`, `background`                                        | `--surface`, `--surface-alt`, `--background`                   | Fundo, painéis, campos e menus.                                                                    |
| `text`, `muted`, `border`                                                     | `--text`, `--muted`, `--border`                                | Hierarquia textual e separadores.                                                                  |
| `control-border`                                                              | `--control-border`                                             | Contornos de campos e checkboxes; contraste mínimo de 3:1, separado das bordas decorativas claras. |
| `danger`, `danger-soft`, `success`, `success-soft`, `warning`, `warning-soft` | Variáveis CSS com os mesmos nomes e prefixo `--`               | Erros, confirmações e informações de estado.                                                       |
| `scrollbar-*`                                                                 | Variáveis CSS com os mesmos nomes e prefixo `--`               | Regra global de todas as áreas de rolagem.                                                         |
| `dark-*`                                                                      | Mesmas variáveis sem `dark-`, dentro do seletor do tema escuro | Mesmos componentes, sem duplicar regras de página.                                                 |

Os aliases `--color-primary`, `--color-text`, `--color-muted`, `--color-border`, `--color-surface`, `--color-background`, `--color-danger` e `--color-success` apenas referenciam os tokens originais por `var()`. Não recebem valores independentes.

O botão primário usa a receita global `.btn-primary`: gradiente de `#1c6be0` a `#1058cd`, texto branco e hover `#084ebc`. Essa receita é o proprietário dessas cores de botão, inclusive no tema escuro; não copiar o gradiente para cada página. Os matizes de capa e as cores internas das ilustrações são decoração dos componentes, sem significado de permissão ou estado.

## Typography

Inter é empacotada localmente via `@fontsource/inter`, com pesos 400–800. Arial e sans-serif são os fallbacks. `--font-body` alimenta corpo, campos, botões e títulos. Não depender de download de fontes em tempo de execução.

Corpo: 14 px, linha 1,55. Títulos de página: 30 px e peso 700; no celular, 26 px. Títulos secundários: 21 px; subtítulos: 16 px. O hero amplia a mesma família entre 34 e 56 px para reproduzir a hierarquia da referência. Informações auxiliares podem usar 11–13 px; textos principais não devem usar essa escala.

Preservar acentos e frases em português. Números de progresso são valores reais, com alternativa textual. Campos chegam a 16 px no celular. Títulos de projetos e conteúdos longos devem quebrar linha; nunca depender apenas de tooltip para ler um nome.

## Layout

O documento possui altura natural e é o proprietário da rolagem principal. A sidebar desktop pode ser sticky com altura de viewport; isso não limita a altura dos formulários irmãos. Somente diálogos abertos bloqueiam temporariamente a rolagem do body.

Desktop: sidebar de 232 px, topbar de 76 px e área central flexível. Em 1050 px, a sidebar passa a 200 px. Em **760 px**, a navegação vira uma faixa horizontal; todas as ações continuam disponíveis. O hero tem seu próprio empilhamento em 600 px, preservando a ilustração sem cortar o conteúdo.

O contêiner de trabalho usa largura máxima de 1500 px. O dashboard organiza três cartões por linha quando há espaço, reduzindo as colunas conforme a largura. O detalhe divide tarefas e anotações no desktop e empilha no celular. Gaps de 20 px e margens mais amplas nas seções produzem o ritmo da referência.

`spacing.*` documenta receitas existentes: gap de botão 9 px, grid 20 px, modal 24 px, página desktop 35 px e sidebar 232 px. Os seletores globais e `shared/shell.component.css` são seus proprietários; não há geração de utilitários a partir deste arquivo.

## Elevation & Depth

`--shadow` é `0 3px 14px rgb(28 66 126 / 4%)` no claro e `0 3px 14px rgb(0 0 0 / 12%)` no escuro. Painéis usam sombra leve e borda de 1 px. Menus e diálogos têm sombras maiores para indicar sobreposição. Não sombrear cada linha de tarefa nem transformar a superfície em um painel de cartões excessivos.

## Shapes

`--radius` representa 9 px para painéis; controles usam 7 px, cartões de projeto 10 px e diálogo 16 px. `rounded.*` espelha essas receitas. Avatares e alguns contêineres de ícone são circulares, como na referência. Bordas e espaçamentos permanecem coerentes entre criar e editar.

## Components

| Proprietário                                           | Responsabilidade visual                                                                                   |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `src/styles.css`                                       | `.btn*`, `.icon-button`, `.form-field`, campos, erros, painéis, diálogos, toasts e baseline de scrollbar. |
| `shared/brand.component.ts`                            | Cubo e marca PPI.                                                                                         |
| `shared/icon.component.ts`                             | Ícones SVG com tamanho controlável; nomes acessíveis ficam nos controles.                                 |
| `shared/illustration.component.ts`                     | Ilustrações reutilizáveis da identidade e das capas.                                                      |
| `shared/shell.component.*`                             | Sidebar, cabeçalho, conta, navegação e avisos persistentes.                                               |
| `shared/modal.component.ts`                            | Estrutura visual e ciclo de foco do diálogo.                                                              |
| `core/toast.service.ts` e `shared/toasts.component.ts` | Uma única apresentação de feedback breve.                                                                 |

Controles têm estados padrão, hover, foco visível, pressionado e indisponível. Foco usa contorno de 3 px. Erros usam mensagem textual associada ao campo. O botão de confirmação destrutiva usa vermelho apenas no contexto que explica a consequência; ações normais permanecem azuis ou neutras.

Forms usam labels reais e `novalidate`. Select e campo de data permanecem nativos: o popup é propriedade do navegador/SO, e sua geometria ou idioma interno não são prometidos pelo design. Textareas não redimensionam por arrasto; possuem altura inicial suficiente e crescimento até um limite de rolagem.

Toasts ocupam uma região fixa inferior direita, com limite de três mensagens e fechamento manual. Erros críticos também ficam junto ao formulário. O modal usa a top layer nativa de `dialog`; nenhum toast pode obscurecer seus campos ou substituir sua mensagem de erro.

Transições comuns duram 140 ms. Não há animação contínua decorativa. `prefers-reduced-motion` desativa transições; `forced-colors` preserva contornos e controles. Scrollbars têm track, thumb, hover e active globais, com propriedades padrão e fallback WebKit.

## Do's and Don'ts

- Preservar o cubo, os azuis e a organização espacial da imagem fornecida.
- Reutilizar os componentes e receitas antes de criar variantes locais.
- Derivar progresso e indicadores das tarefas presentes, mesmo quando diferem dos números ilustrativos do mockup.
- Manter o aviso de demonstração legível e o Google indisponível enquanto faltar integração.
- Não usar somente cor para prioridade, seleção, erro ou permissão.
- Não esconder ações no celular nem fixar a altura da área de conteúdo para acomodar uma lista.
