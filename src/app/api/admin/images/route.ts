import { createClient } from "@supabase/supabase-js";
import { r2 } from "../../../../lib/r2";

export const runtime = "nodejs";
async function admin(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) throw new Error("Unauthorized");
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    },
  );
  const { data, error } = await client.rpc("is_store_admin");
  if (error || data !== true) throw new Error("Unauthorized");
  return client;
}
function failure(error: unknown) {
  const unauthorized =
    error instanceof Error && error.message === "Unauthorized";
  return Response.json(
    {
      error: unauthorized
        ? "Admin access required."
        : "Image storage request failed. Please retry.",
    },
    { status: unauthorized ? 403 : 500 },
  );
}
export async function POST(request: Request) {
  try {
    await admin(request);
    if (Number(request.headers.get("content-length")) > 6 * 1024 * 1024)
      return Response.json(
        { error: "Maximum image size is 5 MB." },
        { status: 413 },
      );
    const form = await request.formData();
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size === 0 ||
      file.size > 5 * 1024 * 1024 ||
      !["image/png", "image/jpeg", "image/webp"].includes(file.type)
    )
      return Response.json(
        { error: "Choose a PNG, JPG or WebP image under 5 MB." },
        { status: 400 },
      );
    const body = Buffer.from(await file.arrayBuffer());
    const valid =
      file.type === "image/png"
        ? body
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : file.type === "image/jpeg"
          ? body[0] === 255 && body[1] === 216 && body[2] === 255
          : body.toString("ascii", 0, 4) === "RIFF" &&
            body.toString("ascii", 8, 12) === "WEBP";
    if (!valid)
      return Response.json(
        { error: "This file is not a valid supported image." },
        { status: 400 },
      );
    const key = `legacy-sole/uploads/${crypto.randomUUID()}.${file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1]}`;
    const base = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
    if (
      !base ||
      !process.env.R2_ACCESS_KEY_ID ||
      !process.env.R2_SECRET_ACCESS_KEY
    )
      throw new Error("Missing storage configuration");
    const result = await r2("PUT", key, body, {
      "content-type": file.type,
      "if-none-match": "*",
    });
    if (!result.ok) throw new Error("Upload failed");
    return Response.json({ url: `${base}/${key}` });
  } catch (error) {
    return failure(error);
  }
}
export async function DELETE(request: Request) {
  try {
    const client = await admin(request);
    const { urls } = await request.json();
    if (
      !Array.isArray(urls) ||
      urls.length > 100 ||
      urls.some((url) => typeof url !== "string")
    )
      return Response.json({ error: "Invalid image list." }, { status: 400 });
    const { data: products, error: productError } = await client
      .from("products")
      .select("image,gallery");
    const { data: orders, error: orderError } = await client
      .from("orders")
      .select("items");
    if (productError || orderError) throw new Error("Cannot check references");
    const references = JSON.stringify([products, orders]);
    const prefix = `${process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "")}/legacy-sole/uploads/`;
    const deleted: string[] = [];
    for (const url of new Set<string>(urls)) {
      // Original catalogue images are also used by category art and historical orders.
      // External URLs are never deleted from third-party storage.
      if (
        !url.startsWith(prefix) ||
        !/^[a-f0-9-]+\.(png|jpg|webp)$/.test(url.slice(prefix.length)) ||
        references.includes(JSON.stringify(url))
      )
        continue;
      const result = await r2(
        "DELETE",
        `legacy-sole/uploads/${url.slice(prefix.length)}`,
      );
      if (!result.ok) throw new Error("Delete failed");
      deleted.push(url);
    }
    return Response.json({ deleted });
  } catch (error) {
    return failure(error);
  }
}
