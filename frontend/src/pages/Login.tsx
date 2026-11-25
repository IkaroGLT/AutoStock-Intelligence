import { useState } from "react";
import { ArrowRight, Package } from "lucide-react";
import { Field } from "../components/common";

export function Login({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mark">
            <Package size={32} />
          </div>
          <div className="brand-name">
            Auto<span>Stock</span>
          </div>
        </div>
        <p className="eyebrow">GESTÃO INTELIGENTE DE ESTOQUE</p>
        <h1>Bem-vindo de volta</h1>
        <p className="muted">Entre na sua conta para continuar.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!user || !password) setError("Preencha seu usuário e senha.");
            else onLogin();
          }}
        >
          <Field label="Identificação">
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Seu usuário ou e-mail"
            />
          </Field>
          <Field label="Senha">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
            />
          </Field>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary login-submit">
            Entrar <ArrowRight size={17} />
          </button>
        </form>
        <small className="login-demo">
          Ambiente demonstrativo • autenticação fictícia
        </small>
      </div>
    </div>
  );
}
