import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";
import { sendBookingConfirmation } from "@/lib/whatsapp";

// GET: Admin vê todos, cliente vê os seus (por usuarioId query param)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const usuarioId = searchParams.get("usuarioId");

  const session = await getSession();
  const isAdmin = session?.user?.role === "UsuarioAdministrador";

  let where = {};
  if (isAdmin) {
    // Admin vê todos (ou filtra por usuário se passado)
    if (usuarioId) where = { UsuarioQueAgendouId: usuarioId };
  } else if (usuarioId) {
    // Cliente vê só os seus
    where = { UsuarioQueAgendouId: usuarioId };
  } else {
    return NextResponse.json([]);
  }

  const agendamentos = await prisma.agendamentos.findMany({
    where,
    include: {
      Servicos: { select: { Nome: true, Duracao: true, Custo: true } },
      Usuario: { select: { Nome: true, Email: true, Telefone: true } },
    },
    orderBy: [{ DataDoAgendamento: "asc" }, { HorarioDeInicio: "asc" }],
  });

  return NextResponse.json(agendamentos);
}

// POST: Criar agendamento (cliente ou admin)
export async function POST(request: Request) {
  const body = await request.json();
  const {
    usuarioId,
    servicoId,
    date,
    horarioDeInicio: horarioDeInicio,
    horarioDeEncerramento: horarioDeEncerramento,
  } = body;

  if (
    !usuarioId ||
    !servicoId ||
    !date ||
    !horarioDeInicio ||
    !horarioDeEncerramento
  ) {
    return NextResponse.json(
      {
        error:
          "usuarioId, servicoId, date, horarioDeInicio e horarioDeEncerramento são obrigatórios",
      },
      { status: 400 },
    );
  }

  const dataDoAgendamento = new Date(date + "T00:00:00.000Z");

  try {
    const agendamento = await prisma.$transaction(async (tx) => {
      const conflict = await tx.agendamentos.findFirst({
        where: {
          DataDoAgendamento: dataDoAgendamento,
          Status: "Confirmado",
          HorarioDeInicio: { lt: horarioDeEncerramento },
          HorarioDeEncerramento: { gt: horarioDeInicio },
        },
      });

      if (conflict) {
        throw new Error("SLOT_TAKEN");
      }

      return tx.agendamentos.create({
        data: {
          UsuarioQueAgendouId: usuarioId,
          ServicoId: Number(servicoId),
          DataDoAgendamento: dataDoAgendamento,
          HorarioDeInicio: horarioDeInicio,
          HorarioDeEncerramento: horarioDeEncerramento,
          Status: "Confirmado",
        },
        include: {
          Servicos: { select: { Nome: true } },
          Usuario: { select: { Nome: true, Telefone: true } },
        },
      });
    });

    // WhatsApp (best-effort)
    sendBookingConfirmation({
      clientName: agendamento.Usuario.Nome,
      clientPhone: agendamento.Usuario.Telefone,
      serviceName: agendamento.Servicos.Nome,
      date: dataDoAgendamento.toISOString().split("T")[0],
      time: horarioDeInicio,
    }).catch(() => {});

    return NextResponse.json(agendamento, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_TAKEN") {
      return NextResponse.json(
        { error: "Horário já foi reservado por outra pessoa" },
        { status: 409 },
      );
    }
    throw error;
  }
}
