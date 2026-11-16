import { Eye, Filter, Package, Pencil, Plus, Search } from "lucide-react";
import type { Product } from "../types/inventory";
import { Empty, PageHeader, Status } from "../components/common";

export function ProductsPage({
  products,
  query,
  setQuery,
  clearGlobalQuery,
  category,
  setCategory,
  status,
  setStatus,
  onAdd,
  onView,
  onEdit,
}: {
  products: Product[];
  query: string;
  setQuery: (value: string) => void;
  clearGlobalQuery: () => void;
  category: string;
  setCategory: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  onAdd: () => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="CATÁLOGO"
        title="Produtos"
        subtitle="Gerencie os produtos cadastrados no seu estoque."
        action={
          <button className="btn btn-primary" onClick={onAdd}>
            <Plus size={16} /> Cadastrar produto
          </button>
        }
      />
      <section className="panel table-panel">
        <div className="toolbar">
          <div className="filter-search">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar por nome ou SKU..."
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Todas</option>
            {[
              "Brinquedos educativos",
              "Jogos",
              "Pelúcias",
              "Brinquedos",
              "Educativos",
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Todas</option>
            <option>Em estoque</option>
            <option>Abaixo do mínimo</option>
            <option>Sem estoque</option>
          </select>
          <button
            className="btn btn-outline"
            onClick={() => {
              setQuery("");
              clearGlobalQuery();
              setCategory("Todas");
              setStatus("Todas");
            }}
          >
            <Filter size={15} /> Limpar
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>SKU</th>
                <th>Categoria</th>
                <th>Quantidade</th>
                <th>Estoque mínimo</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: Product) => (
                <tr key={p.id}>
                  <td>
                    <div className="product-cell">
                      <span className="product-thumb">
                        <Package size={17} />
                      </span>
                      <b>{p.name}</b>
                    </div>
                  </td>
                  <td className="muted">{p.sku}</td>
                  <td>{p.category}</td>
                  <td>
                    <b>{p.stock} un.</b>
                  </td>
                  <td>{p.minimum} un.</td>
                  <td>
                    <Status status={p.status} />
                  </td>
                  <td>
                    <button
                      className="table-icon"
                      onClick={() => onView(p)}
                      aria-label={`Ver produto ${p.name} (${p.sku})`}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="table-icon"
                      onClick={() => onEdit(p)}
                      aria-label={`Editar produto ${p.name} (${p.sku})`}
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <Empty text="Nenhum produto encontrado com esses filtros." />
          )}
        </div>
        <div className="table-footer">
          Exibindo <b>{products.length}</b> produto(s) • Dados fictícios
        </div>
      </section>
    </>
  );
}
