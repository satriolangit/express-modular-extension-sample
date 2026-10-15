import { db } from "../../../libs/deps.js";

export default {
  async findByUser(userId) {
    const { rows } = await db.query(
      "SELECT * FROM audit_logs WHERE user_id = $1",
      [userId],
    );
    return rows;
  },
  async findAll() {
    const { rows } = await db.query("SELECT * FROM audit_logs");
    return rows;
  },
  async insert(row) {
    return db.insert("audit_logs", row);
  },
};
