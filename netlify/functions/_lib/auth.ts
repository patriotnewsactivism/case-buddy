import type { HandlerContext } from "@netlify/functions";

export function requireUser(context: HandlerContext) {
  const user = (context.clientContext as any)?.user;
  if (!user) {
    const e: any = new Error("Unauthorized");
    e.statusCode = 401;
    throw e;
  }
  return user;
}
