import { PrismaClient, PrismaPromise, Role } from "@prisma/client";

const prisma = new PrismaClient();

export const getUserPrivileges = async (
  userId: string,
  type: string = "",
  ref: string = ""
) => {
  const privileges = await prisma.userRole.findMany({
    where: {
      userid: userId,
      status: 1,
    },
    select: {
      role: {
        select: {
          name: true,
          roleResources: {
            select: {
              permission: true,
              resource: {
                select: {
                  name: true,
                  ref: true,
                  type: true,
                },
              },
              accessRights: {
                select: {
                  userid: true,
                },
              },
            },
          },
        },
      },
    },
  });
  return privileges;
};
