import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BloomCard, CardHeading } from "@/components/ui/bloom";
import { expenseCategories, financeHistory, formatBRL } from "@/lib/finance";
import type { FinanceState, Transaction } from "@/types";

const COLORS = ["var(--plum)", "var(--primary)", "var(--champagne)", "var(--dusty)", "var(--rose)"];

export function FinanceCharts({
  finance,
  month,
  transactions,
}: {
  finance: FinanceState;
  month: string;
  transactions: Transaction[];
}) {
  const history = financeHistory(finance, month);
  const categories = expenseCategories(transactions);
  const hasHistory = history.some((item) => item.income || item.expenses);
  return (
    <div className="grid items-start gap-5 xl:grid-cols-2">
      <BloomCard>
        <CardHeading title="Seu ritmo financeiro" />
        <p className="mb-4 text-xs text-muted-foreground">
          Receitas e despesas nos últimos seis meses até o período selecionado.
        </p>
        {hasHistory ? (
          <>
            <div
              className="h-60 w-full min-w-0"
              role="img"
              aria-label="Receitas e despesas por mês. Os valores também estão disponíveis na tabela abaixo."
            >
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={history}
                  margin={{ top: 8, right: 4, left: -18, bottom: 0 }}
                  accessibilityLayer
                >
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "var(--plum)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                    tickFormatter={(value: number) =>
                      new Intl.NumberFormat("pt-BR", {
                        notation: "compact",
                        maximumFractionDigits: 2,
                      }).format(value / 100)
                    }
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [formatBRL(value), name]}
                    labelFormatter={(_label, payload) =>
                      (payload[0]?.payload?.month ?? "").split("-").reverse().join("/")
                    }
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="income"
                    name="Receitas"
                    fill="var(--plum)"
                    radius={[5, 5, 0, 0]}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Despesas"
                    fill="var(--rose)"
                    radius={[5, 5, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>● Receitas · vinho</span>
              <span>● Despesas · rosa antigo</span>
              <span>Valores em R$</span>
            </p>
            <details className="mt-4 text-xs text-plum">
              <summary className="cursor-pointer py-2">Ver valores por mês</summary>
              <table className="mt-2 w-full text-left">
                <caption className="sr-only">Receitas e despesas mensais em reais</caption>
                <thead>
                  <tr>
                    <th scope="col">Mês</th>
                    <th scope="col">Receitas</th>
                    <th scope="col">Despesas</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.month} className="border-t border-border">
                      <th scope="row" className="py-2 font-normal">
                        {item.month.split("-").reverse().join("/")}
                      </th>
                      <td>{formatBRL(item.income)}</td>
                      <td>{formatBRL(item.expenses)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </>
        ) : (
          <p className="grid min-h-40 place-items-center rounded-xl bg-blush/25 px-5 text-center text-sm text-muted-foreground">
            Seus registros vão dar forma a este gráfico.
          </p>
        )}
      </BloomCard>
      <BloomCard>
        <CardHeading title="Para onde vai seu dinheiro" />
        <p className="mb-3 text-xs text-muted-foreground">
          Despesas por categoria no mês selecionado.
        </p>
        {categories.length ? (
          <>
            <div
              className="h-44 min-w-0"
              role="img"
              aria-label="Distribuição das despesas por categoria. Os valores estão listados abaixo."
            >
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={72}
                    paddingAngle={3}
                    isAnimationActive={false}
                  >
                    {categories.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={COLORS[index % COLORS.length]}
                        stroke="var(--card)"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatBRL(value)}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2">
              {categories.map((item, index) => (
                <li key={item.name} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: COLORS[index % COLORS.length] }}
                      aria-hidden
                    />
                    {item.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-plum">{formatBRL(item.value)}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="grid min-h-40 place-items-center rounded-xl bg-blush/25 px-5 text-center text-sm text-muted-foreground">
            As categorias aparecem quando você registra despesas neste mês.
          </p>
        )}
      </BloomCard>
    </div>
  );
}
