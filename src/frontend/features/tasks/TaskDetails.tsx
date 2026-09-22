"use client";

import { useEffect, useRef } from "react";
import { CalendarDays, X } from "lucide-react";
import { labels, type Task } from "@/frontend/lib/types";
import TaskMedia from "./TaskMedia";

export default function TaskDetails({
  task,
  onClose,
}: {
  task: Task;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="task-details-dialog"
      aria-labelledby="task-details-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <article className="task-details-modal">
        <button
          className="modal-close icon-button"
          type="button"
          aria-label="Fechar detalhes"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <span className={"badge " + task.status}>{labels[task.status]}</span>
        <h2 id="task-details-title">{task.title}</h2>
        <div className="task-details-date">
          <CalendarDays size={14} />
          Criada em {new Date(task.created_at).toLocaleDateString("pt-BR")}
        </div>
        <section aria-labelledby="task-description-title">
          <h3 id="task-description-title">Descrição</h3>
          <p>{task.description || "Esta tarefa não possui descrição."}</p>
        </section>
        <section aria-labelledby="task-files-title">
          <h3 id="task-files-title">Arquivos</h3>
          <TaskMedia taskId={task.id} />
        </section>
      </article>
    </dialog>
  );
}
