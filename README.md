# Bloom OS

# BLOOM OS — Desenvolvimento da primeira versão

## 1. Objetivo do projeto

Crie o **Bloom OS**, uma aplicação web de organização pessoal e produtividade com estética feminina sofisticada, delicada e moderna.

**Conceito:** "Your space to bloom."

O Bloom OS será um espaço digital pessoal para organizar tarefas, planejar a rotina, acompanhar hábitos, estabelecer metas e registrar pensamentos.

O produto deve transmitir a sensação de um ambiente acolhedor, elegante, inspirador e extremamente agradável de utilizar.

A experiência visual é uma prioridade. Quero que o resultado se aproxime da qualidade de um produto SaaS premium, não de um dashboard genérico.

**IMPORTANTE SOBRE O ESCOPO:**

Esta é apenas a primeira versão do aplicativo, que será aprimorada posteriormente no Claude Code.

Tenho um orçamento limitado de créditos no Lovable. Portanto:

- Priorize uma base visual excepcional e funcionalidades essenciais.
- Não tente construir um sistema completo de uma só vez.
- Evite integrações externas desnecessárias.
- Não configure autenticação, banco de dados remoto ou APIs de IA nesta etapa.
- Não gere imagens por IA durante a construção.
- Não faça refatorações extensas ou implementações que não sejam necessárias.
- Prefira componentes reutilizáveis e bibliotecas já disponíveis.
- Se precisar reduzir o escopo, preserve primeiro o Dashboard, o sistema visual, a navegação e as funcionalidades de tarefas e hábitos.

O objetivo é criar uma base bonita, funcional e organizada, pronta para evolução.

---

## 2. Identidade visual

### Direção artística

A estética deve combinar:

- Soft feminine luxury;
- Clean girl aesthetic;
- Design editorial;
- Minimalismo contemporâneo;
- Glassmorphism extremamente sutil;
- Elementos botânicos delicados;
- Interfaces elegantes e acolhedoras.

Evite aparência infantil, excesso de rosa saturado, gradientes exagerados ou elementos decorativos que prejudiquem a usabilidade.

Quero uma interface que pareça ter sido desenvolvida por uma equipe profissional de design de produto.

### Paleta oficial

Utilize tokens CSS globais para todas as cores.

| Cor | Hex | Aplicação |
|---|---|---|
| Cream White | #FDF8F6 | Fundo principal |
| Blush Pink | #F7E6EB | Fundos secundários |
| Dusty Rose | #E8C7D1 | Destaques suaves |
| Rose Antique | #A76B7D | Botões e elementos ativos |
| Deep Plum | #6E3C4E | Títulos e elementos principais |
| Champagne | #CDA483 | Detalhes especiais |
| Warm Beige | #D7C6BB | Bordas e elementos neutros |
| Soft Gray | #8C8C8C | Textos secundários |

O visual deve ser majoritariamente claro, com tons de creme, rosa suave e vinho.

**Não implemente tema escuro nesta primeira versão.** Prepare apenas os tokens para facilitar essa evolução no futuro.

### Tipografia

- **Playfair Display:** títulos principais, frases especiais e elementos editoriais.
- **Inter:** navegação, formulários, botões, indicadores e textos gerais.

Utilize tipografia responsiva, excelente legibilidade e hierarquia visual consistente.

### Elementos visuais

- Bordas arredondadas entre 12 e 20px;
- Cards com fundos creme ou branco rosado;
- Sombras suaves e difusas;
- Bordas discretas;
- Ícones finos da biblioteca Lucide;
- Gradientes rosados muito sutis;
- Pequenos detalhes florais em SVG;
- Espaçamentos generosos;
- Efeitos de transparência somente quando agregarem valor.

Evite componentes excessivamente grandes ou com muito espaço vazio.

---

## 3. Estrutura geral do aplicativo

Utilize uma arquitetura React + TypeScript + Tailwind CSS, aproveitando shadcn/ui quando disponível.

