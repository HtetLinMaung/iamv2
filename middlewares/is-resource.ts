import { getUserPrivileges } from "../services/query-services";

export default async function checkResourceAvailable(
  userid: string,
  type: string,
  ref: string,
  operation: string
) {
  const privileges = await getUserPrivileges(userid, type, ref);
  for (const privilege of privileges) {
    if (!privilege.role) {
      return null;
    }
    for (const roleResource of privilege.role.roleResources) {
      if (
        roleResource.resource.ref === ref &&
        roleResource.resource.type === type
      ) {
        if (roleResource.permission.includes(operation)) {
          return roleResource.accessRights.map((r) => r.userid);
        }
      }
    }
  }
  return null;
}
