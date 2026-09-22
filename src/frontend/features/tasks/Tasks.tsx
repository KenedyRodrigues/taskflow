"use client";
import { useRef, useState, useEffect } from "react";
import {
  Check,
  Circle,
  Clock3,
  CheckCircle2,
  Plus,
  Search,
  Pencil,
  Trash2,
  LoaderCircle,
} from "lucide-react";
import { api } from "@/frontend/lib/api";
import {
  labels,
  type Task,
  type Status,
  errorMessage,
} from "@/frontend/lib/types";
import { useTasks } from "@/frontend/hooks/useTasks";
import TaskEditor from "./TaskEditor";
const icons = { todo: Circle, doing: Clock3, done: CheckCircle2 };
export default function Tasks() {
  const { tasks, setTasks, loading, error: loadError, refresh } = useTasks();
  const [filter, setFilter] = useState<Status | "all">("all"),
    [query, setQuery] = useState(""),
    [editor, setEditor] = useState<Task | "new" | null>(null),
    [deleting, setDeleting] = useState<Task | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (deleting) dialog.current?.showModal();
    else dialog.current?.close();
  }, [deleting]);
  const counts = {
    todo: tasks.filter((t) => t.status === "todo").length,
    doing: tasks.filter((t) => t.status === "doing").length,
    done: tasks.filter((t) => t.status === "done").length,
  };
  const visible = tasks.filter(
    (t) =>
      (filter === "all" || t.status === filter) &&
      (t.title + " " + (t.description ?? ""))
        .toLocaleLowerCase("pt-BR")
        .includes(query.toLocaleLowerCase("pt-BR")),
  );
  async function toggle(task: Task) {
    setBusy(true);
    setError("");
    try {
      const saved = await api<Task>("/api/tasks/" + task.id, {
        method: "PATCH",
        body: JSON.stringify({
          ...task,
          status: task.status === "done" ? "todo" : "done",
        }),
      });
      setTasks((current) => current.map((t) => (t.id === task.id ? saved : t)));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!deleting) return;
    setBusy(true);
    setError("");
    try {
      await api("/api/tasks/" + deleting.id, { method: "DELETE" });
      setTasks((current) => current.filter((t) => t.id !== deleting.id));
      setDeleting(null);
      setNotice("Tarefa e anexos excluídos.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">SEU ESPAÇO PESSOAL</div>
          <h1>Minhas tarefas</h1>
          <p>Organize tarefas, detalhes e arquivos em um só lugar.</p>
        </div>
        <button className="primary" onClick={() => setEditor("new")}>
          <Plus size={18} />
          Nova tarefa
        </button>
      </div>
      {(error || loadError) && !deleting && (
        <div role="alert" className="message error">
          {error || loadError}
          <button
            onClick={() => {
              setError("");
              void refresh();
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}
      {notice && (
        <p className="message success" role="status">
          {notice}
        </p>
      )}
      <section className="stats" aria-label="Resumo das tarefas">
        {(["all", "todo", "doing", "done"] as const).map((key) => (
          <button
            className="stat-card"
            key={key}
            onClick={() => setFilter(key)}
          >
            <div>
              <span>{key === "all" ? "Total de tarefas" : labels[key]}</span>
              <strong>{key === "all" ? tasks.length : counts[key]}</strong>
            </div>
          </button>
        ))}
      </section>
      <section className="task-section" aria-label="Lista de tarefas">
        <div className="list-heading">
          <h2>Suas tarefas</h2>
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
                {f === "all" ? "Todas" : labels[f]}
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
          <span>TAREFA</span>
          <span>STATUS</span>
          <span>CRIADA EM</span>
          <span className="sr-only">Ações</span>
        </div>
        {loading ? (
          <div className="empty" role="status">
            <LoaderCircle className="spin" />
            <p>Carregando tarefas…</p>
          </div>
        ) : visible.length ? (
          visible.map((task) => {
            const Icon = icons[task.status];
            return (
              <article
                className={
                  "task-row" + (task.status === "done" ? " completed" : "")
                }
                key={task.id}
              >
                <div className="task-details">
                  <button
                    className={"task-check " + task.status}
                    disabled={busy}
                    aria-label={
                      (task.status === "done" ? "Reabrir " : "Concluir ") +
                      task.title
                    }
                    onClick={() => toggle(task)}
                  >
                    {task.status === "done" && <Check size={14} />}
                  </button>
                  <button className="task-text" onClick={() => setEditor(task)}>
                    <h3>{task.title}</h3>
                    {task.description && <p>{task.description}</p>}
                  </button>
                </div>
                <span className={"badge " + task.status}>
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
                    aria-label={"Editar " + task.title}
                    onClick={() => setEditor(task)}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="icon-button delete"
                    disabled={busy}
                    aria-label={"Excluir " + task.title}
                    onClick={() => {
                      setError("");
                      setDeleting(task);
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <div className="empty">
            <h3>
              {query || filter !== "all"
                ? "Nenhuma tarefa encontrada"
                : "Sua lista está vazia"}
            </h3>
            <p>
              {query || filter !== "all"
                ? "Tente outro filtro ou termo de busca."
                : "Crie sua primeira tarefa para começar."}
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
              <button className="primary" onClick={() => setEditor("new")}>
                <Plus size={17} />
                Criar tarefa
              </button>
            )}
          </div>
        )}
        <div className="list-footer">{visible.length} tarefas exibidas</div>
      </section>
      {editor && (
        <TaskEditor
          task={editor}
          onClose={() => setEditor(null)}
          onSaved={() => void refresh()}
        />
      )}
      <dialog
        ref={dialog}
        aria-labelledby="delete-title"
        onCancel={(e) => {
          e.preventDefault();
          if (!busy) setDeleting(null);
        }}
      >
        <div className="modal">
          <h2 id="delete-title">Excluir esta tarefa?</h2>
          <p>
            “{deleting?.title}” e seus anexos serão excluídos permanentemente.
          </p>
          {error && (
            <p className="message error" role="alert">
              {error}
            </p>
          )}
          <div className="modal-actions">
            <button
              className="secondary"
              disabled={busy}
              onClick={() => setDeleting(null)}
            >
              Cancelar
            </button>
            <button className="danger-button" disabled={busy} onClick={remove}>
              {busy ? "Excluindo…" : "Excluir tarefa"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