A interface terá:

**Desktop:**
- Sidebar fixa na lateral esquerda;
- Área central com conteúdo;
- Header superior discreto;
- Conteúdo organizado em cards e grids responsivos.

**Mobile:**
- Header compacto;
- Navegação inferior com ícones;
- Conteúdo em coluna;
- Cards adaptados para telas pequenas;
- Botões fáceis de tocar.

### Sidebar

No topo, apresente um símbolo floral minimalista acompanhado de:

**Bloom OS**

Abaixo, os itens de navegação:

1. Início
2. Planejamento
3. Hábitos
4. Metas
5. Diário

Ao final, apresente discretamente o perfil da usuária e o acesso às configurações.

Deixe Finanças, Estudos, Biblioteca e Bem-estar como funcionalidades futuras. Não é necessário implementar suas telas agora.

Todos os itens ativos da navegação devem funcionar corretamente.

---

## 4. Tela principal — Dashboard

**Esta é a tela mais importante de todo o projeto. Dedique a maior atenção visual a ela.**

Quero um dashboard elegante e personalizado.

### Header

Na parte superior:

- Saudação dinâmica: "Bom dia, [nome]!"
- Subtítulo: "Um novo dia para florescer."
- Data atual em português;
- Ícone de notificações apenas se tiver funcionalidade real;
- Avatar com iniciais da usuária.

O nome deve ser editável nas configurações e salvo localmente.

### Banner principal

Crie um banner horizontal elegante com:

- Fundo rosa suave em gradiente;
- Ilustração botânica vetorial discreta;
- Uma frase inspiradora;
- Pequeno detalhe floral;
- Design editorial sofisticado.

Frase inicial:

"Pequenos passos também fazem florescer grandes sonhos."

O banner não precisa de imagens externas. Prefira SVG e CSS para manter desempenho e economizar recursos.

### Widgets principais

**Widget 1 — Meu dia**

Exibir:
- Lista de tarefas de hoje;
- Checkbox funcional;
- Horário ou prazo;
- Botão para adicionar tarefa;
- Indicador de tarefas concluídas.

**Widget 2 — Meus hábitos**

Exibir:
- Hábitos cadastrados;
- Indicadores de conclusão;
- Progresso do dia;
- Acesso direto à página de hábitos.

**Widget 3 — Metas em andamento**

Exibir:
- Até três metas prioritárias;
- Barras de progresso;
- Percentuais reais;
- Acesso à página de metas.

**Widget 4 — Minha semana**

Exibir um resumo visual dos próximos sete dias, com tarefas e eventos agendados.

### Resumo inferior

Criar uma faixa discreta com três indicadores:

- Tarefas concluídas;
- Hábitos realizados;
- Metas ativas.

Os indicadores precisam ser calculados com base nos dados existentes.

Não invente estatísticas nem apresente números aleatórios.

---

## 5. Planejamento — Tarefas e calendário

Crie uma página de planejamento com duas seções integradas.

### Gerenciador de tarefas

Permitir:

- Criar tarefas;
- Editar tarefas;
- Marcar como concluídas;
- Excluir tarefas;
- Definir data;
- Definir prioridade;
- Categorizar tarefas;
- Filtrar por status.

Categorias iniciais:
- Pessoal;
- Trabalho;
- Estudos;
- Autocuidado.

A interface deve utilizar cards ou linhas organizadas, com checkboxes rosados e indicadores discretos.

### Calendário

Crie um calendário mensal funcional, com:

- Navegação entre meses;
- Destaque do dia atual;
- Indicação de tarefas nas datas;
- Seleção de um dia;
- Exibição das tarefas daquele dia.

Não implemente calendário com arrastar e soltar, sincronização com Google Calendar ou funcionalidades complexas nesta etapa.

---

## 6. Hábitos — Habit tracker

Crie uma tela de acompanhamento de hábitos com visual delicado e interativo.

### Funcionalidades

