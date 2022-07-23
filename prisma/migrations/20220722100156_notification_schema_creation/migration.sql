-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "business_given" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "business_receive" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "needMember" JSONB NOT NULL,
    "leadMember" JSONB NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
