import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/servicos/[id]">
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const { HorarioIds, ...body } = await request.json();

  const servico = await prisma.servicos.update({
    where: { ServicoId: Number(id) },
    data: {
      ...body,
      DiasDisponiveis: {
        deleteMany: {},
        create: (HorarioIds || []).map((horarioId: number) => ({ HorarioId: horarioId })),
      },
    },
    include: {
      DiasDisponiveis: { include: { Horario: true } },
    },
  });

  return NextResponse.json(servico);
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/servicos/[id]">
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;

  await prisma.servicos.update({
    where: { ServicoId: Number(id) },
    data: { Ativo: false },
  });

  return NextResponse.json({ ok: true });
}
