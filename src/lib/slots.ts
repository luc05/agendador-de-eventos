import { prisma } from "./prisma";
import type { DuracaoServicoEnumBase } from "@/generated/prisma/client";

interface TimeSlot {
  HorarioDeInicio: string;
  HorarioDeFinalizacao: string;
}

const DURACAO_EM_MINUTOS: Record<DuracaoServicoEnumBase, number> = {
  MIN_30: 30,
  MIN_60: 60,
  MIN_90: 90,
  MIN_120: 120,
  MIN_150: 150,
  MIN_180: 180,
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function getDuracaoMinutos(duracao: DuracaoServicoEnumBase): number {
  return DURACAO_EM_MINUTOS[duracao];
}

export async function getAvailableSlots(
  date: Date,
  servicoId: number
): Promise<TimeSlot[]> {
  const dayOfWeek = date.getUTCDay();

  const servico = await prisma.servicos.findUnique({
    where: { ServicoId: servicoId },
  });

  if (!servico || !servico.Ativo) return [];

  const durationMin = DURACAO_EM_MINUTOS[servico.Duracao];

  const horarios = await prisma.horarioDeFuncionamento.findMany({
    where: { DiaDaSemana: dayOfWeek },
    orderBy: { HorarioDeInicio: "asc" },
  });

  if (horarios.length === 0) return [];

  const workBlocks = horarios.filter((h) => !h.Intervalo);
  const breakBlocks = horarios.filter((h) => h.Intervalo);

  const existingAppointments = await prisma.agendamentos.findMany({
    where: {
      DataDoAgendamento: date,
      Status: "Confirmado",
    },
  });

  const slots: TimeSlot[] = [];

  for (const block of workBlocks) {
    const blockStart = timeToMinutes(block.HorarioDeInicio);
    const blockEnd = timeToMinutes(block.HorarioDeEncerramento);

    for (let start = blockStart; start + durationMin <= blockEnd; start += 30) {
      const end = start + durationMin;
      const startStr = minutesToTime(start);
      const endStr = minutesToTime(end);

      const inBreak = breakBlocks.some((b) => {
        const bStart = timeToMinutes(b.HorarioDeInicio);
        const bEnd = timeToMinutes(b.HorarioDeEncerramento);
        return start < bEnd && end > bStart;
      });

      if (inBreak) continue;

      const hasConflict = existingAppointments.some((appt) => {
        const apptStart = timeToMinutes(appt.HorarioDeInicio);
        const apptEnd = timeToMinutes(appt.HorarioDeEncerramento);
        return start < apptEnd && end > apptStart;
      });

      if (hasConflict) continue;

      slots.push({ HorarioDeInicio: startStr, HorarioDeFinalizacao: endStr });
    }
  }

  return slots;
}
