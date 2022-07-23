-- DropForeignKey
ALTER TABLE "MemberSubCategory" DROP CONSTRAINT "MemberSubCategory_memberId_fkey";

-- DropForeignKey
ALTER TABLE "MemberSubCategory" DROP CONSTRAINT "MemberSubCategory_subCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "SubCategory" DROP CONSTRAINT "SubCategory_categoryId_fkey";

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "google_my_business_link" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "website_link" TEXT;

-- AddForeignKey
ALTER TABLE "SubCategory" ADD CONSTRAINT "SubCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberSubCategory" ADD CONSTRAINT "MemberSubCategory_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberSubCategory" ADD CONSTRAINT "MemberSubCategory_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
