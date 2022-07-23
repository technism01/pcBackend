/*
  Warnings:

  - You are about to drop the `Business_transaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Business_transaction" DROP CONSTRAINT "Business_transaction_leadId_fkey";

-- AlterTable
ALTER TABLE "Need" ADD COLUMN     "priority" TEXT DEFAULT E'';

-- DropTable
DROP TABLE "Business_transaction";
