import { Package, RotateCcw } from "lucide-react";
import type { Movement } from "../types/inventory";
import { Empty, Status } from "./common";

export function MovementTable({
  movements,
  compact = false,
  onCorrect,
  correctedMovementIds,
}: {
  movements: Movement[];
  compact?: boolean;
  onCorrect: (movement: Movement) => void;
  correctedMovementIds?: Set<number | undefined>;
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Produto</th>
            <th>Tipo</th>
            <th>Quantidade</th>
            <th>Saldo anterior</th>
            <th>Saldo atual</th>
            <th>Data e Hora</th>
            {!compact && <th>Ação</th>}
          </tr>
        </thead>
        <tbody>
          {movements.map((m: Movement) => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>
                <div className="product-cell">
                  <span className="tiny-product">
                    <Package size={14} />
                  </span>
                  <b>{m.product}</b>
                </div>
                {m.note && (
                  <small className="subline">Justificativa: {m.note}</small>
                )}
              </td>
              <td>
                <Status status={m.type} />
              </td>
              <td className={m.quantity < 0 ? "negative" : "positive"}>
                {m.quantity > 0 ? "+" : ""}
                {m.quantity}
              </td>
              <td>{m.before}</td>
              <td>{m.after}</td>
              <td className="nowrap">{m.date}</td>
              {!compact && (
                <td>
                  {m.type === "Entrada" && onCorrect && (
                    <button
                      className="btn btn-outline btn-small"
                      onClick={() => onCorrect(m)}
                      disabled={correctedMovementIds?.has(m.id)}
                    >
                      <RotateCcw size={14} /> {correctedMovementIds?.has(m.id) ? "Já corrigido" : "Corrigir lançamento"}
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {movements.length === 0 && (
        <Empty text="Nenhuma movimentação encontrada." />
      )}
    </div>
  );
}
