import { v4 as uuidv4 } from "uuid";
import auditRepo from "../repositories/repo.audit.js";
import { logger } from "../../../libs/deps.js";

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

export default { byUser, list, record };
