"use client";
import { useEffect, useState, type FormEvent } from "react";
import { CheckCheck, ArrowRight, LoaderCircle } from "lucide-react";
import { supabase } from "@/frontend/lib/supabase";
import { errorMessage } from "@/frontend/lib/types";
export default function Login() {
  const [signup, setSignup] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  useEffect(() => {
    if (
      new URLSearchParams(window.location.search).get("confirmation") ===
      "failed"
    )
      setError(
        "Não foi possível concluir a confirmação neste navegador. Tente entrar com e-mail e senha; se necessário, solicite um novo cadastro.",
      );
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    const credentials = {
      email: String(form.get("email")).trim(),
      password: String(form.get("password")),
    };
    try {
      const result = signup
        ? await supabase.auth.signUp({
            ...credentials,
            options: {
              emailRedirectTo: window.location.origin + "/auth/callback",
            },
          })
        : await supabase.auth.signInWithPassword(credentials);
      if (result.error) throw result.error;
      if (result.data.session) {
        window.location.replace("/tasks");
        return;
      }
      setNotice("Confira seu e-mail para confirmar o cadastro e depois entre.");
      setSignup(false);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-page">
      <section className="login-card">
        <a className="brand" href="/login">
          <span className="brand-icon">
            <CheckCheck size={25} />
          </span>
          TaskFlow
        </a>
        <h1>{signup ? "Crie sua conta" : "Entre no TaskFlow"}</h1>
        <p>Suas tarefas, organizadas em um espaço só seu.</p>
        <div className="auth-tabs">
          <button
            aria-pressed={!signup}
            disabled={busy}
            onClick={() => {
              setSignup(false);
              setError("");
            }}
          >
            Entrar
          </button>
          <button
            aria-pressed={signup}
            disabled={busy}
            onClick={() => {
              setSignup(true);
              setError("");
            }}
          >
            Criar conta
          </button>
        </div>
        <form onSubmit={submit}>
          <label>
            E-mail
            <input
              required
              name="email"
              type="email"
              autoComplete="email"
              placeholder="voce@exemplo.com"
              disabled={busy}
            />
          </label>
          <label>
            Senha
            <input
              required
              name="password"
              type="password"
              minLength={signup ? 8 : undefined}
              maxLength={128}
              autoComplete={signup ? "new-password" : "current-password"}
              placeholder={signup ? "Pelo menos 8 caracteres" : "Sua senha"}
              disabled={busy}
            />
          </label>
          <button className="primary full" disabled={busy}>
            {busy ? (
              <LoaderCircle className="spin" size={18} />
            ) : (
              <ArrowRight size={18} />
            )}{" "}
            {signup ? "Cadastrar" : "Acessar minhas tarefas"}
          </button>
        </form>
        {error && (
          <p className="message error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="message success" role="status">
            {notice}
          </p>
        )}
        <p className="login-footnote">
          Acesso exclusivo à sua conta. Suas tarefas e arquivos são privados.
        </p>
      </section>
    </main>
  );
}