- Adicionar hábito;
- Editar nome e frequência;
- Excluir hábito;
- Marcar realização em determinada data;
- Visualizar os últimos sete dias;
- Consultar progresso semanal.

Exemplos iniciais:
- Beber água;
- Ler 20 minutos;
- Praticar exercícios;
- Organizar o dia;
- Fazer skincare.

### Estética

Utilize pequenos indicadores circulares, checkmarks e barras de progresso.

Ao marcar um hábito, aplique uma animação discreta de confirmação.

O resultado deve transmitir uma sensação positiva de progresso.

---

## 7. Metas — Goals

Crie uma página para definir objetivos pessoais.

Cada meta terá:

- Título;
- Descrição opcional;
- Categoria;
- Data-alvo;
- Progresso percentual;
- Status;
- Cor ou ícone representativo.

Permitir criar, editar, atualizar progresso e excluir metas.

### Layout

Apresente cards elegantes com:

- Título em destaque;
- Pequena descrição;
- Barra de progresso;
- Percentual;
- Data-alvo;
- Botão para atualizar o progresso.

Exemplo:

**Minha evolução profissional**

"Desenvolver novas habilidades e conquistar meus objetivos."

Progresso: 65%.

O percentual é apenas um valor inicial de demonstração, não deve permanecer fixo após a usuária modificar a meta.

---

## 8. Diário — Dear Me

Crie uma página de diário pessoal com experiência intimista e sofisticada.

### Funcionalidades

- Criar entrada;
- Editar entrada;
- Excluir entrada;
- Consultar entradas anteriores;
- Salvar automaticamente ou por botão.

Campos:
- Data;
- Título;
- Humor;
- Texto livre.

### Humor

Utilize cinco opções com ícones delicados:
- Feliz;
- Tranquila;
- Motivada;
- Cansada;
- Triste.

### Visual

A interface deve lembrar um caderno digital sofisticado:

- Fundo creme;
- Campos com bordas discretas;
- Tipografia confortável;
- Pequenos detalhes florais;
- Muito foco na escrita.

Não implemente análise emocional por IA nesta fase.

---

## 9. Configurações básicas

Criar um pequeno modal ou página de configurações com:

- Nome da usuária;
- Preferência de exibição do primeiro nome;
- Opção para restaurar os dados de demonstração;
- Opção para limpar dados locais, com confirmação.

Não é necessário login ou upload de foto.

---

## 10. Dados e persistência

Nesta primeira versão, utilize **localStorage** para armazenar:

- Nome da usuária;
- Tarefas;
- Hábitos e registros de conclusão;
- Metas;
- Entradas do diário.

Organize a lógica de armazenamento em hooks ou serviços reutilizáveis.

Use modelos TypeScript claros para cada entidade.

Crie dados iniciais de demonstração para que o aplicativo tenha uma aparência completa quando aberto pela primeira vez.

Esses dados devem ser editáveis e identificáveis como exemplos.

A persistência precisa funcionar após atualizar a página.

Não configure Supabase, Lovable Cloud ou qualquer banco de dados externo nesta etapa.

---

## 11. Animações e microinterações

Quero uma interface visualmente agradável, mas sem comprometer desempenho.

Implemente somente animações leves:

- Hover suave nos cards;
- Transição de botões;
- Feedback ao concluir tarefas;
- Animação curta dos indicadores de hábito;
- Transição discreta entre estados;
- Abertura elegante de modais.

Utilize CSS ou soluções leves já disponíveis no projeto.

Duração aproximada: 150 a 300ms.

Respeite `prefers-reduced-motion`.

Não utilize efeitos 3D, partículas, vídeos ou animações pesadas.

---

## 12. Experiência do usuário

O Bloom OS deve parecer um produto real, não somente uma apresentação visual.

Prioridades de UX:

1. Interface intuitiva.
2. Navegação fluida.
3. Consistência entre páginas.
4. Excelente legibilidade.
5. Responsividade.
6. Feedback visual claro.
7. Poucos cliques para realizar ações.
8. Componentes acessíveis.
9. Estados vazios bem desenhados.
10. Dados salvos corretamente.

