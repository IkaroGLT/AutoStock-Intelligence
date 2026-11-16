import type { Dispatch, FormEvent, SetStateAction } from "react";
import { Check, Pencil, ShieldCheck } from "lucide-react";
import type { Product, ProductFormState } from "../types/inventory";
import { Field, Modal } from "./common";
import { money } from "../lib/format";

export function ProductDialogs({
  modal, selectedProduct, productForm, setProductForm, onClose, onEditSelected, onSaveProduct,
}: {
  modal: "view-product" | "product" | "edit-product" | "movement" | "correction" | "login" | null;
  selectedProduct: Product | undefined;
  productForm: ProductFormState;
  setProductForm: Dispatch<SetStateAction<ProductFormState>>;
  onClose: () => void;
  onEditSelected: (product: Product) => void;
  onSaveProduct: (event: FormEvent) => void;
}) {
  return (
    <>
      {modal === "view-product" && selectedProduct && (
        <Modal
          title="Detalhes do produto"
          subtitle="Consulte as informações do item selecionado."
          onClose={() => onClose()}
        >
          <div className="form-grid">
            {[
              ["Identificador", String(selectedProduct.id)],
              ["Nome", selectedProduct.name],
              ["SKU", selectedProduct.sku],
              ["Categoria", selectedProduct.category],
              ["Quantidade", `${selectedProduct.stock} un.`],
              ["Estoque mínimo", `${selectedProduct.minimum} un.`],
              ["Preço unitário", money(selectedProduct.price)],
              ["Situação", selectedProduct.status],
            ].map(([label, value]) => (
              <div className="field" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => onClose()}>
                Fechar
              </button>
              <button className="btn btn-primary" onClick={() => onEditSelected(selectedProduct)}>
                <Pencil size={16} /> Editar produto
              </button>
            </div>
          </div>
        </Modal>
      )}
      {(modal === "product" || modal === "edit-product") && (
        <Modal
          title={modal === "edit-product" ? "Editar produto" : "Cadastrar produto"}
          subtitle={modal === "edit-product" ? "Atualize os dados cadastrais do item." : "Adicione um novo item ao catálogo."}
          onClose={() => onClose()}
        >
          <form onSubmit={onSaveProduct} className="form-grid">
            <Field label="Nome do produto">
              <input
                required
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
                placeholder="Ex.: Jogo educativo"
              />
            </Field>
            <Field label="SKU">
              <input
                required
                value={productForm.sku}
                onChange={(e) =>
                  setProductForm({ ...productForm, sku: e.target.value })
                }
                placeholder="Ex.: JOG-001"
              />
            </Field>
            <Field label="Categoria">
              <select
                value={productForm.category}
                onChange={(e) =>
                  setProductForm({ ...productForm, category: e.target.value })
                }
              >
                <option>Brinquedos</option>
                <option>Jogos</option>
                <option>Pelúcias</option>
                <option>Brinquedos educativos</option>
                <option>Educativos</option>
              </select>
            </Field>
            <Field label={modal === "edit-product" ? "Saldo atual (somente leitura)" : "Quantidade inicial"}>
              <input
                type="number"
                min="0"
                required
                readOnly={modal === "edit-product"}
                value={productForm.stock}
                onChange={(e) =>
                  setProductForm({ ...productForm, stock: e.target.value })
                }
              />
            </Field>
            {modal === "edit-product" && (
              <div className="info-note">
                <ShieldCheck size={17} /> Altere o saldo somente em Movimentações para preservar o histórico.
              </div>
            )}
            <Field label="Estoque mínimo">
              <input
                type="number"
                min="0"
                required
                value={productForm.minimum}
                onChange={(e) =>
                  setProductForm({ ...productForm, minimum: e.target.value })
                }
              />
            </Field>
            <Field label="Preço unitário (R$)">
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={productForm.price}
                onChange={(e) =>
                  setProductForm({ ...productForm, price: e.target.value })
                }
              />
            </Field>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => onClose()}
              >
                Cancelar
              </button>
              <button className="btn btn-primary">
                <Check size={16} /> {modal === "edit-product" ? "Salvar alterações" : "Salvar produto"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
