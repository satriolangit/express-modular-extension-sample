const { logger } = require("../../libs/deps");

module.exports = {
  // ── Auth ─────────────────────────────────────
  auth: (req, res, next) => {
    // POC: hardcoded user. Real: verify JWT / session
    req.user = { id: 1, name: "Catherine", role: "admin" };
    logger.debug("[mw.auth] authenticated", req.user.id);
    next();
  },

  // ── Authorization ────────────────────────────
  requireRole: (role) => (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: "forbidden", need: role });
    }
    next();
  },

  // ── Logging ──────────────────────────────────
  requestLogger: (req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      logger.info(
        `[mw.log] ${req.method} ${req.originalUrl} ` +
          `${res.statusCode} ${Date.now() - start}ms`,
      );
    });
    next();
  },

  // ── Rate limit (fake, in-memory) ─────────────
  rateLimit: (() => {
    const hits = new Map();
    return (req, res, next) => {
      const key = req.ip;
      const now = Date.now();
      const windowMs = 60_000;
      const max = 100;

      const entry = hits.get(key) ?? { count: 0, reset: now + windowMs };
      if (now > entry.reset) {
        entry.count = 0;
        entry.reset = now + windowMs;
      }

      entry.count++;
      hits.set(key, entry);

      if (entry.count > max) {
        return res.status(429).json({ error: "too many requests" });
      }
      next();
    };
  })(),

  // ── Validation ───────────────────────────────
  validateBody: (schema) => (req, res, next) => {
    // POC: very simple schema { fieldName: 'string'|'number' }
    for (const [field, type] of Object.entries(schema)) {
      if (typeof req.body?.[field] !== type) {
        return res.status(400).json({
          error: `field "${field}" must be ${type}`,
        });
      }
    }
    next();
  },
};
