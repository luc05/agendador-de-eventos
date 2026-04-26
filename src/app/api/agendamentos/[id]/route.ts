import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";
import { sendCancellationNotice } from "@/lib/whatsapp";
import { error } from "console";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/agendamentos/[id]">,
) {
  const session = await getSession();
  if (session?.user?.role !== "UsuarioAdministrador") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const body = await request.json();

  const agendamentoExistente = await prisma.agendamentos.findUnique({
    where: { AgendamentoId: id },
    include: {
      Servicos: { select: { Nome: true } },
      Usuario: { select: { Nome: true, Telefone: true } },
    },
  });

  if (!agendamentoExistente) {
    return NextResponse.json(
      { error: "Agendamento não encontrado" },
      { status: 404 },
    );
  }

  if (body.Status !== "Confirmado" && body.Status !== "Cancelado") {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }
  const agendamento = await prisma.agendamentos.update({
    where: { AgendamentoId: id },
    data: { Status: body.status },
  });

  if (body.Status === "Cancelado") {
    sendCancellationNotice({
      clientName: agendamentoExistente.Usuario.Nome,
      clientPhone: agendamentoExistente.Usuario.Telefone,
      serviceName: agendamentoExistente.Servicos.Nome,
      date: agendamentoExistente.DataDoAgendamento.toISOString().split("T")[0],
      time: agendamentoExistente.HorarioDeInicio,
    }).catch(() => {});
  }

  return NextResponse.json(agendamento);
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/agendamentos/[id]">,
) {
  const session = await getSession();
  if (session?.user?.role !== "UsuarioAdministrador") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await ctx.params;
  await prisma.agendamentos.delete({ where: { AgendamentoId: id } });

  return NextResponse.json({ ok: true });
}
