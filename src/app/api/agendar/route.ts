import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET() {
  const horarios = await prisma.horarioDeFuncionamento.findMany({
    orderBy: [{ DiaDaSemana: "asc" }, { HorarioDeInicio: "asc" }],
  });
  return NextResponse.json(horarios);
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { DiaDaSemana, HorarioDeInicio, HorarioDeEncerramento, Intervalo } = body;

  if (DiaDaSemana == null || !HorarioDeInicio || !HorarioDeEncerramento) {
    return NextResponse.json(
      { error: "Dia da semana, horário inicio e fim são obrigatórios" },
      { status: 400 }
    );
  }

  const horario = await prisma.horarioDeFuncionamento.create({
    data: {
      DiaDaSemana,
      HorarioDeInicio,
      HorarioDeEncerramento,
      Intervalo: Intervalo || false,
    },
  });

  return NextResponse.json(horario, { status: 201 });
}
