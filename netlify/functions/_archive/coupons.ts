import { requireUser } from "./_lib/auth";
// ...
export const handler: Handler = async (event, context) => {
  try {
    const user = requireUser(context); // throws 401 if not logged in
    // user.sub, user.email available here if you want per-user scoping
    // ...
