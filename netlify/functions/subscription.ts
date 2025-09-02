import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  // Route subpaths via redirect: /api/subscription/* -> /.netlify/functions/subscription/:splat
  const path = event.path || "";
  const method = event.httpMethod || "GET";

  // Only endpoint we implement: GET /status
  if (method === "GET" && /\/status$/.test(path)) {
    const now = new Date();
    const trialEnds = new Date(now.getTime() + 14*24*60*60*1000);
    const body = {
      status: "trial",
      isTrialActive: true,
      isSubscriptionActive: true, // allow gated features in demo
      trialEndsAt: trialEnds.toISOString(),
    };
    return { statusCode: 200, body: JSON.stringify(body) };
  }

  return { statusCode: 404, body: JSON.stringify({ error: "Not found" }) };
};