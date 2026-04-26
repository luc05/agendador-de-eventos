import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/slots";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date");
  const servicoId = searchParams.get("servicoId");

  if (!dateStr || !servicoId) {
    return NextResponse.json(
      { error: "date e servicoId sao obrigatorios" },
      { status: 400 }
    );
  }

  const date = new Date(dateStr + "T00:00:00.000Z");
  const slots = await getAvailableSlots(date, Number(servicoId));

  return NextResponse.json(slots);
}
