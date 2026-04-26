"use client";

import { useEffect, useState } from "react";

const DIAS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

interface Horario {
  HorarioId: string;
  DiaDaSemana: number;
  HorarioDeInicio: string;
  HorarioDeEncerramento: string;
  Intervalo: boolean;
}

export default function AdminTelaDeAgenda() {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    DiaDaSemana: 1,
    HorarioDeInicio: "09:00",
    HorarioDeEncerramento: "18:00",
    Intervalo: false,
  });

  async function ObterHorarios() {
    try {
      const res = await fetch("/api/agendar");
      if (!res.ok) {
        console.error("Failed to fetch horarios:", res.status);
        return;
      }
      setHorarios(await res.json());
    } catch (err) {
      console.error("Error fetching horarios:", err);
    }
  }

  useEffect(() => {
    ObterHorarios();
  }, []);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    await fetch("/api/agendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    ObterHorarios();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este horário?")) return;
    await fetch(`/api/agendar/${id}`, { method: "DELETE" });
    ObterHorarios();
  }

  const grouped = DIAS.map((name, i) => ({
    name,
    day: i,
    blocks: horarios.filter((h) => h.DiaDaSemana === i),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Horários de Atendimento
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Novo Horário
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Novo Horário
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dia
                </label>
                <select
                  value={form.DiaDaSemana}
                  onChange={(e) =>
                    setForm({ ...form, DiaDaSemana: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                >
                  {DIAS.map((d, i) => (
                    <option key={i} value={i}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inicio
                </label>
                <input
                  type="time"
                  required
                  value={form.HorarioDeInicio}
                  onChange={(e) =>
                    setForm({ ...form, HorarioDeInicio: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fim
                </label>
                <input
                  type="time"
                  required
                  value={form.HorarioDeEncerramento}
                  onChange={(e) =>
                    setForm({ ...form, HorarioDeEncerramento: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.Intervalo}
                    onChange={(e) =>
                      setForm({ ...form, Intervalo: e.target.checked })
                    }
                    className="rounded"
                  />
                  Intervalo
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {grouped.map(({ name, day, blocks }) => (
          <div key={day} className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{name}</h3>
            {blocks.length === 0 ? (
              <p className="text-sm text-gray-400">Sem horário definido</p>
            ) : (
              <div className="space-y-1">
                {blocks.map((b) => (
                  <div
                    key={b.HorarioId}
                    className="flex items-center justify-between text-sm"
                  >
                    <span
                      className={
                        b.Intervalo ? "text-orange-600" : "text-gray-700"
                      }
                    >
                      {b.HorarioDeInicio} - {b.HorarioDeEncerramento}
                      {b.Intervalo && " (Intervalo)"}
                    </span>
                    <button
                      onClick={() => handleDelete(b.HorarioId)}
                      className="text-red-500 hover:underline text-xs"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
