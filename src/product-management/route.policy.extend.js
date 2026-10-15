import mw from "../user-management/middleware.extend.js";

export default function extendPolicy(r) {
  // Route baru: POST /products/policies
  r.post("/policies", mw.auth, async (req, res) => {
    res.json({ created: true, body: req.body });
  });
}
