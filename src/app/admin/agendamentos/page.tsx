"use client";

import { useEffect, useState } from "react";

interface Agendamento {
  AgendamentoId: number;
  DataDoAgendamento: string;
  HorarioDeInicio: string;
  HorarioDeEncerramento: string;
  Status: string;
  Servicos: { Nome: string; Duracao: string; Custo: number | null };
  Usuario: { Nome: string; Email: string | null; Telefone: string };
}

export default function AdminTelaAgendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [filter, setFilter] = useState<"all" | "Confirmado" | "Cancelado">("all");

  async function ObterAgendamentos() {
    const res = await fetch("/api/agendamentos");
    setAgendamentos(await res.json());
  }

  useEffect(() => {
    ObterAgendamentos();
  }, []);

  async function handleCancel(id: number) {
    if (!confirm("Cancelar este agendamento?")) return;
    await fetch(`/api/agendamentos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Status: "Cancelado" }),
    });
    ObterAgendamentos();
  }

  async function handleDelete(id: number) {
    if (!confirm("Excluir permanentemente este agendamento?")) return;
    await fetch(`/api/agendamentos/${id}`, { method: "DELETE" });
    ObterAgendamentos();
  }

  const filtered = filter === "all"
    ? agendamentos
    : agendamentos.filter((a) => a.Status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Todos os Agendamentos</h1>

      <div className="flex gap-2 mb-4">
        {(["all", "Confirmado", "Cancelado"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {f === "all" ? "Todos" : f === "Confirmado" ? "Confirmados" : "Cancelados"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serviço</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((a) => (
              <tr key={a.AgendamentoId}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{a.Usuario.Nome}</div>
                  <div className="text-xs text-gray-500">{a.Usuario.Telefone}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{a.Servicos.Nome}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {new Date(a.DataDoAgendamento).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {a.HorarioDeInicio} - {a.HorarioDeEncerramento}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    a.Status === "Confirmado"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {a.Status === "Confirmado" ? "Confirmado" : "Cancelado"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {a.Status === "Confirmado" && (
                    <button onClick={() => handleCancel(a.AgendamentoId)} className="text-orange-600 hover:underline text-sm">Cancelar</button>
                  )}
                  <button onClick={() => handleDelete(a.AgendamentoId)} className="text-red-600 hover:underline text-sm">Excluir</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Nenhum agendamento encontrado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
