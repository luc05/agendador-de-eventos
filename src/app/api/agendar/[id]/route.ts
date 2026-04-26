import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/agendar/[id]">
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await request.json();

  const horario = await prisma.horarioDeFuncionamento.update({
    where: { HorarioId: Number(id) },
    data: body,
  });

  return NextResponse.json(horario);
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/agendar/[id]">
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;

  await prisma.horarioDeFuncionamento.delete({
    where: { HorarioId: Number(id) },
  });

  return NextResponse.json({ ok: true });
}
