-- DropIndex
DROP INDEX "Client_phoneNumber_idx";

-- CreateTable
CREATE TABLE "CallLog" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "staffName" TEXT NOT NULL,
    "callRegarding" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "interestStatus" TEXT NOT NULL,
    "reminderDays" INTEGER,
    "response" TEXT,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CallLog_clientId_idx" ON "CallLog"("clientId");

-- CreateIndex
CREATE INDEX "CallLog_status_idx" ON "CallLog"("status");

-- AddForeignKey
ALTER TABLE "CallLog" ADD CONSTRAINT "CallLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
