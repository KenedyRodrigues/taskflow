"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, LoaderCircle, Paperclip, X } from "lucide-react";
import { supabase } from "@/frontend/lib/supabase";
import { api } from "@/frontend/lib/api";
import {
  labels,
  type Task,
  type Status,
  type Attachment,
  errorMessage,
} from "@/frontend/lib/types";
import { AttachmentItem } from "./Attachments";
const accepted =
  "image/jpeg,image/png,image/webp,audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,audio/x-wav,audio/ogg";
export default function TaskEditor({
  task,
  onClose,
  onSaved,
}: {
  task: Task | "new";
  onClose: () => void;
  onSaved: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [id, setId] = useState(task === "new" ? null : task.id),
    [title, setTitle] = useState(task === "new" ? "" : task.title),
    [description, setDescription] = useState(
      task === "new" ? "" : (task.description ?? ""),
    ),
    [status, setStatus] = useState<Status>(
      task === "new" ? "todo" : task.status,
    );
  const [attachments, setAttachments] = useState<Attachment[]>([]),
    [files, setFiles] = useState<File[]>([]),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(task !== "new"),
    [error, setError] = useState(""),
    [progress, setProgress] = useState("");
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  useEffect(() => {
    if (!id || task === "new") return;
    setLoading(true);
    api<Attachment[]>("/api/tasks/" + id + "/attachments")
      .then(setAttachments)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);
  function choose(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    setError("");
    if (attachments.length + files.length + incoming.length > 5) {
      setError("São permitidos até 5 anexos por tarefa.");
      return;
    }
    for (const file of incoming) {
      if (!accepted.split(",").includes(file.type)) {
        setError("Formato não permitido: " + file.name);
        return;
      }
      if (
        !file.size ||
        file.size > (file.type.startsWith("image/") ? 5 : 20) * 1024 * 1024
      ) {
        setError("Imagens: até 5 MB. Áudios: até 20 MB.");
        return;
      }
    }
    setFiles((current) => [...current, ...incoming]);
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setProgress("Salvando tarefa…");
    let savedId = id;
    try {
      const saved = await api<Task>(id ? "/api/tasks/" + id : "/api/tasks", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify({ title, description, status }),
      });
      savedId = saved.id;
      setId(saved.id);
      for (const file of files) {
        setProgress("Enviando " + file.name + "…");
        const record = await api<Attachment>(
          "/api/tasks/" + saved.id + "/attachments",
          {
            method: "POST",
            body: JSON.stringify({
              name: file.name,
              mime_type: file.type,
              size: file.size,
            }),
          },
        );
        try {
          const { error } = await supabase.storage
            .from("task-attachments")
            .upload(record.path, file, {
              contentType: file.type,
              upsert: false,
            });
          if (error) throw error;
        } catch (err) {
          try {
            await api("/api/attachments/" + record.id, { method: "DELETE" });
          } catch {
            throw new Error(
              "Upload incompleto. Remova o anexo pendente antes de tentar novamente.",
            );
          }
          setError(
            "Tarefa salva, mas este arquivo foi rejeitado. Voc? pode remov?-lo ou tentar outro formato.",
          );
          continue;
        }
        setFiles((current) => current.filter((item) => item !== file));
        setAttachments((current) => [...current, record]);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError((savedId ? "Tarefa salva. " : "") + errorMessage(err));
      if (savedId) {
        try {
          setAttachments(
            await api<Attachment[]>("/api/tasks/" + savedId + "/attachments"),
          );
        } catch {}
      }
      onSaved();
    } finally {
      setBusy(false);
      setProgress("");
    }
  }
  return (
    <dialog
      ref={dialog}
      aria-labelledby="editor-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <div className="modal">
        <button
          className="modal-close icon-button"
          type="button"
          aria-label="Fechar janela"
          disabled={busy}
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h2 id="editor-title">
          {task === "new" ? "Nova tarefa" : "Editar tarefa"}
        </h2>
        <p>Defina os detalhes e adicione arquivos, se quiser.</p>
        <form onSubmit={save}>
          <label>
            Título *
            <input
              autoFocus
              required
              maxLength={160}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={busy}
            />
          </label>
          <label>
            Descrição <span className="optional">opcional</span>
            <textarea
              rows={3}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              {Object.entries(labels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="attachments-field">
            <legend>
              <Paperclip size={15} /> Imagens e áudios{" "}
              <span className="optional">opcional</span>
            </legend>
            <p>
              Até 5 arquivos. Imagens JPG, PNG ou WebP: 5 MB. Áudios MP3, M4A,
              WAV ou OGG: 20 MB.
            </p>
            {loading ? (
              <p role="status">Carregando anexos…</p>
            ) : (
              attachments.map((attachment) => (
                <AttachmentItem
                  key={attachment.id}
                  attachment={attachment}
                  disabled={busy}
                  onRemove={async () => {
                    setBusy(true);
                    setError("");
                    try {
                      await api("/api/attachments/" + attachment.id, {
                        method: "DELETE",
                      });
                      setAttachments((current) =>
                        current.filter((a) => a.id !== attachment.id),
                      );
                    } catch (err) {
                      setError(errorMessage(err));
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
              ))
            )}
            <label className="file-input">
              Adicionar arquivos
              <input
                aria-label="Adicionar arquivos"
                type="file"
                accept={accepted}
                multiple
                disabled={
                  busy || loading || attachments.length + files.length >= 5
                }
                onChange={(e) => {
                  choose(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
            {files.map((file, index) => (
              <div className="queued-file" key={index}>
                <span>{file.name}</span>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={"Retirar " + file.name}
                  disabled={busy}
                  onClick={() =>
                    setFiles((current) => current.filter((_, i) => i !== index))
                  }
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </fieldset>
          {error && (
            <p className="message error" role="alert">
              {error}
            </p>
          )}
          {progress && <p role="status">{progress}</p>}
          <div className="modal-actions">
            <button
              type="button"
              className="secondary"
              disabled={busy}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="primary"
              disabled={busy || loading || !title.trim()}
            >
              {busy ? (
                <LoaderCircle className="spin" size={16} />
              ) : (
                <Check size={16} />
              )}
              Salvar tarefa
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
