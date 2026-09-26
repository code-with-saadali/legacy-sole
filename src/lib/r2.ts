import "server-only";
import crypto from "node:crypto";
const account = process.env.R2_ACCOUNT_ID || "54ac79cd0c8596916e1c7cf53b716d58";
const bucket = "n8n-bucket";
const host = `${account}.r2.cloudflarestorage.com`;
const hash = (value: string | Buffer) =>
  crypto.createHash("sha256").update(value).digest("hex");
const hmac = (key: string | Buffer, value: string) =>
  crypto.createHmac("sha256", key).update(value).digest();
const encode = (value: string) =>
  encodeURIComponent(value).replace(
    /[!'()*]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase(),
  );
export async function r2(
  method: string,
  key: string,
  body: Buffer = Buffer.alloc(0),
  extras: Record<string, string> = {},
) {
  const date = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const day = date.slice(0, 8);
  const uri = "/" + [bucket, ...key.split("/")].map(encode).join("/");
  const headers: Record<string, string> = {
    host,
    "x-amz-date": date,
    "x-amz-content-sha256": hash(body),
    ...extras,
  };
  const names = Object.keys(headers).sort();
  const canonical = [
    method,
    uri,
    "",
    names.map((n) => `${n}:${headers[n]}\n`).join(""),
    names.join(";"),
    hash(body),
  ].join("\n");
  const scope = `${day}/auto/s3/aws4_request`;
  const signing = hmac(
    hmac(
      hmac(hmac("AWS4" + process.env.R2_SECRET_ACCESS_KEY, day), "auto"),
      "s3",
    ),
    "aws4_request",
  );
  headers.authorization = `AWS4-HMAC-SHA256 Credential=${process.env.R2_ACCESS_KEY_ID}/${scope}, SignedHeaders=${names.join(";")}, Signature=${hmac(signing, `AWS4-HMAC-SHA256\n${date}\n${scope}\n${hash(canonical)}`).toString("hex")}`;
  return fetch(`https://${host}${uri}`, {
    method,
    headers,
    ...(method === "PUT" ? { body: new Uint8Array(body) } : {}),
    signal: AbortSignal.timeout(60000),
  });
}
