-- CreateTable
CREATE TABLE "AccessRight" (
    "id" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdBy" TEXT NOT NULL DEFAULT E'',
    "creater" TEXT NOT NULL DEFAULT E'',
    "updatedBy" TEXT NOT NULL DEFAULT E'',
    "updater" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roleresourceid" TEXT NOT NULL,
    "userid" TEXT NOT NULL,

    CONSTRAINT "AccessRight_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AccessRight" ADD CONSTRAINT "AccessRight_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRight" ADD CONSTRAINT "AccessRight_roleresourceid_fkey" FOREIGN KEY ("roleresourceid") REFERENCES "RoleResource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
