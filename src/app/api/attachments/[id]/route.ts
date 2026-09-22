import { fileTypeFromBuffer } from "file-type";
import { apiUser, apiError } from "@/backend/auth/api";
import { bucket, removeAttachment } from "@/backend/services/attachments";
import { fileTypes } from "@/backend/validation/attachments";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, { params }: Context) {
  try {
    const { client } = await apiUser(request);
    const { id } = await params;
    const { data: attachment, error } = await client
      .from("task_attachments")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !attachment) throw new Error("Anexo não encontrado.");
    const downloaded = await client.storage
      .from(bucket)
      .download(attachment.path);
    if (downloaded.error)
      throw new Error("Upload incompleto. Remova o anexo e envie novamente.");
    const bytes = new Uint8Array(await downloaded.data.arrayBuffer());
    const detected = await fileTypeFromBuffer(bytes);
    const normalized = (mime: string) =>
      mime === "audio/x-wav"
        ? "audio/wav"
        : mime === "audio/x-m4a"
          ? "audio/mp4"
          : mime;
    if (
      !detected ||
      !fileTypes[detected.mime] ||
      normalized(detected.mime) !== normalized(attachment.mime_type) ||
      bytes.length !== attachment.size ||
      bytes.length > fileTypes[detected.mime].limit
    )
      throw new Error("Conteúdo do arquivo inválido. Remova este anexo.");
    const signed = await client.storage
      .from(bucket)
      .createSignedUrl(attachment.path, 300);
    if (signed.error) throw new Error("Não foi possível abrir o anexo.");
    return Response.json(
      { url: signed.data.signedUrl },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
export async function DELETE(request: Request, { params }: Context) {
  try {
    const { client } = await apiUser(request);
    await removeAttachment(client, (await params).id);
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
