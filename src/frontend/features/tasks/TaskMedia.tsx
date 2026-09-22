"use client";

import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { api } from "@/frontend/lib/api";
import { errorMessage, type Attachment } from "@/frontend/lib/types";

function MediaAsset({
  attachment,
  compact,
}: {
  attachment: Attachment;
  compact: boolean;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api<{ url: string }>("/api/attachments/" + attachment.id)
      .then((result) => {
        if (active) setUrl(result.url);
      })
      .catch((reason) => {
        if (active) setError(errorMessage(reason));
      });
    return () => {
      active = false;
    };
  }, [attachment.id]);

  if (error)
    return (
      <p className="task-media-error" role="alert">
        <AlertCircle size={13} /> {attachment.name}: arquivo indisponível
      </p>
    );
  if (!url)
    return (
      <div className="task-media-loading" role="status">
        <LoaderCircle className="spin" size={15} /> Carregando mídia…
      </div>
    );

  const fail = () => {
    setUrl("");
    setError("Não foi possível reproduzir este arquivo.");
  };

  if (attachment.mime_type.startsWith("image/"))
    return (
      <figure className="task-media-asset visual">
        <img src={url} alt={attachment.name} loading="lazy" onError={fail} />
        {!compact && <figcaption>{attachment.name}</figcaption>}
      </figure>
    );

  if (attachment.mime_type.startsWith("video/"))
    return (
      <figure className="task-media-asset visual">
        <video
          aria-label={attachment.name}
          controls={!compact}
          muted={compact}
          playsInline
          preload="metadata"
          src={url + "#t=0.1"}
          onError={fail}
        />
        {!compact && <figcaption>{attachment.name}</figcaption>}
      </figure>
    );

  return (
    <div className="task-media-asset audio">
      {!compact && <strong>{attachment.name}</strong>}
      <audio controls preload="metadata" src={url} onError={fail}>
        Seu navegador não suporta reprodução de áudio.
      </audio>
    </div>
  );
}

export default function TaskMedia({
  taskId,
  compact = false,
}: {
  taskId: string;
  compact?: boolean;
}) {
  const [attachments, setAttachments] = useState<Attachment[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api<Attachment[]>("/api/tasks/" + taskId + "/attachments")
      .then((items) => {
        if (active) setAttachments(items);
      })
      .catch((reason) => {
        if (active) setError(errorMessage(reason));
      });
    return () => {
      active = false;
    };
  }, [taskId]);

  if (error)
    return compact ? null : <p className="task-media-error">{error}</p>;
  if (!attachments)
    return compact ? null : (
      <div className="task-media-loading" role="status">
        <LoaderCircle className="spin" size={15} /> Carregando anexos…
      </div>
    );
  if (!attachments.length)
    return compact ? null : (
      <p className="task-media-empty">Nenhum arquivo anexado.</p>
    );

  const shown = compact
    ? [
        attachments.find((item) => item.mime_type.startsWith("image/")),
        attachments.find((item) => item.mime_type.startsWith("video/")),
        attachments.find((item) => item.mime_type.startsWith("audio/")),
      ].filter((item): item is Attachment => Boolean(item))
    : attachments;

  return (
    <div className={"task-media" + (compact ? " compact" : " detailed")}>
      {shown.map((attachment) => (
        <MediaAsset
          key={attachment.id}
          attachment={attachment}
          compact={compact}
        />
      ))}
    </div>
  );
}
