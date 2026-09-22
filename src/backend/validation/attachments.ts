export const fileTypes: Record<string, { ext: string; limit: number }> = {
  "image/jpeg": { ext: "jpg", limit: 5 * 1024 * 1024 },
  "image/png": { ext: "png", limit: 5 * 1024 * 1024 },
  "image/webp": { ext: "webp", limit: 5 * 1024 * 1024 },
  "audio/mpeg": { ext: "mp3", limit: 20 * 1024 * 1024 },
  "audio/mp4": { ext: "m4a", limit: 20 * 1024 * 1024 },
  "audio/x-m4a": { ext: "m4a", limit: 20 * 1024 * 1024 },
  "audio/wav": { ext: "wav", limit: 20 * 1024 * 1024 },
  "audio/x-wav": { ext: "wav", limit: 20 * 1024 * 1024 },
  "audio/ogg": { ext: "ogg", limit: 20 * 1024 * 1024 },
};
export function attachmentInput(input: unknown) {
  if (!input || typeof input !== "object") throw new Error("Arquivo inválido.");
  const data = input as Record<string, unknown>;
  if (
    typeof data.name !== "string" ||
    !data.name.trim() ||
    data.name.length > 255
  )
    throw new Error("Nome de arquivo inválido.");
  if (typeof data.mime_type !== "string" || !fileTypes[data.mime_type])
    throw new Error("Formato não permitido.");
  if (
    typeof data.size !== "number" ||
    !Number.isInteger(data.size) ||
    data.size < 1 ||
    data.size > fileTypes[data.mime_type].limit
  )
    throw new Error("Limite: imagens até 5 MB e áudios até 20 MB.");
  return { name: data.name.trim(), mime_type: data.mime_type, size: data.size };
}
