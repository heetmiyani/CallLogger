/*
  Warnings:

  - You are about to drop the column `staffName` on the `CallLog` table. All the data in the column will be lost.
  - Added the required column `staffId` to the `CallLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CallLog_clientId_idx";

-- DropIndex
DROP INDEX "CallLog_status_idx";

-- AlterTable
ALTER TABLE "CallLog" DROP COLUMN "staffName",
ADD COLUMN     "staffId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Staff" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- AddForeignKey
ALTER TABLE "CallLog" ADD CONSTRAINT "CallLog_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
