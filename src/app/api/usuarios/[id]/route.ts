import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import bcrypt from "bcryptjs";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/usuarios/[id]">,
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const { Senha, ...body } = await request.json();

  if (Senha) {
    body.passwordHash = await bcrypt.hash(Senha, 10);
  }

  const usuario = await prisma.usuario.update({
    where: { UsuarioId: id },
    data: body,
  });

  return NextResponse.json(usuario);
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/usuarios/[id]">,
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;

  await prisma.usuario.delete({
    where: { UsuarioId: id },
  });

  return NextResponse.json({ ok: true });
}
