/*
  Warnings:

  - The primary key for the `Agendamentos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `AgendamentoId` column on the `Agendamentos` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `HorarioDeFuncionamento` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `HorarioId` column on the `HorarioDeFuncionamento` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `DiasDisponiveis` on the `Servicos` table. All the data in the column will be lost.
  - The primary key for the `Usuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `UsuarioId` column on the `Usuario` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `UsuarioQueAgendouId` on the `Agendamentos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- Limpar dados para permitir mudança de tipo das colunas
TRUNCATE TABLE "Agendamentos";

-- DropForeignKey
ALTER TABLE "Agendamentos" DROP CONSTRAINT "Agendamentos_UsuarioQueAgendouId_fkey";

-- AlterTable
ALTER TABLE "Agendamentos" DROP CONSTRAINT "Agendamentos_pkey",
DROP COLUMN "AgendamentoId",
ADD COLUMN     "AgendamentoId" SERIAL NOT NULL,
DROP COLUMN "UsuarioQueAgendouId",
ADD COLUMN     "UsuarioQueAgendouId" INTEGER NOT NULL,
ADD CONSTRAINT "Agendamentos_pkey" PRIMARY KEY ("AgendamentoId");

-- AlterTable
ALTER TABLE "HorarioDeFuncionamento" DROP CONSTRAINT "HorarioDeFuncionamento_pkey",
DROP COLUMN "HorarioId",
ADD COLUMN     "HorarioId" SERIAL NOT NULL,
ADD CONSTRAINT "HorarioDeFuncionamento_pkey" PRIMARY KEY ("HorarioId");

-- AlterTable
ALTER TABLE "Servicos" DROP COLUMN "DiasDisponiveis";

-- AlterTable
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_pkey",
DROP COLUMN "UsuarioId",
ADD COLUMN     "UsuarioId" SERIAL NOT NULL,
ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY ("UsuarioId");

-- CreateTable
CREATE TABLE "DiasDisponiveisDosServicos" (
    "ServicoId" INTEGER NOT NULL,
    "HorarioId" INTEGER NOT NULL,

    CONSTRAINT "DiasDisponiveisDosServicos_pkey" PRIMARY KEY ("ServicoId","HorarioId")
);

-- CreateIndex
CREATE INDEX "DiasDisponiveisDosServicos_ServicoId_idx" ON "DiasDisponiveisDosServicos"("ServicoId");

-- CreateIndex
CREATE INDEX "DiasDisponiveisDosServicos_HorarioId_idx" ON "DiasDisponiveisDosServicos"("HorarioId");

-- CreateIndex
CREATE INDEX "Agendamentos_UsuarioQueAgendouId_idx" ON "Agendamentos"("UsuarioQueAgendouId");

-- AddForeignKey
ALTER TABLE "DiasDisponiveisDosServicos" ADD CONSTRAINT "DiasDisponiveisDosServicos_ServicoId_fkey" FOREIGN KEY ("ServicoId") REFERENCES "Servicos"("ServicoId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiasDisponiveisDosServicos" ADD CONSTRAINT "DiasDisponiveisDosServicos_HorarioId_fkey" FOREIGN KEY ("HorarioId") REFERENCES "HorarioDeFuncionamento"("HorarioId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamentos" ADD CONSTRAINT "Agendamentos_UsuarioQueAgendouId_fkey" FOREIGN KEY ("UsuarioQueAgendouId") REFERENCES "Usuario"("UsuarioId") ON DELETE RESTRICT ON UPDATE CASCADE;
