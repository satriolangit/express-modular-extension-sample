const productServiceBase = require("../../features/product-management/services/service.product");
const mw = require("../user-management/middleware.extend");

module.exports = function extendProduct(r) {
  // Replace GET /products/:id → dengan auth + tag source
  r.get("/:id", mw.auth, async (req, res) => {
    try {
      const p = await productServiceBase.get(req.params.id);
      res.json({ ...p, source: "extension" });
    } catch (e) {
      res.status(404).json({ error: e.message });
    }
  });
};
