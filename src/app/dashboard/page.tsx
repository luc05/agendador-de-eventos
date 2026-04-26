"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Agendamento {
  AgendamentoId: number;
  DataDoAgendamento: string;
  HorarioDeInicio: string;
  HorarioDeEncerramento: string;
  Status: string;
  Servicos: { Nome: string; Duracao: string; Custo: number | null };
}

export default function DashboardPage() {
  const [telefone, setTelefone] = useState("");
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [clienteNome, setClienteNome] = useState("");
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefone }),
    });

    const data = await res.json();

    if (!res.ok || data.isNew) {
      setError("Telefone não encontrado. Faça um agendamento primeiro.");
      setLoading(false);
      return;
    }

    setClienteId(data.id);
    setClienteNome(data.nome);

    const apptRes = await fetch(`/api/agendamentos?usuarioId=${data.id}`);
    setAgendamentos(await apptRes.json());
    setLoading(false);
  }

  async function handleCancel(id: string) {
    if (!confirm("Deseja cancelar este agendamento?")) return;
    await fetch(`/api/agendamentos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Status: "Cancelado" }),
    });
    // Recarrega
    const apptRes = await fetch(`/api/agendamentos?usuarioId=${clienteId}`);
    setAgendamentos(await apptRes.json());
  }

  const upcoming = agendamentos.filter((a) => {
    const d = new Date(a.DataDoAgendamento);
    return a.Status === "Confirmado" && d >= new Date(new Date().toISOString().split("T")[0]);
  });

  const past = agendamentos.filter((a) => {
    const d = new Date(a.DataDoAgendamento);
    return a.Status !== "Confirmado" || d < new Date(new Date().toISOString().split("T")[0]);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-800 text-white p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Meus Agendamentos</h1>
          <Link href="/agendar" className="text-sm text-blue-200 hover:text-white">
            Novo Agendamento
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {!clienteId ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Digite seu telefone para ver seus agendamentos
            </h2>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>
            )}
            <form onSubmit={handleSearch} className="flex gap-3">
              <input
                type="tel"
                required
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                placeholder="11999887766"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <span className="text-blue-800 text-sm">
                Ola, <strong>{clienteNome}</strong>!
              </span>
            </div>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Próximos</h2>
              {upcoming.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                  Nenhum agendamento futuro.{" "}
                  <Link href="/agendar" className="text-blue-600 hover:underline">
                    Agendar agora
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((a) => (
                    <div key={a.AgendamentoId} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{a.Servicos.Nome}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(a.DataDoAgendamento).toLocaleDateString("pt-BR", { timeZone: "UTC" })} — {a.HorarioDeInicio} - {a.HorarioDeEncerramento}
                        </div>
                      </div>
                      <button
                        onClick={() => handleCancel(a.AgendamentoId)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {past.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Histórico</h2>
                <div className="space-y-3">
                  {past.map((a) => (
                    <div key={a.AgendamentoId} className="bg-white rounded-lg shadow p-4 opacity-60">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{a.Servicos.Nome}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(a.DataDoAgendamento).toLocaleDateString("pt-BR", { timeZone: "UTC" })} — {a.HorarioDeInicio} - {a.HorarioDeEncerramento}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          a.Status === "Cancelado" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
                        }`}>
                          {a.Status === "Cancelado" ? "Cancelado" : "Concluido"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
