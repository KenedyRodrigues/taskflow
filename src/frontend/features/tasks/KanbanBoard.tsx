"use client";

import { useState, type DragEvent } from "react";
import {
  CheckCircle2,
  Circle,
  Clock3,
  GripVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { labels, type Status, type Task } from "@/frontend/lib/types";
import TaskMedia from "./TaskMedia";

const columns: Status[] = ["todo", "doing", "done"];
const icons = { todo: Circle, doing: Clock3, done: CheckCircle2 };

type Props = {
  tasks: Task[];
  busy: boolean;
  onMove: (task: Task, status: Status) => Promise<void>;
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

export default function KanbanBoard({
  tasks,
  busy,
  onMove,
  onOpen,
  onEdit,
  onDelete,
}: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [over, setOver] = useState<Status | null>(null);

  function startDrag(event: DragEvent<HTMLElement>, task: Task) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", task.id);
    setDraggingId(task.id);
  }

  async function drop(event: DragEvent<HTMLElement>, status: Status) {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain") || draggingId;
    const task = tasks.find((item) => item.id === id);
    setDraggingId(null);
    setOver(null);
    if (task && task.status !== status) await onMove(task, status);
  }

  return (
    <div className="kanban-board" aria-label="Quadro Kanban">
      {columns.map((status) => {
        const Icon = icons[status];
        const columnTasks = tasks.filter((task) => task.status === status);
        return (
          <section
            className={"kanban-column" + (over === status ? " is-over" : "")}
            key={status}
            aria-label={labels[status]}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              setOver(status);
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node))
                setOver(null);
            }}
            onDrop={(event) => void drop(event, status)}
          >
            <header className={"kanban-column-heading " + status}>
              <span>
                <Icon size={15} />
                {labels[status]}
              </span>
              <strong>{columnTasks.length}</strong>
            </header>
            <div className="kanban-cards">
              {columnTasks.map((task) => (
                <article
                  className={
                    "kanban-card" +
                    (draggingId === task.id ? " is-dragging" : "")
                  }
                  draggable={!busy}
                  key={task.id}
                  onDragStart={(event) => startDrag(event, task)}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setOver(null);
                  }}
                >
                  <div className="kanban-card-top">
                    <GripVertical
                      size={16}
                      aria-hidden="true"
                      className="drag-handle"
                    />
                    <span className={"badge " + task.status}>
                      {labels[task.status]}
                    </span>
                    <div className="row-actions">
                      <button
                        className="icon-button"
                        aria-label={"Editar " + task.title}
                        onClick={() => onEdit(task)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="icon-button delete"
                        disabled={busy}
                        aria-label={"Excluir " + task.title}
                        onClick={() => onDelete(task)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <button
                    className="kanban-card-text"
                    aria-label={"Abrir detalhes de " + task.title}
                    onClick={() => onOpen(task)}
                  >
                    <h3>{task.title}</h3>
                    {task.description && <p>{task.description}</p>}
                  </button>
                  <TaskMedia taskId={task.id} compact />
                  <div className="kanban-card-bottom">
                    <time dateTime={task.created_at}>
                      {new Date(task.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </time>
                    <label>
                      <span className="sr-only">Status de {task.title}</span>
                      <select
                        aria-label={"Mover " + task.title}
                        disabled={busy}
                        value={task.status}
                        onChange={(event) =>
                          void onMove(task, event.target.value as Status)
                        }
                      >
                        {columns.map((option) => (
                          <option key={option} value={option}>
                            {labels[option]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </article>
              ))}
              {!columnTasks.length && (
                <div className="kanban-empty">Arraste uma tarefa para cá</div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
