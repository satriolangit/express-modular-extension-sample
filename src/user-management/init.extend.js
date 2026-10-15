export default async function initUserExt(deps) {
  const { nats, ws, logger } = deps;

  logger.info("[user-management.ext] init");

  // ── Subscribe to client-specific event ────────────
  function setup() {
    if (!nats.isAvailable()) return;

    logger.info("[user-management.ext] setting up NATS");

    const sub = nats.subscribeJson("user.client-event");
    (async () => {
      for await (const { data } of sub) {
        logger.info("[user-management.ext] client event", data);
      }
    })().catch((err) =>
      logger.debug("[user-management.ext] sub ended", {
        error: err.message,
      }),
    );
  }

  nats.onConnected(setup);

  if (nats.isAvailable()) setup();

  // ── Register additional WS path ───────────────────
  ws.register(
    "/ws/users-ext",
    (socket, req) => {
      logger.info("[user-management.ext] ws connected");
      socket.send(
        JSON.stringify({ source: "extension", module: "user-management" }),
      );
    },
    { owner: "user-management.ext" },
  );

  // ── Scheduled task level extension sample ────────

  // scheduler.register({
  //   name: "user-management.ext:audit-sync",
  //   schedule: "*/15 * * * *", // every 15 minutes
  //   owner: "user-management.ext",
  //   handler: async () => {
  //     const { db } = await import("../../libs/deps.js");
  //     const { rows } = await db.query(
  //       "SELECT * FROM audit_logs WHERE synced = false LIMIT 100",
  //     );
  //     for (const row of rows) {
  //       // sync to external system
  //     }
  //     logger.info("[user-management.ext] audit sync", { count: rows.length });
  //   },
  // });
}
