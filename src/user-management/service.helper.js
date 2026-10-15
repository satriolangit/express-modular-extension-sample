import userRepoBase from "../../modules/user-management/repositories/repo.user.js";
import roleRepoBase from "../../modules/user-management/repositories/repo.role.js";
import { logger } from "../../libs/deps.js";

async function enrich(user) {
  logger.debug("service.helper.enrich", user.id);
  const roles = await roleRepoBase.findByUserId(user.id);
  return { ...user, roles: roles.map((r) => r.name), enriched: true };
}

async function summary(user) {
  const roles = await roleRepoBase.findByUserId(user.id);
  return { id: user.id, name: user.name, roleCount: roles.length };
}

export default { enrich, summary };
