import type { Handler } from "@netlify/functions";
import { requireUser } from "./_lib/auth";
import Busboy from "busboy";
import { getStore } from "@netlify/blobs";

export const handler: Handler = async (event, context) => {
  try {
    const user = requireUser(context);

    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
    }
    const contentType = event.headers["content-type"] || event.headers["Content-Type"];
    if (!contentType || !contentType.startsWith("multipart/form-data")) {
      return { statusCode: 400, body: JSON.stringify({ error: "Expected multipart/form-data" }) };
    }

    const store = getStore({ name: "casebuddy-uploads", consistency: "strong" });
    const bb = Busboy({ headers: { "content-type": contentType } });

    // Accumulate one file (extend to multiple if needed)
    const files: Array<{ filename: string; mime: string; data: Buffer }> = [];
    const fields: Record<string, string> = {};

    const done = new Promise<void>((resolve, reject) => {
      bb.on("file", (_name, file, info) => {
        const { filename, mimeType } = info;
        const chunks: Buffer[] = [];
        file.on("data", (d: Buffer) => chunks.push(d));
        file.on("end", () => {
          files.push({ filename, mime: mimeType, data: Buffer.concat(chunks) });
        });
      });

      bb.on("field", (name, val) => { fields[name] = val; });
      bb.on("error", reject);
      bb.on("finish", () => resolve());
    });

    bb.end(Buffer.from(event.body || "", "base64")); // Netlify gives base64 for binaries
    await done;

    if (!files.length) return { statusCode: 400, body: JSON.stringify({ error: "No file received" }) };

    // Save each file to blobs under a user-scoped prefix
    const saved: Array<{ key: string; filename: string; size: number; url: string }> = [];
    for (const f of files) {
      const key = `u/${user.sub}/${Date.now()}-${encodeURIComponent(f.filename)}`;
      await store.set(key, f.data, { metadata: { filename: f.filename, contentType: f.mime, user: user.email || user.sub } });
      // Signed URL is not needed for same-site fetch; return the blob key
      saved.push({ key, filename: f.filename, size: f.data.length, url: `/api/blob/${encodeURIComponent(key)}` });
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true, saved, fields }) };
  } catch (err: any) {
    const status = err?.statusCode || 500;
    return { statusCode: status, body: JSON.stringify({ error: err?.message || "Upload failed" }) };
  }
};
