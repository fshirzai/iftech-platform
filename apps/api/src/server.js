import { app } from "./app.js";
import { env } from "./config/env.js";

// Vercel imports the Express app; a long-running listener is only for local hosting.
if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`IFTECH API listening on ${env.PORT}`);
  });
}

export default app;
