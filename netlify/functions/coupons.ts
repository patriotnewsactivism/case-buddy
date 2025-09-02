import type { Handler } from "@netlify/functions";

const KNOWN = {
  "TRIAL100": { type: "percent", value: 100, description: "Free trial unlock" },
  "MEDIA50": { type: "percent", value: 50, description: "Media partner discount" },
} as const;

export const handler: Handler = async (event) => {
  const path = event.path || "";
  if (!/\/coupons\//.test(path)) {
    return { statusCode: 404, body: JSON.stringify({ error: "Not found" }) };
  }
  const { httpMethod } = event;
  let body: any = {};
  try { body = event.body ? JSON.parse(event.body) : {}; } catch {}

  // POST /api/coupons/validate
  if (httpMethod === "POST" && /\/validate$/.test(path)) {
    const code = (body.code || "").toUpperCase();
    const found = (KNOWN as any)[code];
    if (!found) return { statusCode: 404, body: JSON.stringify({ valid: false }) };
    return { statusCode: 200, body: JSON.stringify({ valid: true, code, ...found }) };
  }

  // POST /api/coupons/apply  (no-op demo apply)
  if (httpMethod === "POST" && /\/apply$/.test(path)) {
    const code = (body.code || "").toUpperCase();
    const found = (KNOWN as any)[code];
    if (!found) return { statusCode: 400, body: JSON.stringify({ error: "Invalid code" }) };
    return { statusCode: 200, body: JSON.stringify({ ok: true, applied: { code, ...found } }) };
  }

  return { statusCode: 404, body: JSON.stringify({ error: "Not found" }) };
};