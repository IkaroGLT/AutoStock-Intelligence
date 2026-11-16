import type { Dispatch, FormEvent, SetStateAction } from "react";
import { AlertTriangle, Check, ShieldCheck } from "lucide-react";
import type { CorrectionFormState, Movement, MovementFormState, Product } from "../types/inventory";
import { Field, Modal } from "./common";

export function MovementDialogs({
  modal, products, movementForm, setMovementForm, correctionForm, setCorrectionForm,
  selectedMovement, correctingProduct, onClose, onSaveMovement, onSaveCorrection,
}: {
  modal: "view-product" | "product" | "edit-product" | "movement" | "correction" | "login" | null;
  products: Product[];
  movementForm: MovementFormState;
  setMovementForm: Dispatch<SetStateAction<MovementFormState>>;
  correctionForm: CorrectionFormState;
  setCorrectionForm: Dispatch<SetStateAction<CorrectionFormState>>;
  selectedMovement: Movement | null;
  correctingProduct: Product | undefined;
  onClose: () => void;
  onSaveMovement: (event: FormEvent) => void;
  onSaveCorrection: (event: FormEvent) => void;
}) {
  return (
    <>
      {modal === "movement" && (
        <Modal
          title="Nova movimentação"
          subtitle="Registre uma entrada ou saída de estoque."
          onClose={() => onClose()}
        >
          <form onSubmit={onSaveMovement} className="form-grid">
            <Field label="Produto">
              <select
                value={movementForm.productId}
                onChange={(e) =>
                  setMovementForm({ ...movementForm, productId: e.target.value })
                }
              >
                {products.map((p) => (
                  <option key={p.id} value={String(p.id)}>{p.name} — {p.sku}</option>
                ))}
              </select>
            </Field>
            <Field label="Tipo de movimentação">
              <select
                value={movementForm.type}
                onChange={(e) =>
                  setMovementForm({ ...movementForm, type: e.target.value })
                }
              >
                <option>Entrada</option>
                <option>Saída</option>
              </select>
            </Field>
            <Field label="Quantidade">
              <input
                type="number"
                min="1"
                required
                value={movementForm.quantity}
                onChange={(e) =>
                  setMovementForm({ ...movementForm, quantity: e.target.value })
                }
              />
            </Field>
            <div className="info-note">
              <ShieldCheck size={17} /> Validação demonstrativa no frontend. As
              regras definitivas serão aplicadas pela API.
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => onClose()}
              >
                Cancelar
              </button>
              <button className="btn btn-primary">
                <Check size={16} /> Confirmar
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === "correction" && selectedMovement && (
        <Modal
          title="Corrigir lançamento"
          subtitle="Ajuste uma entrada registrada incorretamente."
          onClose={() => onClose()}
        >
          <form onSubmit={onSaveCorrection} className="form-grid">
            <div className="correction-summary">
              <span>Movimentação original #{selectedMovement.id}</span>
              <b>{selectedMovement.product}</b>
              <small>
                Quantidade originalmente lançada:{" "}
                <strong>{Math.abs(selectedMovement.quantity)} un.</strong>
              </small>
            </div>
            <Field label="Quantidade correta">
              <input
                type="number"
                min="0"
                required
                value={correctionForm.quantity}
                onChange={(e) =>
                  setCorrectionForm({
                    ...correctionForm,
                    quantity: e.target.value,
                  })
                }
              />
            </Field>
            <Field label="Justificativa obrigatória">
              <textarea
                required
                rows={3}
                value={correctionForm.reason}
                onChange={(e) =>
                  setCorrectionForm({
                    ...correctionForm,
                    reason: e.target.value,
                  })
                }
                placeholder="Explique o motivo da correção..."
              />
            </Field>
            <div className="projection">
              <div>
                <small>Diferença</small>
                <b>
                  {correctionForm.quantity === ""
                    ? "—"
                    : `${Number(correctionForm.quantity) - Math.abs(selectedMovement.quantity) > 0 ? "+" : ""}${Number(correctionForm.quantity) - Math.abs(selectedMovement.quantity)} un.`}
                </b>
              </div>
              <div>
                <small>Saldo projetado</small>
                <b>
                  {correctionForm.quantity === ""
                    ? "—"
                    : correctingProduct
                      ? `${correctingProduct.stock + Number(correctionForm.quantity) - Math.abs(selectedMovement.quantity)} un.`
                      : "Produto não identificado"}
                </b>
              </div>
            </div>
            <div className="info-note">
              <AlertTriangle size={17} /> A correção será registrada como um
              novo evento, preservando o lançamento original.
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => onClose()}
              >
                Cancelar
              </button>
              <button className="btn btn-primary">
                <Check size={16} /> Confirmar correção
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
