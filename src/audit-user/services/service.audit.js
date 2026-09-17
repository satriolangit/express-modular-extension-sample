const { v4: uuidv4 } = require("uuid");
const auditRepo = require("../repositories/repo.audit");
const { logger } = require("../../../libs/deps");

async function byUser(userId) {
  logger.debug("service.audit.byUser", userId);
  return auditRepo.findByUser(userId);
}

async function list() {
  return auditRepo.findAll();
}

async function record(payload) {
  const entry = { id: uuidv4(), ...payload };
  logger.info("service.audit.record", entry.id);
  return auditRepo.insert(entry);
}

module.exports = { byUser, list, record };
