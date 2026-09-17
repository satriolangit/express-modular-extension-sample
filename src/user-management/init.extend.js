module.exports = async function initUserExt(deps) {
  const { nats, ws, logger } = deps;

  logger.info("[user-management.ext] init");

  // ── Subscribe to client-specific event ────────────
  const sub = nats.subscribeJson("user.client-event");
  (async () => {
    for await (const { data } of sub) {
      logger.info("[user-management.ext] client event", data);
    }
  })().catch((err) =>
    logger.error("[user-management.ext] sub error", { error: err.message }),
  );

  // ── Register additional WS path ───────────────────
  ws.register(
    "/ws/users-ext",
    (socket, req) => {
      logger.info("[user-management.ext] ws connected");
      socket.send(
        JSON.stringify({ source: "extension", feature: "user-management" }),
      );
    },
    { owner: "user-management.ext" },
  );
};
