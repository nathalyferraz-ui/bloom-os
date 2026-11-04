# Bloom OS — Etapa 2: UX/UI e coleção botânica

## Entrega

- Identidade visual, frase do Dashboard e ilustração original de lírios preservadas.
- Quatro imagens exclusivas geradas com o ImageGen integrado para Planejamento, Hábitos, Metas e Diário.
- Imagens integradas aos cabeçalhos existentes, sem substituir controles ou dados reais.
- WebP em dois tamanhos, `srcSet`, dimensões explícitas e decodificação assíncrona. Cabeçalhos dos módulos usam carregamento lazy.
- Lírios com transparência e enquadramento inteiro no mobile. O PNG original permanece disponível.
- Hábitos em cards no celular/tablet e tabela no desktop, sem duplicar as duas apresentações no DOM.
- Navegação inferior com indicação ativa, áreas seguras, controles de toque e atalho para pular ao conteúdo.
- Campos, botões, modais, confirmações e notificações padronizados.
- Elevação suave de cards, feedback de pressão e animação do check somente após interação. Preferência por movimento reduzido respeitada.
- Estados vazios personalizados com as mensagens solicitadas e ações funcionais.
- Confirmação para excluir hábitos, metas e entradas. Falhas de gravação mantêm a confirmação aberta.
- Diário protege rascunhos ao trocar de entrada, navegar para outra página ou fechar/recarregar a aba.
- Calendário navegável por setas, Home e End, mantendo foco, seleção e data na URL.
- Cor semântica primária derivada de rosa antigo e vinho para melhorar contraste, sem alterar as cores-base da paleta.

Não houve alteração no formato dos dados persistidos nem na arquitetura de armazenamento e mutações.

## Arquivos desta etapa

```text
src/styles.css
src/components/dashboard/Widgets.tsx
src/components/layout/AppShell.tsx
src/components/tasks/TaskRow.tsx
src/components/ui/alert-dialog.tsx
src/components/ui/bloom.tsx
src/components/ui/button.tsx
src/components/ui/confirm-action.tsx          (novo)
src/components/ui/dialog.tsx
src/components/ui/input.tsx
src/components/ui/select.tsx
src/components/ui/slider.tsx
src/components/ui/sonner.tsx
src/components/ui/switch.tsx
src/components/ui/textarea.tsx
src/hooks/use-mobile.tsx
src/routes/__root.tsx
src/routes/configuracoes.tsx
src/routes/diario.tsx
src/routes/habitos.tsx
src/routes/metas.tsx
src/routes/planejamento.tsx
src/test/premium-ux.test.tsx                  (novo)
docs/etapa-2-ux-ui.md                        (novo)
```

Imagens novas em `public/images`: `bloom-planning.webp`, `bloom-habits.webp`, `bloom-goals.webp`, `bloom-journal.webp` e variantes `-400.webp`; `bloom-lilies.webp` e variante `-320.webp`.

- [Prompts completos e modo de geração](../public/images/bloom-collection.prompts.json).
- [Dimensões, tamanhos e transparência dos arquivos](../public/images/bloom-collection.assets.json).

As imagens dos quatro módulos têm entre 15.570 e 27.220 bytes na versão de 800 px. O banner transparente de 640 px tem 148.198 bytes, comparado aos 2.032.098 bytes do PNG original. O navegador solicita apenas a variante adequada à tela.

## Verificações realizadas

- `tsc --noEmit`: passou.
- `npm test`: 33 testes passaram, incluindo persistência, erros de gravação, sincronização entre abas, confirmações, foco, slider e feedback dos checks.
- `npm run build`: passou.
- ESLint nos arquivos alterados, com a regra de formatação desativada: sem erros de código; três avisos de Fast Refresh por exportações compartilhadas.
- Chrome: seis páginas em 320, 390, 768, 1024 e 1440 px, sem rolagem horizontal ou imagens quebradas.
- Chrome: navegação e redimensionamento não alteraram os dados armazenados.
- Chrome: os quatro estados vazios e seus botões funcionaram; modais cabem em 320 × 640 px e mantêm o foco após Tab.
- Chrome: hábitos preservam registros após recarga; exclusão exige confirmação.
- Chrome: slider por teclado salva progresso e status coerentes nas metas.
- Chrome: diário salva após recarga, protege rascunhos na navegação e confirma exclusão.
- Chrome: setas e Home atualizam seleção e foco do calendário; movimento reduzido desativa a elevação dos cards.
- Contraste medido no navegador: aproximadamente 4,96:1 em botões primários e 4,84:1 em links primários sobre creme.

## Pendências de validação

Testar em dispositivos físicos, Safari e Firefox; conferir áreas seguras e teclado virtual em hardware real; realizar avaliação com leitor de tela. As verificações realizadas não constituem uma auditoria completa de conformidade WCAG.
