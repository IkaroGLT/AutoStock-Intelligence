import type * as React from "react";
import { Package, X } from "lucide-react";

export function Stat({
  icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  trend: string;
  positive?: boolean;
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <span>{label}</span>
        <strong>{value}</strong>
        <small className={positive === undefined ? "muted" : positive ? "trend-up" : "trend-down"}>
          {positive === undefined ? "" : positive ? "▲ " : "▼ "}{trend}
        </small>
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="modal">
        <div className="modal-heading">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar">
            <X />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
export function Status({ status }: { status: string }) {
  const cls =
    status === "Entrada"
      ? "good"
      : status === "Saída"
        ? "bad"
        : status === "Correção"
          ? "info"
          : status === "Em estoque"
            ? "good"
            : status === "Abaixo do mínimo"
              ? "warning"
              : "bad";
  return <span className={`status-pill ${cls}`}>{status}</span>;
}
export function Empty({ text }: { text: string }) {
  return (
    <div className="empty-state">
      <Package size={25} />
      <span>{text}</span>
    </div>
  );
}
