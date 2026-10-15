// extensions/audit-user/routes/route.audit.js
import service from "../services/service.audit.js";
import { logger, nats, ws } from "../../../libs/deps.js";

export default function registerAudit(r) {
  // ─── GET /audit/logs ────────────────────────────────
  r.get("/logs", async (req, res) => {
    try {
      const logs = await service.list(req.query);
      res.json(logs);
    } catch (err) {
      logger.error("list logs failed", { error: err.message });
      res.status(500).json({ error: "internal error" });
    }
  });

  // ─── GET /audit/users/:id ───────────────────────────
  r.get("/users/:id", async (req, res) => {
    try {
      const logs = await service.byUser(Number(req.params.id));
      res.json(logs);
    } catch (err) {
      logger.error("byUser failed", { error: err.message });
      res.status(500).json({ error: "internal error" });
    }
  });

  // ─── POST /audit/log ────────────────────────────────
  // Record + publish NATS + broadcast WS
  r.post("/log", async (req, res) => {
    try {
      const entry = await service.record(req.body);

      // NATS publish (safe — no-op kalau unavailable)
      await nats.jsPublish("audit.logged", entry);

      // WS broadcast ke semua client /ws/audit
      ws.broadcast("/ws/audit", { type: "audit", entry });

      res.status(201).json(entry);
    } catch (err) {
      logger.error("record failed", { error: err.message });
      res.status(400).json({ error: err.message });
    }
  });

  // ─── POST /audit/notify ─────────────────────────────
  // Admin trigger: kirim notifikasi WS ke semua client
  r.post("/notify", async (req, res) => {
    const count = ws.broadcast("/ws/audit", {
      type: "notice",
      text: req.body.text ?? "",
      at: new Date().toISOString(),
    });
    res.json({ ok: true, sent: count });
  });
}
