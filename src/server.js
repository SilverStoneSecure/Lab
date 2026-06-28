import path from "node:path";
import Fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyFormbody from "@fastify/formbody";
import fastifyStatic from "@fastify/static";
import fastifyView from "@fastify/view";
import nunjucks from "nunjucks";
import { getEnv } from "./config/env.js";
import { getDb } from "./db/client.js";
import { ensureSiteDefaults } from "./db/siteContent.js";
import { runAuthGateMigration } from "./db/auth-gate-migration.js";
import { registerAuthGateRoutes } from "./routes/auth-gate.js";
import { registerWebRoutes } from "./routes/web.js";
import { registerAdminRoutes } from "./routes/admin.js";

const env = getEnv();
const app = Fastify({ logger: true });
const db = getDb();
ensureSiteDefaults(db);
runAuthGateMigration(db);
app.decorate("db", db);

await app.register(fastifyCookie, { secret: env.sessionSecret });
await app.register(fastifyFormbody);
await app.register(fastifyStatic, {
  root: path.join(process.cwd(), "src/public"),
  prefix: "/public/"
});
await app.register(fastifyView, {
  engine: { nunjucks },
  root: path.join(process.cwd(), "src/views"),
  options: { noCache: true }
});

await registerAuthGateRoutes(app);
await registerWebRoutes(app);
await registerAdminRoutes(app);

app.listen({ host: env.host, port: env.port }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
