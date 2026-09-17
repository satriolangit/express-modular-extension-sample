const auditService = require("../services/service.audit");
const mw = require("../../user-management/middleware.extend");

module.exports = function registerAudit(r) {
  r.get("/users/:id", mw.auth, async (req, res) => {
    res.json(await auditService.byUser(Number(req.params.id)));
  });

  r.get("/logs", mw.auth, async (req, res) => {
    res.json(await auditService.list());
  });

  r.post("/log", async (req, res) => {
    res.json(await auditService.record(req.body));
  });
};
