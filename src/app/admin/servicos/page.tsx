"use client";

import { useEffect, useState } from "react";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const DURACAO_OPTIONS = [
  { value: "MIN_30", label: "30 minutos" },
  { value: "MIN_60", label: "1 hora" },
  { value: "MIN_90", label: "1 hora e meia" },
  { value: "MIN_120", label: "2 horas" },
  { value: "MIN_150", label: "2 horas e meia" },
  { value: "MIN_180", label: "3 horas" },
];

const DURACAO_LABELS: Record<string, string> = Object.fromEntries(
  DURACAO_OPTIONS.map((d) => [d.value, d.label])
);

interface HorarioDisponivel {
  HorarioId: number;
  DiaDaSemana: number;
  HorarioDeInicio: string;
  HorarioDeEncerramento: string;
  Intervalo: boolean;
}

interface Servico {
  ServicoId: number;
  Nome: string;
  Descricao: string | null;
  Duracao: string;
  Custo: number | null;
  Ativo: boolean;
  DiasDisponiveis: { HorarioId: number; Horario: HorarioDisponivel }[];
}

export default function AdminServicesPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Servico | null>(null);
  const [form, setForm] = useState({
    Nome: "",
    Descricao: "",
    Duracao: "MIN_30",
    Custo: 0,
    HorarioIds: [] as number[],
  });

  async function ObterServicos() {
    const res = await fetch("/api/servicos");
    setServicos(await res.json());
  }

  useEffect(() => {
    ObterServicos();
    fetch("/api/agendar")
      .then((r) => r.json())
      .then(setHorarios);
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ Nome: "", Descricao: "", Duracao: "MIN_30", Custo: 0, HorarioIds: [] });
    setShowForm(true);
  }

  function openEdit(s: Servico) {
    setEditing(s);
    setForm({
      Nome: s.Nome,
      Descricao: s.Descricao || "",
      Duracao: s.Duracao,
      Custo: s.Custo || 0,
      HorarioIds: s.DiasDisponiveis.map((d) => d.HorarioId),
    });
    setShowForm(true);
  }

  function toggleHorario(horarioId: number) {
    const atual = form.HorarioIds;
    const novo = atual.includes(horarioId)
      ? atual.filter((id) => id !== horarioId)
      : [...atual, horarioId];
    setForm({ ...form, HorarioIds: novo });
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (editing) {
      await fetch(`/api/servicos/${editing.ServicoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/servicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setShowForm(false);
    ObterServicos();
  }

  async function handleDelete(id: number) {
    if (!confirm("Deseja desativar este servico?")) return;
    await fetch(`/api/servicos/${id}`, { method: "DELETE" });
    ObterServicos();
  }

  const horariosDeTrabalho = horarios.filter((h) => !h.Intervalo);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Novo Servico
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            {editing ? "Editar Servico" : "Novo Servico"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                required
                value={form.Nome}
                onChange={(e) => setForm({ ...form, Nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                value={form.Descricao}
                onChange={(e) => setForm({ ...form, Descricao: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duracao</label>
                <select
                  value={form.Duracao}
                  onChange={(e) => setForm({ ...form, Duracao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                >
                  {DURACAO_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custo (R$)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.Custo}
                  onChange={(e) => setForm({ ...form, Custo: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horários disponíveis
              </label>
              {horariosDeTrabalho.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nenhum horário de funcionamento cadastrado. Cadastre em Agenda primeiro.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {horariosDeTrabalho.map((h) => (
                    <label
                      key={h.HorarioId}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.HorarioIds.includes(h.HorarioId)}
                        onChange={() => toggleHorario(h.HorarioId)}
                        className="rounded"
                      />
                      {DIAS[h.DiaDaSemana]} — {h.HorarioDeInicio} às {h.HorarioDeEncerramento}
                    </label>
                  ))}
                </div>
              )}
              {form.HorarioIds.length === 0 && horariosDeTrabalho.length > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Nenhum horário selecionado — serviço não aparecerá para agendamento.
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duração</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Custo</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {servicos.map((s) => (
              <tr key={s.ServicoId}>
                <td className="px-6 py-4 text-gray-900">
                  <div className="font-medium">{s.Nome}</div>
                  {s.Descricao && <div className="text-sm text-gray-500">{s.Descricao}</div>}
                </td>
                <td className="px-6 py-4 text-gray-600">{DURACAO_LABELS[s.Duracao] || s.Duracao}</td>
                <td className="px-6 py-4 text-gray-600">
                  {s.Custo != null && s.Custo > 0 ? `R$ ${s.Custo.toFixed(2)}` : "Gratuito"}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openEdit(s)} className="text-blue-600 hover:underline text-sm">Editar</button>
                  <button onClick={() => handleDelete(s.ServicoId)} className="text-red-600 hover:underline text-sm">Remover</button>
                </td>
              </tr>
            ))}
            {servicos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nenhum serviço cadastrado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
