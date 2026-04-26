import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const body = await request.json();

  // Se veio TipoUsuario → criação pelo admin
  if (body.TipoUsuario) {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { Nome, Telefone, Email, TipoUsuario, Membro, Senha } = body;

    if (!Nome || !Telefone) {
      return NextResponse.json(
        { error: "Nome e telefone são obrigatórios" },
        { status: 400 },
      );
    }

    if (TipoUsuario === "UsuarioAdministrador" && (!Email || !Senha)) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios para administradores" },
        { status: 400 },
      );
    }

    const usuario = await prisma.usuario.create({
      data: {
        Nome,
        Telefone,
        Email: Email || null,
        Membro: Membro || false,
        TipoUsuario,
        ...(Senha ? { passwordHash: await bcrypt.hash(Senha, 10) } : {}),
      },
    });

    return NextResponse.json(usuario, { status: 201 });
  }

  // Sem TipoUsuario → registro de cliente por telefone
  const { nome, telefone, email, membro } = body;

  if (!telefone) {
    return NextResponse.json(
      { error: "Telefone e obrigatório" },
      { status: 400 },
    );
  }

  let usuario = await prisma.usuario.findUnique({
    where: { Telefone: telefone },
  });

  if (usuario) {
    return NextResponse.json({
      id: usuario.UsuarioId,
      nome: usuario.Nome,
      telefone: usuario.Telefone,
      email: usuario.Email,
      isNew: false,
    });
  }

  if (!nome) {
    return NextResponse.json(
      { error: "Cliente novo — nome e obrigatório", isNew: true },
      { status: 400 },
    );
  }

  usuario = await prisma.usuario.create({
    data: {
      Nome: nome,
      Telefone: telefone,
      Email: email || null,
      Membro: membro || false,
      TipoUsuario: "UsuarioCliente",
    },
  });

  return NextResponse.json(
    {
      id: usuario.UsuarioId,
      nome: usuario.Nome,
      telefone: usuario.Telefone,
      email: usuario.Email,
      isNew: true,
    },
    { status: 201 },
  );
}

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const lstUsuarios = await prisma.usuario.findMany({
    orderBy: { DataDeCriacao: "asc" },
  });
  return NextResponse.json(lstUsuarios);
}
