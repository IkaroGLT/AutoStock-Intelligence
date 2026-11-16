import { useState } from "react";
import { Activity, ArrowRight, ClipboardList, CloudUpload, FileSpreadsheet } from "lucide-react";
import { Empty, PageHeader } from "../components/common";

export function AutomationPage({ onToast }: { onToast: (message: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  return (
    <>
      <PageHeader
        eyebrow="PROCESSOS AUTOMATIZADOS"
        title="Automação e Alertas"
        subtitle="Acompanhe importações, sincronizações e eventos do estoque."
      />
      <div className="automation-grid">
        <section className="panel import-panel">
          <div className="panel-title">
            <FileSpreadsheet className="gold-icon" />
            <div>
              <h3>Importar planilha</h3>
              <small>Carregue arquivos CSV ou XLSX.</small>
            </div>
          </div>
          <label className="upload-zone">
            <CloudUpload size={31} />
            <b>
              {file
                ? file.name
                : "Arraste sua planilha ou clique para selecionar"}
            </b>
            <small>Formatos aceitos: .CSV e .XLSX</small>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <button
            className="btn btn-primary"
            disabled={!file}
            onClick={() =>
              onToast(
                "Arquivo selecionado. O processamento real será integrado na AS-06.",
              )
            }
          >
            Enviar para processamento
          </button>
          <p className="muted tiny-note">
            Demonstração visual: o arquivo não será enviado a um servidor.
          </p>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h3>Status das sincronizações</h3>
            <span className="status-pill pending">Preparado</span>
          </div>
          <div className="sync-row">
            <span className="sync-icon">
              <CloudUpload />
            </span>
            <div>
              <b>Importação de produtos</b>
              <small>Aguardando integração com API</small>
            </div>
            <span className="muted">—</span>
          </div>
          <div className="sync-row">
            <span className="sync-icon">
              <Activity />
            </span>
            <div>
              <b>Sincronização de estoque</b>
              <small>Aguardando integração com API</small>
            </div>
            <span className="muted">—</span>
          </div>
          <div className="sync-row">
            <span className="sync-icon">
              <ClipboardList />
            </span>
            <div>
              <b>Eventos processados</b>
              <small>Histórico demonstrativo</small>
            </div>
            <span className="muted">0</span>
          </div>
        </section>
      </div>
      <section className="panel table-panel automation-events">
        <div className="panel-heading">
          <h3>Monitoramento de eventos</h3>
          <button
            className="text-link"
            onClick={() =>
              onToast("Nenhuma falha registrada no ambiente demonstrativo.")
            }
          >
            Ver exceções <ArrowRight size={14} />
          </button>
        </div>
        <Empty text="Nenhum evento processado até o momento. Os eventos aparecerão aqui após a integração da AS-06." />
      </section>
    </>
  );
}
