-- CreateEnum
CREATE TYPE "AdLayout" AS ENUM ('CARD', 'BANNER');

-- AlterTable
ALTER TABLE "Ad" ADD COLUMN     "layout" "AdLayout" NOT NULL DEFAULT 'CARD';

-- CreateTable
CREATE TABLE "ThemeConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "primary50" TEXT NOT NULL DEFAULT '#eef2ff',
    "primary100" TEXT NOT NULL DEFAULT '#e0e7ff',
    "primary200" TEXT NOT NULL DEFAULT '#c7d2fe',
    "primary300" TEXT NOT NULL DEFAULT '#a5b4fc',
    "primary400" TEXT NOT NULL DEFAULT '#818cf8',
    "primary500" TEXT NOT NULL DEFAULT '#6366f1',
    "primary600" TEXT NOT NULL DEFAULT '#4f46e5',
    "primary700" TEXT NOT NULL DEFAULT '#4338ca',
    "primary800" TEXT NOT NULL DEFAULT '#3730a3',
    "primary900" TEXT NOT NULL DEFAULT '#312e81',
    "secondary50" TEXT NOT NULL DEFAULT '#ecfdf5',
    "secondary100" TEXT NOT NULL DEFAULT '#d1fae5',
    "secondary200" TEXT NOT NULL DEFAULT '#a7f3d0',
    "secondary300" TEXT NOT NULL DEFAULT '#6ee7b7',
    "secondary400" TEXT NOT NULL DEFAULT '#34d399',
    "secondary500" TEXT NOT NULL DEFAULT '#10b981',
    "secondary600" TEXT NOT NULL DEFAULT '#059669',
    "secondary700" TEXT NOT NULL DEFAULT '#047857',
    "secondary800" TEXT NOT NULL DEFAULT '#065f46',
    "secondary900" TEXT NOT NULL DEFAULT '#064e3b',
    "accent50" TEXT NOT NULL DEFAULT '#fffbeb',
    "accent100" TEXT NOT NULL DEFAULT '#fef3c7',
    "accent200" TEXT NOT NULL DEFAULT '#fde68a',
    "accent300" TEXT NOT NULL DEFAULT '#fcd34d',
    "accent400" TEXT NOT NULL DEFAULT '#fbbf24',
    "accent500" TEXT NOT NULL DEFAULT '#f59e0b',
    "accent600" TEXT NOT NULL DEFAULT '#d97706',
    "accent700" TEXT NOT NULL DEFAULT '#b45309',
    "accent800" TEXT NOT NULL DEFAULT '#92400e',
    "accent900" TEXT NOT NULL DEFAULT '#78350f',
    "background" TEXT NOT NULL DEFAULT '#f8fafc',
    "surface" TEXT NOT NULL DEFAULT '#ffffff',
    "textPrimary" TEXT NOT NULL DEFAULT '#0f172a',
    "textSecondary" TEXT NOT NULL DEFAULT '#64748b',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemeConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ThemeConfig_name_key" ON "ThemeConfig"("name");

-- CreateIndex
CREATE INDEX "ThemeConfig_isActive_idx" ON "ThemeConfig"("isActive");

-- CreateIndex
CREATE INDEX "Ad_layout_idx" ON "Ad"("layout");
