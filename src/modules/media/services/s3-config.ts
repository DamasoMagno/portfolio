import "server-only";
export function s3Config() {
  const endpoint = process.env.S3_ENDPOINT?.trim();
  const region = process.env.S3_REGION?.trim();
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.S3_BUCKET?.trim();
  const publicUrl = process.env.S3_PUBLIC_BASE_URL?.trim();
  if (!endpoint || !region || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) throw new Error("Configure o armazenamento S3 de imagens no servidor.");
  try {
    for (const value of [endpoint, publicUrl]) {
      const url = new URL(value);
      if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) throw new Error();
    }
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,62}$/.test(bucket)) throw new Error();
  } catch { throw new Error("Configuração S3 inválida."); }
  return { endpoint: endpoint.replace(/\/$/, ""), region, accessKeyId, secretAccessKey, bucket, publicUrl: publicUrl.replace(/\/$/, "") };
}
