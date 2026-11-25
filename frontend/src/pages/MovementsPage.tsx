import { useState } from "react";
import { Plus } from "lucide-react";
import type { Movement } from "../types/inventory";
import { PageHeader } from "../components/common";
import { MovementTable } from "../components/MovementTable";

export function MovementsPage({
  movements,
  onAdd,
  onCorrect,
}: {
  movements: Movement[];
  onAdd: () => void;
  onCorrect: (m: Movement) => void;
}) {
  const [filter, setFilter] = useState("Todas");
  const rows = movements.filter(
    (m: Movement) => filter === "Todas" || m.type === filter,
  );
  const correctedMovementIds = new Set(
    movements.filter((movement) => movement.correctionOf !== undefined)
      .map((movement) => movement.correctionOf),
  );
  return (
    <>
      <PageHeader
        eyebrow="HISTÓRICO OPERACIONAL"
        title="Movimentações"
        subtitle="Registre e consulte entradas, saídas e correções de estoque."
        action={
          <button className="btn btn-primary" onClick={onAdd}>
            <Plus size={16} /> Nova movimentação
          </button>
        }
      />
      <section className="panel table-panel">
        <div className="toolbar">
          <div>
            <h3>Histórico de movimentações</h3>
            <small className="muted">
              Consulte os lançamentos e suas alterações.
            </small>
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>Todas</option>
            <option>Entrada</option>
            <option>Saída</option>
            <option>Correção</option>
          </select>
        </div>
        <div className="table-scroll">
          <MovementTable movements={rows} onCorrect={onCorrect} correctedMovementIds={correctedMovementIds} />
        </div>
        <div className="table-footer">
          Correções são registradas como novos eventos; o lançamento original é
          preservado.
        </div>
      </section>
    </>
  );
}
