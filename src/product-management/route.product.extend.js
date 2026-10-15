import productServiceBase from "../../modules/product-management/services/service.product.js";
import mw from "../user-management/middleware.extend.js";

export default function extendProduct(r) {
  // Replace GET /products/:id → dengan auth + tag source
  r.get("/:id", mw.auth, async (req, res) => {
    try {
      const p = await productServiceBase.get(req.params.id);
      res.json({ ...p, source: "extension" });
    } catch (e) {
      res.status(404).json({ error: e.message });
    }
  });
}
