// Semua require path mengikuti:
//   extensions/audit-user/index.js
//     .. → extensions/
//     ../.. → src/
//     ../../libs/... → src/libs/...
import { logger } from "../../libs/deps.js";

export default {
  prefix: "/audit",

  async init(deps) {
    const { nats, ws, scheduler, logger } = deps;

    logger.info("[audit-user] init");

    // ─── 1. NATS (opsional — cek dulu) ─────────────
    if (nats.isAvailable()) {
      this.initNats(nats, logger);
    } else {
      logger.warn("[audit-user] NATS unavailable — degraded mode");
    }

    // ─── 2. WebSocket (selalu bisa) ────────────────
    this.initWs(ws, logger);

    // ─── 3. Scheduler (selalu bisa) ────────────────
    this.initScheduler(scheduler, logger);
  },

  // ─────────────────────────────────────────────
  initNats(nats, logger) {
    // Sub A: core NATS fire-and-forget
    const createdSub = nats.subscribeJson("user.created");
    (async () => {
      for await (const { data } of createdSub) {
        logger.info("[audit-user] user.created", data);
        // ... record audit trail
      }
    })().catch((err) =>
      logger.error("[audit-user] sub error", { error: err.message }),
    );

    // Sub B: core NATS — capture delete
    const deletedSub = nats.subscribeJson("user.deleted");
    (async () => {
      for await (const { data } of deletedSub) {
        logger.info("[audit-user] user.deleted", data);
      }
    })().catch((err) =>
      logger.error("[audit-user] sub error", { error: err.message }),
    );

    // Durable JetStream consumer untuk processing at-least-once
    (async () => {
      try {
        const consumer = await nats.consume("USERS", "audit-user-worker");
        const messages = await consumer.consume();

        for await (const m of messages) {
          try {
            const data = JSON.parse(nats.get().sc.decode(m.data));
            logger.info("[audit-user] js message", data);
            m.ack();
          } catch (err) {
            logger.error("[audit-user] js handler error", {
              error: err.message,
            });
            m.nak();
          }
        }
      } catch (err) {
        logger.warn("[audit-user] JetStream consumer not available", {
          error: err.message,
        });
      }
    })().catch((err) =>
      logger.error("[audit-user] consumer error", { error: err.message }),
    );
  },

  // ─────────────────────────────────────────────
  initWs(ws, logger) {
    ws.register(
      "/ws/audit",
      (socket, req) => {
        logger.info("[audit-user] ws connected", {
          ip: req.socket.remoteAddress,
        });

        // Kirim sapaan
        socket.send(JSON.stringify({ type: "welcome", module: "audit-user" }));

        // Handle pesan dari client
        socket.on("message", (raw) => {
          try {
            const msg = JSON.parse(raw.toString());
            logger.debug("[audit-user] ws msg", msg);

            if (msg.action === "subscribe") {
              socket.send(
                JSON.stringify({
                  type: "subscribed",
                  channel: msg.channel ?? "default",
                }),
              );
            } else if (msg.action === "ping") {
              socket.send(JSON.stringify({ type: "pong", at: Date.now() }));
            } else {
              socket.send(JSON.stringify({ type: "echo", echo: msg }));
            }
          } catch (err) {
            socket.send(JSON.stringify({ error: "invalid json" }));
          }
        });

        socket.on("close", () => logger.info("[audit-user] ws closed"));
        socket.on("error", (err) =>
          logger.error("[audit-user] ws error", { error: err.message }),
        );
      },
      { owner: "audit-user" },
    );
  },

  // ─────────────────────────────────────────────
  initScheduler(scheduler, logger) {
    // tiap 5 menit
    scheduler.register({
      name: "audit-user:flush-buffer",
      schedule: "*/5 * * * *",
      owner: "audit-user",
      handler: () => {
        logger.info("[audit-user] flushed buffer");
      },
    });
  },
};
