import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET() {
  const servicos = await prisma.servicos.findMany({
    where: { Ativo: true },
    orderBy: { Nome: "asc" },
  });
  return NextResponse.json(servicos);
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { Nome, Descricao, Duracao, Custo } = body;

  if (!Nome || !Duracao) {
    return NextResponse.json(
      { error: "Nome e duracao sao obrigatorios" },
      { status: 400 }
    );
  }

  const servico = await prisma.servicos.create({
    data: { Nome, Descricao, Duracao, Custo },
  });

  return NextResponse.json(servico, { status: 201 });
}
