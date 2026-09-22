"use client";
import { useState } from "react";
import { ImageIcon, Music2, Trash2, RefreshCw, Video } from "lucide-react";
import { api } from "@/frontend/lib/api";
import type { Attachment } from "@/frontend/lib/types";
export function AttachmentItem({
  attachment,
  onRemove,
  disabled,
}: {
  attachment: Attachment;
  onRemove: () => Promise<void>;
  disabled: boolean;
}) {
  const [url, setUrl] = useState(""),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [confirm, setConfirm] = useState(false);
  async function preview() {
    setLoading(true);
    setError("");
    try {
      setUrl(
        (await api<{ url: string }>("/api/attachments/" + attachment.id)).url,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Arquivo indisponível.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="attachment">
      <div className="attachment-title">
        {attachment.mime_type.startsWith("image/") ? (
          <ImageIcon size={18} />
        ) : attachment.mime_type.startsWith("video/") ? (
          <Video size={18} />
        ) : (
          <Music2 size={18} />
        )}
        <span>
          {attachment.name}
          <small>{(attachment.size / 1024 / 1024).toFixed(2)} MB</small>
        </span>
        <button
          type="button"
          className="icon-button"
          aria-label={"Remover " + attachment.name}
          disabled={disabled || loading}
          onClick={() => setConfirm(true)}
        >
          <Trash2 size={16} />
        </button>
      </div>
      {confirm ? (
        <div className="attachment-confirm">
          <span>Remover este arquivo agora?</span>
          <button
            type="button"
            disabled={disabled}
            onClick={async () => {
              await onRemove();
              setConfirm(false);
            }}
          >
            Remover
          </button>
          <button type="button" onClick={() => setConfirm(false)}>
            Cancelar
          </button>
        </div>
      ) : null}
      {url ? (
        attachment.mime_type.startsWith("image/") ? (
          <img
            src={url}
            alt={attachment.name}
            onError={() => {
              setUrl("");
              setError("Link expirado. Abra a prévia novamente.");
            }}
          />
        ) : attachment.mime_type.startsWith("video/") ? (
          <video
            aria-label={attachment.name}
            controls
            playsInline
            preload="metadata"
            src={url + "#t=0.1"}
            onError={() => {
              setUrl("");
              setError("Link expirado ou vídeo não suportado pelo navegador.");
            }}
          />
        ) : (
          <audio
            controls
            preload="metadata"
            src={url}
            onError={() => {
              setUrl("");
              setError(
                "Link expirado ou formato não suportado pelo navegador. Tente abrir novamente.",
              );
            }}
          />
        )
      ) : null}
      <button
        type="button"
        className="preview-button"
        onClick={preview}
        disabled={loading || disabled}
      >
        {url ? <RefreshCw size={13} /> : null}
        {loading ? "Abrindo…" : url ? "Renovar link" : "Abrir prévia"}
      </button>
      {error && (
        <p role="alert" className="attachment-error">
          {error}
        </p>
      )}
    </div>
  );
}
