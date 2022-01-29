-- DropIndex
DROP INDEX "Organization_createdBy_key";

-- AlterTable
ALTER TABLE "Menu" ADD COLUMN     "creater" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "updater" TEXT NOT NULL DEFAULT E'',
ALTER COLUMN "createdBy" SET DEFAULT E'',
ALTER COLUMN "updatedBy" SET DEFAULT E'';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "creater" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "updater" TEXT NOT NULL DEFAULT E'',
ALTER COLUMN "createdBy" SET DEFAULT E'',
ALTER COLUMN "updatedBy" SET DEFAULT E'';

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "creater" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "updater" TEXT NOT NULL DEFAULT E'',
ALTER COLUMN "createdBy" SET DEFAULT E'',
ALTER COLUMN "updatedBy" SET DEFAULT E'';

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "creater" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "updater" TEXT NOT NULL DEFAULT E'',
ALTER COLUMN "createdBy" SET DEFAULT E'',
ALTER COLUMN "updatedBy" SET DEFAULT E'';

-- AlterTable
ALTER TABLE "RoleResource" ADD COLUMN     "creater" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "updater" TEXT NOT NULL DEFAULT E'',
ALTER COLUMN "createdBy" SET DEFAULT E'',
ALTER COLUMN "updatedBy" SET DEFAULT E'',
ALTER COLUMN "permission" SET DEFAULT E'crud';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "creater" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "updater" TEXT NOT NULL DEFAULT E'',
ALTER COLUMN "createdBy" SET DEFAULT E'',
ALTER COLUMN "updatedBy" SET DEFAULT E'';

-- AlterTable
ALTER TABLE "UserRole" ADD COLUMN     "creater" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "updater" TEXT NOT NULL DEFAULT E'',
ALTER COLUMN "createdBy" SET DEFAULT E'',
ALTER COLUMN "updatedBy" SET DEFAULT E'';
