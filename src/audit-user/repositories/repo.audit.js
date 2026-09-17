const { db } = require("../../../libs/deps");

module.exports = {
  async findByUser(userId) {
    return db.query("SELECT * FROM audit_logs WHERE user_id = ?", [userId]);
  },
  async findAll() {
    return db.query("SELECT * FROM audit_logs");
  },
  async insert(row) {
    return db.insert("audit_logs", row);
  },
};
