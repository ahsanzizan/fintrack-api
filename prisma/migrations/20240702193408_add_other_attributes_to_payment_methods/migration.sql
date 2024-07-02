/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `payment_methods` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `payment_methods` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payment_methods" ADD COLUMN     "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_name_key" ON "payment_methods"("name");

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
