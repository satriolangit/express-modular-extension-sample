const userServiceBase = require("../../features/user-management/services/service.user");
const helperService = require("./service.helper");
const mw = require("./middleware.extend");

module.exports = function extendUser(r) {
  // Replace GET /users/:id — auth + logger + rateLimit + handler baru
  r.get("/:id", mw.auth, mw.requestLogger, mw.rateLimit, async (req, res) => {
    try {
      const base = await userServiceBase.getUser(req.params.id);
      res.json(await helperService.enrich(base));
    } catch (e) {
      res.status(404).json({ error: e.message });
    }
  });

  // Route baru — hanya auth + requireRole
  r.delete("/:id", mw.auth, mw.requireRole("admin"), async (req, res) => {
    res.json({ deleted: req.params.id, by: req.user.name });
  });
};
