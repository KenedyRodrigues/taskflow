"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  ArrowRight,
  Check,
  CheckCheck,
  CheckCircle2,
  Circle,
  Clock3,
  LayoutGrid,
  ListTodo,
  LoaderCircle,
  LogOut,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
type Status = "todo" | "doing" | "done";
type Task = {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  created_at: string;
};
const labels = { todo: "A fazer", doing: "Em andamento", done: "Concluída" };
const icons = { todo: Circle, doing: Clock3, done: CheckCircle2 };
function message(err: unknown) {
  const text =
    err && typeof err === "object" && "message" in err
      ? String(err.message)
      : "";
  if (/Invalid login credentials/i.test(text))
    return "E-mail ou senha incorretos.";
  if (/Email not confirmed/i.test(text))
    return "Confirme seu e-mail antes de entrar.";
  if (/already registered/i.test(text))
    return "Este e-mail já está cadastrado.";
  if (/rate limit/i.test(text))
    return "Muitas tentativas. Aguarde um momento e tente novamente.";
  return "Não foi possível concluir a operação. Verifique sua conexão e a configuração do Supabase e tente novamente.";
}
export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!supabase);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState<Status | "all">("all");
  const [query, setQuery] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [signup, setSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editor, setEditor] = useState<Task | "new" | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("todo");
  const [reload, setReload] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const generation = useRef(0);
  const userId = session?.user.id;
  useEffect(() => {
    if (!supabase) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setReady(true);
      if (next) setAuthOpen(false);
    });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    const version = ++generation.current;
    setTasks([]);
    setEditor(null);
    setDeleting(null);
    if (!supabase || !userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("tasks")
      .select("id,title,description,status,created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (version !== generation.current) return;
        if (error) setError(message(error));
        else setTasks((data ?? []) as Task[]);
        setLoading(false);
      });
    return () => {
      generation.current++;
    };
  }, [userId, reload]);
  const modalOpen = authOpen || editor !== null || deleting !== null;
  useEffect(() => {
    if (modalOpen) dialog.current?.showModal();
    else dialog.current?.close();
  }, [modalOpen]);
  function close() {
    if (busy) return;
    setAuthOpen(false);
    setEditor(null);
    setDeleting(null);
  }
  function open(task: Task | "new") {
    setError("");
    setNotice("");
    if (!session) {
      setAuthOpen(true);
      return;
    }
    setTitle(task === "new" ? "" : task.title);
    setDescription(task === "new" ? "" : (task.description ?? ""));
    setStatus(task === "new" ? "todo" : task.status);
    setEditor(task);
  }
  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const credentials = {
        email: String(data.get("email")).trim(),
        password: String(data.get("password")),
      };
      const result = signup
        ? await supabase.auth.signUp({
            ...credentials,
            options: { emailRedirectTo: window.location.origin },
          })
        : await supabase.auth.signInWithPassword(credentials);
      if (result.error) throw result.error;
      if (signup && !result.data.session) {
        setNotice(
          "Confira seu e-mail para confirmar o cadastro e depois entre.",
        );
        setSignup(false);
      }
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
    }
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !session || !editor || !title.trim()) return;
    setBusy(true);
    setError("");
    const version = generation.current;
    try {
      const values = {
        title: title.trim(),
        description: description.trim() || null,
        status,
      };
      const result =
        editor === "new"
          ? await supabase.from("tasks").insert(values).select().single()
          : await supabase
              .from("tasks")
              .update(values)
              .eq("id", editor.id)
              .select()
              .single();
      if (result.error) throw result.error;
      if (version !== generation.current) return;
      setTasks((current) =>
        editor === "new"
          ? [result.data as Task, ...current]
          : current.map((t) =>
              t.id === result.data.id ? (result.data as Task) : t,
            ),
      );
      setEditor(null);
      setNotice(
        editor === "new"
          ? "Tarefa criada. Um passo mais perto!"
          : "Tarefa atualizada.",
      );
    } catch (err) {
      if (version === generation.current) setError(message(err));
    } finally {
      setBusy(false);
    }
  }
  async function toggle(task: Task) {
    if (!supabase || busy) return;
    setBusy(true);
    setError("");
    const version = generation.current;
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({ status: task.status === "done" ? "todo" : "done" })
        .eq("id", task.id)
        .select()
        .single();
      if (error) throw error;
      if (version === generation.current)
        setTasks((current) =>
          current.map((t) => (t.id === task.id ? (data as Task) : t)),
        );
    } catch (err) {
      if (version === generation.current) setError(message(err));
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!supabase || !deleting) return;
    setBusy(true);
    setError("");
    const version = generation.current;
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", deleting.id)
        .select("id")
        .single();
      if (error) throw error;
      if (version !== generation.current) return;
      setTasks((current) => current.filter((t) => t.id !== deleting.id));
      setDeleting(null);
      setNotice("Tarefa excluída.");
    } catch (err) {
      if (version === generation.current) setError(message(err));
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    if (!supabase) return;
    setBusy(true);
    setError("");
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) throw error;
      setSession(null);
      setTasks([]);
      setNotice("Você saiu da sua conta.");
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
    }
  }
  const counts = {
    todo: tasks.filter((t) => t.status === "todo").length,
    doing: tasks.filter((t) => t.status === "doing").length,
    done: tasks.filter((t) => t.status === "done").length,
  };
  const visible = tasks.filter(
    (t) =>
      (filter === "all" || t.status === filter) &&
      `${t.title} ${t.description ?? ""}`
        .toLocaleLowerCase("pt-BR")
        .includes(query.toLocaleLowerCase("pt-BR")),
  );
  const progress = tasks.length
    ? Math.round((counts.done / tasks.length) * 100)
    : 0;
  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="/">
          <span className="brand-icon">
            <CheckCheck size={23} />
          </span>
          TaskFlow<span className="brand-dot">.</span>
        </a>
        <div className="workspace-label">ESPAÇO PESSOAL</div>
        <nav aria-label="Navegação principal">
          <button
            className="nav-item"
            onClick={() => {
              setFilter("all");
              setQuery("");
            }}
          >
            <LayoutGrid size={18} />
            Minhas tarefas<span>{tasks.length}</span>
          </button>
        </nav>
        <div className="sidebar-tip">
          <span className="tip-icon">
            <Sparkles size={19} />
          </span>
          <h3>
            Pequenos passos.
            <br />
            Grandes conquistas.
          </h3>
          <p>Organize suas ideias e faça espaço para o que importa.</p>
          <div className="tip-decoration">
            <span />
            <span />
            <span />
            <Check size={15} />
          </div>
        </div>
        <div className="profile">
          <div className="avatar">
            {session?.user.email?.slice(0, 1).toUpperCase() ?? "V"}
          </div>
          <div>
            <strong>{session ? "Minha conta" : "Bem-vindo!"}</strong>
            <span>{session?.user.email ?? "Seu dia, no seu ritmo"}</span>
          </div>
          {session ? (
            <button
              className="icon-button"
              aria-label="Sair da conta"
              onClick={logout}
              disabled={busy}
            >
              <LogOut size={17} />
            </button>
          ) : (
            <button
              className="icon-button"
              aria-label="Entrar na conta"
              onClick={() => setAuthOpen(true)}
            >
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Meu espaço</span>
            <span className="slash">/</span>Minhas tarefas
          </div>
          <span className="personal">
            <i />
            Espaço pessoal
          </span>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">MENOS RUÍDO, MAIS FOCO</div>
              <h1>
                Minhas tarefas<span>.</span>
              </h1>
              <p>Um lugar para organizar o dia e seguir em frente.</p>
            </div>
            <button className="primary" onClick={() => open("new")}>
              <Plus size={18} />
              Nova tarefa
            </button>
          </div>
          {(!supabase || (ready && !session)) && (
            <div className="configuration">
              <span>
                <strong>
                  {!supabase
                    ? "Seu espaço está quase pronto."
                    : "Seu próximo passo começa aqui."}
                </strong>{" "}
                {!supabase
                  ? "Conecte o Supabase para criar sua conta e salvar suas tarefas."
                  : "Entre na sua conta para ver suas tarefas."}
              </span>
              <button onClick={() => setAuthOpen(true)}>
                {!supabase ? "Começar" : "Entrar"}
                <ArrowRight size={15} />
              </button>
            </div>
          )}
          {!modalOpen && error && (
            <div className="message error" role="alert">
              {error}
              <button
                onClick={() => {
                  setError("");
                  setReload((n) => n + 1);
                }}
              >
                Tentar novamente
              </button>
            </div>
          )}
          {!modalOpen && notice && (
            <div className="message success" role="status">
              {notice}
              <button
                aria-label="Fechar mensagem"
                onClick={() => setNotice("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          <section className="stats" aria-label="Resumo das tarefas">
            {(
              [
                {
                  key: "all",
                  name: "Total de tarefas",
                  caption: "no seu espaço",
                  Icon: ListTodo,
                  tone: "neutral",
                },
                {
                  key: "todo",
                  name: "A fazer",
                  caption: "um passo de cada vez",
                  Icon: Circle,
                  tone: "amber",
                },
                {
                  key: "doing",
                  name: "Em andamento",
                  caption: "ideias em movimento",
                  Icon: Clock3,
                  tone: "blue",
                },
                {
                  key: "done",
                  name: "Concluídas",
                  caption: "motivos para celebrar",
                  Icon: CheckCircle2,
                  tone: "green",
                },
              ] as const
            ).map(({ key, name, caption, Icon, tone }) => (
              <button
                className="stat-card"
                key={key}
                onClick={() => setFilter(key)}
              >
                <div>
                  <span>{name}</span>
                  <strong>
                    {key === "all" ? tasks.length : counts[key]}
                    <small>{caption}</small>
                  </strong>
                </div>
                <span className={`stat-icon ${tone}`}>
                  <Icon size={21} />
                </span>
              </button>
            ))}
          </section>
          <section className="task-section" aria-label="Lista de tarefas">
            <div className="list-heading">
              <h2>Um pouco de organização, muito mais clareza.</h2>
              <span>{tasks.length} tarefas</span>
            </div>
            <div className="toolbar">
              <div className="filters" aria-label="Filtrar por status">
                {(["all", "todo", "doing", "done"] as const).map((f) => (
                  <button
                    key={f}
                    aria-pressed={filter === f}
                    className={filter === f ? "selected" : ""}
                    onClick={() => setFilter(f)}
                  >
                    {f === "all"
                      ? "Todas"
                      : f === "done"
                        ? "Concluídas"
                        : labels[f]}
                    <span>{f === "all" ? tasks.length : counts[f]}</span>
                  </button>
                ))}
              </div>
              <label className="search">
                <Search size={17} />
                <input
                  aria-label="Buscar tarefas"
                  placeholder="Buscar tarefa..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            </div>
            <div className="table-head">
              <span>TAREFA ↓</span>
              <span>STATUS</span>
              <span>CRIADA EM</span>
              <span className="sr-only">Ações</span>
            </div>
            {loading || !ready ? (
              <div className="empty">
                <LoaderCircle className="spin" size={28} />
                <h3>Organizando seu espaço…</h3>
              </div>
            ) : visible.length ? (
              <div>
                {visible.map((task) => {
                  const Icon = icons[task.status];
                  return (
                    <article
                      className={`task-row ${task.status === "done" ? "completed" : ""}`}
                      key={task.id}
                    >
                      <div className="task-details">
                        <button
                          className={`task-check ${task.status}`}
                          disabled={busy}
                          aria-label={`${task.status === "done" ? "Reabrir" : "Concluir"} ${task.title}`}
                          onClick={() => toggle(task)}
                        >
                          {task.status === "done" && <Check size={14} />}
                        </button>
                        <button
                          className="task-text"
                          onClick={() => open(task)}
                        >
                          <h3>{task.title}</h3>
                          {task.description && <p>{task.description}</p>}
                        </button>
                      </div>
                      <span className={`badge ${task.status}`}>
                        <Icon size={12} />
                        {labels[task.status]}
                      </span>
                      <time dateTime={task.created_at}>
                        {new Date(task.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </time>
                      <div className="row-actions">
                        <button
                          className="icon-button"
                          aria-label={`Editar ${task.title}`}
                          onClick={() => open(task)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="icon-button delete"
                          aria-label={`Excluir ${task.title}`}
                          onClick={() => {
                            setError("");
                            setNotice("");
                            setDeleting(task);
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="empty">
                <div className="empty-art">
                  <div className="paper">
                    <span />
                    <span />
                    <span />
                    <div>
                      <Check size={18} />
                    </div>
                  </div>
                  <span className="spark spark-one">✦</span>
                  <span className="spark spark-two">✧</span>
                </div>
                <h3>
                  {query || filter !== "all"
                    ? "Tudo tranquilo por aqui."
                    : "Dê espaço ao seu próximo passo."}
                </h3>
                <p>
                  {query || filter !== "all"
                    ? "Nenhuma tarefa corresponde a este filtro."
                    : "Uma ideia, um lembrete ou aquele plano de sempre."}
                  <br />
                  {!query &&
                    filter === "all" &&
                    "Crie sua primeira tarefa e deixe o resto fluir."}
                </p>
                {query || filter !== "all" ? (
                  <button
                    className="secondary"
                    onClick={() => {
                      setFilter("all");
                      setQuery("");
                    }}
                  >
                    Limpar filtros
                  </button>
                ) : (
                  <button className="primary" onClick={() => open("new")}>
                    <Plus size={17} />
                    Criar minha primeira tarefa
                  </button>
                )}
              </div>
            )}
            <div className="list-footer">
              <span>{visible.length} tarefas no seu espaço</span>
              <span>
                <CheckCheck size={15} />
                Tudo no seu tempo.
              </span>
            </div>
          </section>
          <section className="progress-panel">
            <span className="progress-icon">
              <Sparkles size={22} />
            </span>
            <div>
              <h3>Cada tarefa concluída é um avanço.</h3>
              <p>
                {tasks.length
                  ? `Você já concluiu ${counts.done} de ${tasks.length} tarefas. Continue no seu ritmo.`
                  : "O primeiro passo não precisa ser grande. Só precisa acontecer."}
              </p>
            </div>
            <div className="progress-meter">
              <div>
                <span>Seu progresso</span>
                <strong>{progress}%</strong>
              </div>
              <progress
                value={progress}
                max={100}
                aria-label="Progresso de tarefas concluídas"
              />
            </div>
          </section>
          <footer className="page-footer">
            <span>Feito para uma rotina mais leve.</span>
            <span>
              TaskFlow <b>✦</b> Um passo de cada vez.
            </span>
          </footer>
        </main>
      </div>
      <dialog
        ref={dialog}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
        aria-labelledby="dialog-title"
      >
        <div className="modal">
          <button
            className="modal-close icon-button"
            aria-label="Fechar janela"
            disabled={busy}
            onClick={close}
          >
            <X size={20} />
          </button>
          {authOpen ? (
            <>
              <span className="modal-symbol">
                <CheckCheck size={26} />
              </span>
              <h2 id="dialog-title">
                {signup ? "Seu espaço começa aqui." : "Bom ter você por aqui."}
              </h2>
              <p>
                {signup
                  ? "Crie sua conta e dê o primeiro passo."
                  : "Entre para continuar de onde parou."}
              </p>
              <form onSubmit={authenticate}>
                <label>
                  E-mail
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="voce@exemplo.com"
                    disabled={busy}
                  />
                </label>
                <label>
                  Senha
                  <input
                    name="password"
                    type="password"
                    autoComplete={signup ? "new-password" : "current-password"}
                    minLength={signup ? 8 : undefined}
                    maxLength={128}
                    required
                    placeholder={
                      signup ? "Pelo menos 8 caracteres" : "Sua senha"
                    }
                    disabled={busy}
                  />
                </label>
                {!supabase && (
                  <p className="setup-note">
                    Configure o Supabase conforme o README para habilitar
                    cadastro e login.
                  </p>
                )}
                <button className="primary full" disabled={busy || !supabase}>
                  {busy && <LoaderCircle className="spin" size={17} />}{" "}
                  {signup ? "Criar conta" : "Entrar"}
                  <ArrowRight size={17} />
                </button>
              </form>
              <div className="auth-switch">
                {signup ? "Já tem uma conta?" : "Ainda não tem conta?"}{" "}
                <button
                  disabled={busy}
                  onClick={() => {
                    setSignup(!signup);
                    setError("");
                    setNotice("");
                  }}
                >
                  {signup ? "Entrar" : "Cadastre-se"}
                </button>
              </div>
            </>
          ) : editor ? (
            <>
              <span className="eyebrow">UM PASSO DE CADA VEZ</span>
              <h2 id="dialog-title">
                {editor === "new"
                  ? "O que vamos fazer?"
                  : "Ajuste seu próximo passo."}
              </h2>
              <p>
                {editor === "new"
                  ? "Tire a ideia da cabeça e coloque no seu espaço."
                  : "Atualize os detalhes da sua tarefa."}
              </p>
              <form onSubmit={save}>
                <label>
                  Título *
                  <input
                    autoFocus
                    required
                    maxLength={160}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex.: Planejar a semana"
                    disabled={busy}
                  />
                </label>
                <label>
                  Descrição <span className="optional">opcional</span>
                  <textarea
                    maxLength={2000}
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Algum detalhe para lembrar?"
                    disabled={busy}
                  />
                </label>
                <label>
                  Status
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Status)}
                    disabled={busy}
                  >
                    {Object.entries(labels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="modal-actions">
                  <button
                    className="secondary"
                    type="button"
                    onClick={close}
                    disabled={busy}
                  >
                    Cancelar
                  </button>
                  <button className="primary" disabled={busy || !title.trim()}>
                    {busy ? (
                      <LoaderCircle size={16} className="spin" />
                    ) : (
                      <Check size={16} />
                    )}{" "}
                    {editor === "new" ? "Criar tarefa" : "Salvar alterações"}
                  </button>
                </div>
              </form>
            </>
          ) : deleting ? (
            <>
              <span className="modal-symbol danger">
                <Trash2 size={25} />
              </span>
              <h2 id="dialog-title">Excluir esta tarefa?</h2>
              <p>A tarefa “{deleting.title}” será excluída permanentemente.</p>
              <div className="modal-actions">
                <button className="secondary" onClick={close} disabled={busy}>
                  Cancelar
                </button>
                <button
                  className="danger-button"
                  onClick={remove}
                  disabled={busy}
                >
                  {busy ? "Excluindo…" : "Excluir tarefa"}
                </button>
              </div>
            </>
          ) : null}
          {error && (
            <div className="message error" role="alert">
              {error}
            </div>
          )}
          {notice && (
            <div className="message success" role="status">
              {notice}
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}
