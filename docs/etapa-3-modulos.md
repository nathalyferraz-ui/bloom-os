# Bloom OS Etapa 3 Módulos pessoais

Finanças, Estudos, Biblioteca e Bem-estar agora têm páginas funcionais, conectadas à navegação e ao Dashboard. A identidade visual, o banner principal e os módulos anteriores foram preservados.

## Funcionalidades implementadas

| Módulo | Funcionalidades |
| --- | --- |
| My Money | Receitas e despesas com criação, edição e exclusão; categorias, descrição e data; filtros de mês e tipo; saldo acumulado até o mês, resultado mensal e orçamento por mês; histórico de seis meses e distribuição de despesas por categoria com Recharts. |
| Study Garden | Matérias com cor, descrição e meta semanal; sessões com data, duração e notas; atividades com tipo, prazo e conclusão; cronômetro com início, pausa, retomada e registro; indicadores e gráfico semanal. |
| My Little Library | Livros com título, autor, gênero, capa opcional por URL, páginas, status, avaliação e notas; cadastro, edição, exclusão e progresso; estante e lista; detalhes em modal; busca e filtros; meta anual por data de conclusão. |
| Inner Bloom | Check-in por data com humor, energia, sono, autocuidado e reflexão; edição sem duplicação de datas, exclusão e histórico por mês; gráficos semanais; Minha Flor em SVG, baseada nos dias com autocuidado. |

O Dashboard ganhou quatro acessos compactos em “Meu universo”, com indicadores reais. A sidebar abre os quatro módulos; no celular, o botão “Mais” mantém o Diário e dá acesso aos novos espaços e às configurações. Os prazos das atividades de estudo aparecem no calendário existente e podem ser concluídos ali.

## Persistência e cálculos

O armazenamento continua em `bloom-os:v1`, via `src/lib/store.ts` e `useSyncExternalStore`. As novas coleções têm valores padrão vazios para carregar os dados de versões anteriores. As mutações permanecem em `src/hooks/use-bloom-actions.ts`.

Valores financeiros são armazenados como centavos inteiros e apresentados em BRL. O cronômetro salva horários de início e tempo acumulado nas ações, sem gravar a cada segundo; sessões finalizadas são registradas uma única vez. Metas de leitura usam o ano da data de conclusão. Check-ins usam a data como chave única; dias sem registro permanecem sem valor nos gráficos.

Os novos módulos começam vazios. O botão global de restauração mantém os exemplos dos módulos anteriores e esvazia as novas coleções, com confirmação explícita. Registros de bem-estar permanecem locais; os indicadores não fazem interpretações clínicas. A flor representa 0–1, 2–4 ou 5–7 dias de autocuidado na semana, com explicação na interface.

## Imagens geradas

Quatro banners exclusivos foram gerados com a ferramenta integrada `image_gen`, seguindo a skill `imagegen`, e salvos no projeto como WebP. Cada banner possui versões de 800 × 450 e 400 × 225 px, com `srcSet`, dimensões explícitas, carregamento lazy e decodificação assíncrona.

As versões de 800 px têm entre 13.904 e 21.444 bytes. As imagens são decorativas nos cabeçalhos; o banner floral existente do Dashboard foi mantido.

- [Prompts completos e modo de geração](../public/images/bloom-expansion.prompts.json).
- [Dimensões e tamanhos dos arquivos](../public/images/bloom-expansion.assets.json).

## Arquivos desta etapa

Esta lista cobre as adições e alterações da Etapa 3. As alterações anteriores presentes no workspace foram mantidas.

```text
src/components/dashboard/UniverseSection.tsx
src/components/finance/FinanceCharts.tsx
src/components/finance/FinanceDialogs.tsx
src/components/layout/AppShell.tsx
src/components/library/BookCover.tsx
src/components/library/BookDialog.tsx
src/components/library/ReadingGoalDialog.tsx
src/components/study/FocusTimer.tsx
src/components/study/StudyDialogs.tsx
src/components/ui/bloom.tsx
src/components/ui/daily-chart.tsx
src/components/ui/module.tsx
src/components/ui/sheet.tsx
src/components/wellbeing/CheckinDialog.tsx
src/components/wellbeing/MyFlower.tsx
src/hooks/use-bloom-actions.ts
src/lib/finance.ts
src/lib/library.ts
src/lib/store.ts
src/lib/study.ts
src/lib/wellbeing.ts
src/routeTree.gen.ts
src/routes/bem-estar.tsx
src/routes/biblioteca.tsx
src/routes/configuracoes.tsx
src/routes/estudos.tsx
src/routes/financas.tsx
src/routes/index.tsx
src/routes/planejamento.tsx
src/test/app-routing.test.tsx
src/test/bloom-actions.test.ts
src/test/finance.test.ts
src/test/library.test.ts
src/test/study.test.ts
src/test/wellbeing.test.ts
src/types/finance.ts
src/types/index.ts
src/types/library.ts
src/types/study.ts
src/types/wellbeing.ts
public/images/bloom-finance.webp
public/images/bloom-finance-400.webp
public/images/bloom-study.webp
public/images/bloom-study-400.webp
public/images/bloom-library.webp
public/images/bloom-library-400.webp
public/images/bloom-wellbeing.webp
public/images/bloom-wellbeing-400.webp
public/images/bloom-expansion.prompts.json
public/images/bloom-expansion.assets.json
docs/etapa-3-modulos.md
```

## Verificações realizadas

- `npm test`: 67 testes passaram em oito arquivos, incluindo rotas, migração dos dados, cálculos financeiros, orçamento, cronômetro, exclusões, leitura anual, unicidade dos check-ins e estados da flor.
- `tsc --noEmit`: passou com as opções estritas do projeto.
- `npm run build`: build de produção passou.
- ESLint nos 28 arquivos novos de código e no teste de rotas atualizado: passou.
- `git diff --check`: passou.
- Chrome em perfil isolado: Dashboard e os quatro módulos em larguras de 320, 390, 768, 1024 e 1440 px, sem rolagem horizontal ou imagens quebradas.
- Chrome: criação, edição, filtros e exclusão de transações; soma exata de R$ 0,10 + R$ 0,20; orçamento ultrapassado; persistência após recarga; dados das tarefas anteriores preservados.
- Chrome: matéria, sessão e atividade; prazo no calendário e conclusão; cronômetro pausado após recarga, retomada e finalização com registro.
- Chrome: livro, progresso, conclusão, avaliação, notas, meta anual, busca, filtros, lista e confirmação de exclusão; alteração do ano e gênero personalizado.
- Chrome: check-in, alteração sem duplicar a data, registro anterior, filtro de histórico, confirmação de exclusão e persistência após recarga; três gráficos renderizados com registros reais.
- Chrome: o menu inferior abriu os quatro módulos; formulários couberam a 320 px; Tab manteve o foco no modal de check-in e Escape o fechou; preferência por movimento reduzido respeitada.
- Capturas desktop e mobile do Dashboard e dos novos módulos foram revisadas.

## Pendências de validação

Os cinco blocos funcionais desta etapa foram implementados. Resta validar em dispositivos físicos, Safari e Firefox, incluindo teclado virtual e áreas seguras, e realizar uma revisão com leitor de tela. A revisão visual e de navegação foi feita no Chrome; ela não equivale a uma auditoria completa de acessibilidade.
