import { useMemo } from "react";
import { AlertTriangle, ArrowLeftRight, ArrowRight, Boxes, CalendarDays, ChartNoAxesCombined, CloudUpload, Download, Package, Plus, TrendingUp, Zap } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Movement, Product } from "../types/inventory";
import type { Page } from "../types/navigation";
import { Empty, Stat } from "../components/common";
import { MovementTable } from "../components/MovementTable";
import { money } from "../lib/format";
import { buildStockHistory, localDateValue } from "../lib/stock-history";

export function Dashboard({
  products,
  movements,
  low,
  empty,
  totalUnits,
  stockValue,
  period,
  setPeriod,
  referenceDate,
  setReferenceDate,
  onGo,
  onAdd,
  onMovement,
  onImport,
  onCorrect,
}: {
  products: Product[];
  movements: Movement[];
  low: number;
  empty: number;
  totalUnits: number;
  stockValue: number;
  period: string;
  setPeriod: (value: string) => void;
  referenceDate: string;
  setReferenceDate: (value: string) => void;
  onGo: (page: Page) => void;
  onAdd: () => void;
  onMovement: () => void;
  onImport: () => void;
  onCorrect: (movement: Movement) => void;
}) {
  const historyData = useMemo(
    () => buildStockHistory(products, movements, period, referenceDate),
    [products, movements, period, referenceDate],
  );
  const pieData = [
    {
      name: "Em estoque",
      value: Math.max(0, products.length - low - empty),
      color: "#35d36b",
    },
    { name: "Abaixo do mínimo", value: low, color: "#f2c94c" },
    { name: "Sem estoque", value: empty, color: "#777980" },
  ];
  const alerts = products.filter((p: Product) => p.status !== "Em estoque");
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">VISÃO GERAL</p>
          <h1>
            Olá, Ikaro! <span className="wave">👋</span>
          </h1>
          <p className="muted">Aqui está o resumo do seu estoque hoje.</p>
        </div>
        <label className="date-chip" title="Data final da análise de evolução do estoque">
          <CalendarDays size={17} />
          <span>Até</span>
          <input
            aria-label="Data final da análise de evolução do estoque"
            type="date"
            value={referenceDate}
            max={localDateValue(new Date())}
            onChange={(e) => setReferenceDate(e.target.value)}
            style={{ background: "transparent", color: "inherit", border: 0, colorScheme: "dark", font: "inherit" }}
          />
        </label>
      </div>
      <div className="stats-grid">
        <Stat
          icon={<Package />}
          label="Total de Produtos"
          value={String(products.length)}
          trend="Cadastros atuais"
        />
        <Stat
          icon={<Boxes />}
          label="Itens em Estoque"
          value={totalUnits.toLocaleString("pt-BR")}
          trend="Saldo atual"
        />
        <Stat
          icon={<AlertTriangle />}
          label="Abaixo do Mínimo"
          value={String(low)}
          trend="Situação atual"
        />
        <Stat
          icon={<TrendingUp />}
          label="Valor em Estoque"
          value={money(stockValue)}
          trend="Valor atual"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <div className="panel-heading">
            <div className="panel-title">
              <ChartNoAxesCombined className="gold-icon" />
              <div>
                <h3>Evolução do Estoque</h3>
                <small>Estimativa pelas movimentações registradas; dias sem histórico não são preenchidos</small>
              </div>
            </div>
            <select
              className="compact-select"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
              <option>Últimos 90 dias</option>
            </select>
          </div>
          <div className="chart-wrap">
            {historyData.some((point) => point.total !== null) ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e9b84f" stopOpacity={0.35} />
                    <stop
                      offset="100%"
                      stopColor="#e9b84f"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="#303136"
                  strokeDasharray="3 4"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  stroke="#85868c"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  stroke="#85868c"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <Tooltip
                  contentStyle={{
                    background: "#202124",
                    border: "1px solid #45464b",
                    borderRadius: 10,
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#e9b84f"
                  strokeWidth={2.5}
                  fill="url(#goldFill)"
                  activeDot={{ r: 5, fill: "#e9b84f" }}
                />
              </AreaChart>
            </ResponsiveContainer>
            ) : (
              <Empty text="Sem movimentações suficientes para analisar a data selecionada." />
            )}
          </div>
        </section>
        <section className="panel status-panel">
          <div className="panel-heading">
            <h3>Status do Estoque</h3>
          </div>
          <div className="donut-layout">
            <div className="donut">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    innerRadius="69%"
                    outerRadius="91%"
                    paddingAngle={3}
                    stroke="none"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <b>{products.length}</b>
                <small>Produtos</small>
              </div>
            </div>
            <div className="legend">
              {pieData.map((d) => (
                <div key={d.name}>
                  <i style={{ background: d.color }} />
                  <span>{d.name}</span>
                  <b>
                    {Math.round((d.value / Math.max(1, products.length)) * 100)}
                    %
                  </b>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="panel alerts-panel">
          <div className="panel-heading">
            <div className="panel-title">
              <AlertTriangle className="gold-icon" />
              <h3>Alertas de Estoque</h3>
            </div>
            <button className="text-link" onClick={() => onGo("Estoque")}>
              Ver todos <ArrowRight size={14} />
            </button>
          </div>
          <div className="alert-list">
            {alerts.slice(0, 4).map((p: Product) => (
              <div className="alert-row" key={p.id}>
                <span className="alert-product-icon">
                  <Package size={17} />
                </span>
                <div className="alert-copy">
                  <b>{p.name}</b>
                  <small>
                    Estoque: {p.stock} | Mínimo: {p.minimum}
                  </small>
                </div>
                <span className="alert-count">{p.stock} un</span>
              </div>
            ))}
            {alerts.length === 0 && <Empty text="Nenhum alerta de estoque." />}
          </div>
        </section>
        <section className="panel recent-panel">
          <div className="panel-heading">
            <div className="panel-title">
              <ArrowLeftRight className="gold-icon" />
              <h3>Movimentações Recentes</h3>
            </div>
            <button className="text-link" onClick={() => onGo("Movimentações")}>
              Ver histórico <ArrowRight size={14} />
            </button>
          </div>
          <MovementTable
            movements={movements.slice(0, 4)}
            compact
            onCorrect={onCorrect}
          />
        </section>
        <section className="panel quick-panel">
          <div className="panel-heading">
            <div className="panel-title">
              <Zap className="gold-icon" />
              <h3>Ações Rápidas</h3>
            </div>
          </div>
          <div className="quick-grid">
            <button className="quick-action primary" onClick={onAdd}>
              <Plus />
              <b>Cadastrar Produto</b>
            </button>
            <button className="quick-action" onClick={onMovement}>
              <ArrowLeftRight />
              <b>Nova Movimentação</b>
            </button>
            <button className="quick-action" onClick={onImport}>
              <CloudUpload />
              <b>Importar Planilha</b>
            </button>
            <button className="quick-action" onClick={() => onGo("Relatórios")}>
              <Download />
              <b>Exportar Estoque (CSV)</b>
            </button>
          </div>
        </section>
      </div>
      <div className="demo-footnote">
        <span className="demo-dot" /> Dados demonstrativos fictícios •
        preparados para integração com a API FastAPI
      </div>
    </>
  );
}
