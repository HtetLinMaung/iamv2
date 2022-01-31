import { PrismaClient } from "@prisma/client";
import { getUserPrivileges } from "../services/query-services";

const prisma = new PrismaClient();

// export default async function checkResourceAvailable(
//   tokenData: any,
//   type: string,
//   ref: string,
//   operation: string
// ) {
//   const userRoles = await prisma.userRole.findMany({
//     select: { roleid: true },
//     where: {
//       userid: tokenData.userid,
//       status: 1,
//     },
//   });

//   const roleIds = userRoles.map((r) => r.roleid);
//   const resource = await prisma.resource.findFirst({
//     select: {
//       roleResources: {
//         select: {
//           permission: true,
//         },
//         where: {
//           status: 1,
//           roleid: { in: roleIds },
//         },
//       },
//     },
//     where: {
//       appid: tokenData.appid,
//       ref,
//       status: 1,
//       type,
//     },
//   });

//   if (!resource) {
//     return false;
//   }

//   for (const roleResource of resource.roleResources) {
//     if (roleResource.permission.includes(operation)) {
//       return true;
//     }
//   }
//   return false;
// }

export default async function checkResourceAvailable(
  userid: string,
  type: string,
  ref: string,
  operation: string
) {
  const privileges = await getUserPrivileges(userid);
  for (const privilege of privileges) {
    if (!privilege.role) {
      return false;
    }
    for (const roleResource of privilege.role.roleResources) {
      if (
        roleResource.resource.ref === ref &&
        roleResource.resource.type === type
      ) {
        if (roleResource.permission.includes(operation)) {
          return true;
        }
      }
    }
  }
  return false;
}
