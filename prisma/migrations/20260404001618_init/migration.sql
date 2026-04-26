-- CreateEnum
CREATE TYPE "TipoUsuarioEnumBase" AS ENUM ('UsuarioAdministrador', 'UsuarioCliente');

-- CreateEnum
CREATE TYPE "AgendamentoStatusEnumBase" AS ENUM ('Confirmado', 'Cancelado');

-- CreateEnum
CREATE TYPE "DuracaoServicoEnumBase" AS ENUM ('MIN_30', 'MIN_60', 'MIN_90', 'MIN_120', 'MIN_150', 'MIN_180');

-- CreateTable
CREATE TABLE "Usuario" (
    "UsuarioId" TEXT NOT NULL,
    "Nome" TEXT NOT NULL,
    "Telefone" TEXT NOT NULL,
    "Email" TEXT,
    "passwordHash" TEXT,
    "TipoUsuario" "TipoUsuarioEnumBase" NOT NULL DEFAULT 'UsuarioCliente',
    "Membro" BOOLEAN NOT NULL DEFAULT false,
    "DataDeCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DataDeModificacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("UsuarioId")
);

-- CreateTable
CREATE TABLE "Servicos" (
    "ServicoId" SERIAL NOT NULL,
    "Nome" TEXT NOT NULL,
    "Descricao" TEXT,
    "Duracao" "DuracaoServicoEnumBase" NOT NULL DEFAULT 'MIN_30',
    "Custo" DOUBLE PRECISION,
    "Ativo" BOOLEAN NOT NULL DEFAULT true,
    "DataDeCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DataDeModificacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Servicos_pkey" PRIMARY KEY ("ServicoId")
);

-- CreateTable
CREATE TABLE "HorarioDeFuncionamento" (
    "HorarioId" TEXT NOT NULL,
    "DiaDaSemana" INTEGER NOT NULL,
    "HorarioDeInicio" TEXT NOT NULL,
    "HorarioDeEncerramento" TEXT NOT NULL,
    "Intervalo" BOOLEAN NOT NULL DEFAULT false,
    "DataDeCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DataDeModificacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HorarioDeFuncionamento_pkey" PRIMARY KEY ("HorarioId")
);

-- CreateTable
CREATE TABLE "Agendamentos" (
    "AgendamentoId" TEXT NOT NULL,
    "UsuarioQueAgendouId" TEXT NOT NULL,
    "ServicoId" INTEGER NOT NULL,
    "DataDoAgendamento" DATE NOT NULL,
    "HorarioDeInicio" TEXT NOT NULL,
    "HorarioDeEncerramento" TEXT NOT NULL,
    "Status" "AgendamentoStatusEnumBase" NOT NULL DEFAULT 'Confirmado',
    "DataDeCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DataDeModificacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agendamentos_pkey" PRIMARY KEY ("AgendamentoId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_Telefone_key" ON "Usuario"("Telefone");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_Email_key" ON "Usuario"("Email");

-- CreateIndex
CREATE INDEX "HorarioDeFuncionamento_DiaDaSemana_idx" ON "HorarioDeFuncionamento"("DiaDaSemana");

-- CreateIndex
CREATE INDEX "Agendamentos_UsuarioQueAgendouId_idx" ON "Agendamentos"("UsuarioQueAgendouId");

-- CreateIndex
CREATE INDEX "Agendamentos_DataDoAgendamento_idx" ON "Agendamentos"("DataDoAgendamento");

-- CreateIndex
CREATE UNIQUE INDEX "Agendamentos_DataDoAgendamento_HorarioDeInicio_HorarioDeEnc_key" ON "Agendamentos"("DataDoAgendamento", "HorarioDeInicio", "HorarioDeEncerramento");

-- AddForeignKey
ALTER TABLE "Agendamentos" ADD CONSTRAINT "Agendamentos_UsuarioQueAgendouId_fkey" FOREIGN KEY ("UsuarioQueAgendouId") REFERENCES "Usuario"("UsuarioId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamentos" ADD CONSTRAINT "Agendamentos_ServicoId_fkey" FOREIGN KEY ("ServicoId") REFERENCES "Servicos"("ServicoId") ON DELETE RESTRICT ON UPDATE CASCADE;
