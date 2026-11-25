import { Boxes, Download, Package, Sparkles, TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Product } from "../types/inventory";
import { PageHeader, Stat } from "../components/common";
import { money } from "../lib/format";

export function ReportsPage({
  products,
  totalUnits,
  stockValue,
}: {
  products: Product[];
  totalUnits: number;
  stockValue: number;
}) {
  const data = products.slice(0, 6).map((p: Product) => ({
    name: p.name.length > 16 ? p.name.slice(0, 16) + "…" : p.name,
    units: p.stock,
  }));
  return (
    <>
      <PageHeader
        eyebrow="INTELIGÊNCIA DE DADOS"
        title="Relatórios"
        subtitle="Indicadores e visão consolidada do seu estoque."
        action={
          <button
            className="btn btn-outline"
            onClick={() => {
              const csv = [
                "Produto,SKU,Estoque,Mínimo,Preço",
                ...products.map(
                  (p: Product) =>
                    `${p.name},${p.sku},${p.stock},${p.minimum},${p.price}`,
                ),
              ].join("\\n");
              const a = document.createElement("a");
              a.href = URL.createObjectURL(
                new Blob([csv], { type: "text/csv" }),
              );
              a.download = "autostock-relatorio.csv";
              a.click();
              URL.revokeObjectURL(a.href);
            }}
          >
            <Download size={16} /> Exportar CSV
          </button>
        }
      />
      <div className="mini-stats">
        <Stat
          icon={<Boxes />}
          label="Unidades totais"
          value={totalUnits.toLocaleString("pt-BR")}
          trend="Consolidado"
          positive
        />
        <Stat
          icon={<TrendingUp />}
          label="Valor estimado"
          value={money(stockValue)}
          trend="Valor de referência"
          positive
        />
        <Stat
          icon={<Package />}
          label="Produtos cadastrados"
          value={products.length}
          trend="Catálogo ativo"
          positive
        />
      </div>
      <div className="report-grid">
        <section className="panel">
          <div className="panel-heading">
            <h3>Unidades por produto</h3>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid stroke="#303136" strokeDasharray="3 4" />
                <XAxis dataKey="name" stroke="#85868c" fontSize={10} />
                <YAxis stroke="#85868c" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "#202124",
                    border: "1px solid #45464b",
                    borderRadius: 10,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="units"
                  stroke="#e9b84f"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel forecast-panel">
          <Sparkles size={23} className="gold-icon" />
          <h3>Previsão de demanda</h3>
          <p className="muted">
            Área reservada para os indicadores preditivos de demanda que serão
            desenvolvidos na AS-08.
          </p>
          <span className="status-pill pending">Em planejamento</span>
        </section>
      </div>
    </>
  );
}
