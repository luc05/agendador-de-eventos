-- AlterTable
ALTER TABLE "Servicos" ADD COLUMN     "DiasDisponiveis" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
