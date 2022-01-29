import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import generator from "generate-password";
import logger from "./utils/log-utils";

const prisma = new PrismaClient();

export default async function init() {
  const where = { appid: "iamv2", username: "admin" };
  let user = await prisma.user.findFirst({
    where,
  });
  const pwd =
    process.env.PASSWORD ||
    generator.generate({
      length: 16,
      numbers: true,
      uppercase: true,
      symbols: true,
    });
  logger.info(`IAM admin password is: ${pwd}`);
  const hashedPwd = await bcrypt.hash(pwd, 12);
  if (!user) {
    user = await prisma.user.create({
      data: {
        createdBy: "iamv2",
        updatedBy: "iamv2",
        appid: "iamv2",
        firstname: "Htet Lin",
        lastname: "Maung",
        fullname: "Htet Lin Maung",
        username: "admin",
        password: hashedPwd,
      },
    });
  } else {
    await prisma.user.updateMany({
      where,
      data: { password: hashedPwd },
    });
  }

  let role = await prisma.role.findFirst({
    where: {
      appid: "iamv2",
      name: "Admin",
    },
  });
  if (!role) {
    role = await prisma.role.create({
      data: {
        createdBy: "iamv2",
        updatedBy: "iamv2",
        appid: "iamv2",
        name: "Admin",
        description: "Admin role",
      },
    });
  }

  const userRole = await prisma.userRole.findFirst({
    where: {
      userid: user.id,
      roleid: role.id,
    },
  });
  if (!userRole) {
    await prisma.userRole.create({
      data: {
        createdBy: "iamv2",
        updatedBy: "iamv2",
        user: {
          connect: {
            id: user.id,
          },
        },
        role: {
          connect: {
            id: role.id,
          },
        },
      },
    });
  }

  let resources = await prisma.resource.findMany({
    where: {
      appid: "iamv2",
      ref: {
        in: [
          "resource",
          "org",
          "user",
          "userrole",
          "roleresource",
          "role",
          "menu",
        ],
      },
    },
  });
  const refs = resources.map((r) => r.ref);

  const data = [
    {
      createdBy: "iamv2",
      updatedBy: "iamv2",
      appid: "iamv2",
      name: "Resource",
      type: "schema",
      ref: "resource",
    },
    {
      createdBy: "iamv2",
      updatedBy: "iamv2",
      appid: "iamv2",
      name: "Organization",
      type: "schema",
      ref: "org",
    },
    {
      createdBy: "iamv2",
      updatedBy: "iamv2",
      appid: "iamv2",
      name: "User",
      type: "schema",
      ref: "user",
    },
    {
      createdBy: "iamv2",
      updatedBy: "iamv2",
      appid: "iamv2",
      name: "UserRole",
      type: "schema",
      ref: "userrole",
    },
    {
      createdBy: "iamv2",
      updatedBy: "iamv2",
      appid: "iamv2",
      name: "RoleResource",
      type: "schema",
      ref: "roleresource",
    },
    {
      createdBy: "iamv2",
      updatedBy: "iamv2",
      appid: "iamv2",
      name: "Role",
      type: "schema",
      ref: "role",
    },
    {
      createdBy: "iamv2",
      updatedBy: "iamv2",
      appid: "iamv2",
      name: "Menu",
      type: "schema",
      ref: "menu",
    },
  ].filter((d) => !refs.includes(d.ref));

  await prisma.resource.createMany({
    data,
  });

  resources = await prisma.resource.findMany({
    where: {
      appid: "iamv2",
      ref: {
        in: [
          "resource",
          "org",
          "user",
          "userrole",
          "roleresource",
          "role",
          "menu",
        ],
      },
    },
  });

  const resourceIds = resources.map((r) => r.id);

  for (const resourceId of resourceIds) {
    const roleresource = await prisma.roleResource.findFirst({
      where: {
        roleid: role.id,
        resourceid: resourceId,
      },
    });
    if (!roleresource) {
      await prisma.roleResource.create({
        data: {
          createdBy: "iamv2",
          updatedBy: "iamv2",
          role: {
            connect: {
              id: role.id,
            },
          },
          resource: {
            connect: {
              id: resourceId,
            },
          },
          permission: "crud",
        },
      });
    }
  }
}
