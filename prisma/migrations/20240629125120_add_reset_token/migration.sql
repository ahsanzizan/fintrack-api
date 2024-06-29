/*
  Warnings:

  - Added the required column `reset_token` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "reset_token" TEXT NOT NULL,
ADD COLUMN     "reset_token_expiry" TIMESTAMP(3);
