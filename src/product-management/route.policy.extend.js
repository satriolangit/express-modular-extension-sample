const mw = require("../user-management/middleware.extend");

module.exports = function extendPolicy(r) {
  // Route baru: POST /products/policies
  r.post("/policies", mw.auth, async (req, res) => {
    res.json({ created: true, body: req.body });
  });
};
