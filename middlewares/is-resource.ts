import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function checkResourceAvailable(
  tokenData: any,
  type: string,
  ref: string,
  operation: string
) {
  const userRoles = await prisma.userRole.findMany({
    select: { roleid: true },
    where: {
      userid: tokenData.userid,
      status: 1,
    },
  });

  const roleIds = userRoles.map((r) => r.roleid);
  const resource = await prisma.resource.findFirst({
    select: {
      roleResources: {
        select: {
          permission: true,
        },
        where: {
          status: 1,
          roleid: { in: roleIds },
        },
      },
    },
    where: {
      appid: tokenData.appid,
      ref,
      status: 1,
      type,
    },
  });

  if (!resource) {
    return false;
  }

  for (const roleResource of resource.roleResources) {
    if (roleResource.permission.includes(operation)) {
      return true;
    }
  }
  return false;
}
