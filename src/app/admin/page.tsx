"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  totalDeAgendamentosDoDia: number;
  totalDeAgendamentosConfirmados: number;
  totalDeServicos: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      const [apptRes, svcRes] = await Promise.all([
        fetch("/api/agendamentos"),
        fetch("/api/servicos"),
      ]);
      const agendamentos = await apptRes.json();
      const servicos = await svcRes.json();

      const hoje = new Date().toISOString().split("T")[0];
      const totalDeAgendamentosDoDia = agendamentos.filter(
        (a: { DataDoAgendamento: string; Status: string }) =>
          a.DataDoAgendamento.startsWith(hoje) && a.Status === "Confirmado"
      ).length;
      const totalDeAgendamentosConfirmados = agendamentos.filter(
        (a: { Status: string }) => a.Status === "Confirmado"
      ).length;

      setStats({ totalDeAgendamentosDoDia: totalDeAgendamentosDoDia, totalDeAgendamentosConfirmados: totalDeAgendamentosConfirmados, totalDeServicos: servicos.length });
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Painel do Admin</h1>

      {!stats ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Agendamentos Hoje</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalDeAgendamentosDoDia}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Total Confirmados</p>
            <p className="text-3xl font-bold text-green-600">{stats.totalDeAgendamentosConfirmados}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Serviços Ativos</p>
            <p className="text-3xl font-bold text-purple-600">{stats.totalDeServicos}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/servicos" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-gray-900">Serviços</h2>
          <p className="text-gray-500 text-sm">Gerenciar serviços oferecidos</p>
        </Link>
        <Link href="/admin/Agenda" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-gray-900">Horarios</h2>
          <p className="text-gray-500 text-sm">Definir horários de atendimento</p>
        </Link>
        <Link href="/admin/agendamentos" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-gray-900">Agendamentos</h2>
          <p className="text-gray-500 text-sm">Ver todos os agendamentos</p>
        </Link>
      </div>
    </div>
  );
}