### Estados vazios

Quando não existirem tarefas, hábitos, metas ou entradas, exiba uma mensagem acolhedora acompanhada de um botão funcional.

Exemplo:

"Seu espaço está pronto para florescer. Que tal começar com sua primeira tarefa?"

### Feedback

Utilize notificações toast para:

- Item criado;
- Alteração salva;
- Item excluído;
- Erro ao processar uma ação.

Evite mensagens excessivas para ações simples.

---

## 13. Qualidade técnica e organização

Estruture o código de forma que seja fácil continuar o desenvolvimento posteriormente no Claude Code.

Preferencialmente:

- `components/layout` — estrutura global;
- `components/ui` — componentes reutilizáveis;
- `components/dashboard` — widgets;
- `pages` — páginas;
- `hooks` — estado e persistência;
- `types` — tipos de dados;
- `lib` — utilitários.

Use componentes reutilizáveis para:

- Cards;
- Cabeçalhos;
- Indicadores de progresso;
- Modais;
- Botões;
- Campos de formulário;
- Estados vazios.

Não coloque toda a lógica da aplicação em um único componente.

Evite dependências desnecessárias e soluções excessivamente complexas.

---

## 14. Limites desta primeira entrega

**Não implementar agora:**

- Integração com APIs de IA;
- Chatbot;
- Autenticação;
- Cadastro de usuários;
- Banco de dados na nuvem;
- Sistema de pagamentos;
- Notificações push;
- Integração com calendários externos;
- Geração de imagens;
- Upload de arquivos;
- Análises financeiras complexas;
- Gamificação avançada;
- Sistema de assinaturas;
- Aplicativo mobile nativo;
- Tema escuro.

Esses recursos serão adicionados nas próximas etapas com Claude Code.

---

## 15. Ordem de prioridade

Caso seja necessário reduzir o trabalho, siga exatamente esta ordem:

**P0 — Obrigatório**
1. Design system completo;
2. Layout responsivo;
3. Sidebar e navegação;
4. Dashboard premium;
5. Tarefas funcionais;
6. Persistência local.

**P1 — Alta prioridade**
1. Hábitos funcionais;
2. Metas funcionais;
3. Calendário básico.

**P2 — Complementar**
1. Diário;
2. Configurações adicionais;
3. Microinterações decorativas.

Nunca sacrifique a qualidade do Dashboard e das funcionalidades P0 para implementar detalhes P2.

Se o escopo ficar excessivo, entregue as prioridades mais altas funcionando perfeitamente, sem tentar completar tudo superficialmente.

---

## 16. Critérios de conclusão

Antes de finalizar, verifique objetivamente:

- A aplicação abre sem erro.
- O Dashboard apresenta visual profissional e consistente.
- A navegação funciona.
- O layout se adapta ao desktop e mobile.
- É possível criar e concluir tarefas.
- As informações persistem após refresh.
- Os indicadores exibem dados coerentes.
- Os botões implementados funcionam.
- Os componentes seguem a paleta oficial.
- Não existem textos ilegíveis ou sobrepostos.
- Não existem erros de compilação TypeScript.

Não realize ciclos extensos de testes automatizados ou operações adicionais que aumentem desnecessariamente o consumo de créditos.

Corrija somente erros identificados que impeçam o funcionamento da entrega.

### Direção final

Quero abrir o Bloom OS e sentir que estou utilizando um aplicativo feminino premium, cuidadosamente projetado e extremamente agradável.

A estética deve ser memorável, mas a funcionalidade e a facilidade de uso são igualmente importantes.

**Construa agora a primeira versão funcional, priorizando qualidade, simplicidade, consistência e economia de créditos. Não implemente recursos fora do escopo descrito.**

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1cd0f92c-1a92-488b-930f-6d2dc578b660).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
