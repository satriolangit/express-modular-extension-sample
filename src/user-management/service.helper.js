const userRepoBase = require("../../features/user-management/repositories/repo.user");
const roleRepoBase = require("../../features/user-management/repositories/repo.role");
const { logger } = require("../../libs/deps");

async function enrich(user) {
  logger.debug("service.helper.enrich", user.id);
  const roles = await roleRepoBase.findByUserId(user.id);
  return { ...user, roles: roles.map((r) => r.name), enriched: true };
}

async function summary(user) {
  const roles = await roleRepoBase.findByUserId(user.id);
  return { id: user.id, name: user.name, roleCount: roles.length };
}

module.exports = { enrich, summary };
