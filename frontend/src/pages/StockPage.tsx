import { AlertTriangle, ArrowLeftRight, Boxes, Package } from "lucide-react";
import type { Product } from "../types/inventory";
import { PageHeader, Stat, Status } from "../components/common";

export function StockPage({
  products,
  onMovement,
}: {
  products: Product[];
  onMovement: () => void;
}) {
  const total = products.reduce((s: number, p: Product) => s + p.stock, 0);
  return (
    <>
      <PageHeader
        eyebrow="CONTROLE OPERACIONAL"
        title="Estoque"
        subtitle="Acompanhe os níveis e identifique itens que precisam de reposição."
        action={
          <button className="btn btn-primary" onClick={onMovement}>
            <ArrowLeftRight size={16} /> Nova movimentação
          </button>
        }
      />
      <div className="mini-stats">
        <Stat
          icon={<Boxes />}
          label="Unidades monitoradas"
          value={total.toLocaleString("pt-BR")}
          trend="Saldo atual"
          positive
        />
        <Stat
          icon={<AlertTriangle />}
          label="Abaixo do mínimo"
          value={
            products.filter((p: Product) => p.stock > 0 && p.stock <= p.minimum)
              .length
          }
          trend="Requer atenção"
          positive={false}
        />
        <Stat
          icon={<Package />}
          label="Sem estoque"
          value={products.filter((p: Product) => p.stock === 0).length}
          trend="Reposição necessária"
          positive={false}
        />
      </div>
      <section className="panel table-panel">
        <div className="panel-heading">
          <h3>Níveis de estoque por produto</h3>
          <span className="muted">
            Acompanhamento em tempo real (demonstrativo)
          </span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Saldo atual</th>
                <th>Mínimo</th>
                <th>Nível</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: Product) => (
                <tr key={p.id}>
                  <td>
                    <b>{p.name}</b>
                    <small className="subline">{p.sku}</small>
                  </td>
                  <td>{p.stock} un.</td>
                  <td>{p.minimum} un.</td>
                  <td>
                    <div className="stock-bar">
                      <span
                        style={{
                          width: `${Math.min(100, (p.stock / Math.max(1, p.minimum * 2)) * 100)}%`,
                          background:
                            p.stock === 0
                              ? "#ef6464"
                              : p.stock <= p.minimum
                                ? "#e9b84f"
                                : "#35d36b",
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <Status status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
