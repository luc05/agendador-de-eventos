"use client";

import { useEffect, useState } from "react";

interface Servico {
  ServicoId: number;
  Nome: string;
  Descricao: string | null;
  Duracao: string;
  Custo: number | null;
  DiasDisponiveis: number[];
}

interface Slot {
  HorarioDeInicio: string;
  HorarioDeFinalizacao: string;
}

interface HorarioFuncionamento {
  DiaDaSemana: number;
}

interface ClienteData {
  ClienteDataId: string;
  Nome: string;
  Telefone: string;
}

const DURACAO_LABELS: Record<string, string> = {
  MIN_30: "30 min",
  MIN_60: "1 hora",
  MIN_90: "1h30",
  MIN_120: "2 horas",
  MIN_150: "2h30",
  MIN_180: "3 horas",
};

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [cliente, setCliente] = useState<ClienteData | null>(null);
  const [telefone, setTelefone] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [membro, setMembro] = useState(false);
  const [needsRegister, setNeedsRegister] = useState(false);
  const [services, setServices] = useState<Servico[]>([]);
  const [selectedService, setSelectedService] = useState<Servico | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [datasDisponiveis, setDatasDisponiveis] = useState<string[]>([]);
  const [loadingDatas, setLoadingDatas] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loadingPhone, setLoadingPhone] = useState(false);
  const [meusAgendamentos, setMeusAgendamentos] = useState<{
    AgendamentoId: string;
    DataDoAgendamento: string;
    HorarioDeInicio: string;
    HorarioDeEncerramento: string;
    Status: string;
    Servicos: { Nome: string };
  }[]>([]);

  async function carregarDatasDisponiveis(servico: Servico) {
    setLoadingDatas(true);
    setDatasDisponiveis([]);
    const res = await fetch("/api/agendar");
    const horarios: HorarioFuncionamento[] = await res.json();
    const diasComFuncionamento = new Set(horarios.map((h) => h.DiaDaSemana));
    const diasDoServico = servico.DiasDisponiveis ?? [];
    const datas: string[] = [];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    for (let i = 0; i < 30; i++) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() + i);
      const diaDaSemana = data.getDay();
      const temFuncionamento = diasComFuncionamento.has(diaDaSemana);
      const disponivelNoServico = diasDoServico.length === 0 || diasDoServico.includes(diaDaSemana);
      if (temFuncionamento && disponivelNoServico) {
        datas.push(data.toISOString().split("T")[0]);
      }
    }
    setDatasDisponiveis(datas);
    setLoadingDatas(false);
  }

  async function ObterAgendamentosPorUsuarioId(usuarioId: string) {
    const res = await fetch(`/api/agendamentos?usuarioId=${usuarioId}`);
    const data = await res.json();
    setMeusAgendamentos(data);
  }

  useEffect(() => {
    fetch("/api/servicos")
      .then((r) => r.json())
      .then(setServices);
  }, []);

  useEffect(() => {
    if (!selectedDate || !selectedService) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    fetch(`/api/slots?date=${selectedDate}&servicoId=${selectedService.ServicoId}`)
      .then((r) => r.json())
      .then((data) => {
        setSlots(data);
        setLoadingSlots(false);
      });
  }, [selectedDate, selectedService]);

  async function handlePhoneSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoadingPhone(true);

    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefone: telefone.replace(/\D/g, ""), nome, email, membro }),
    });

    const data = await res.json();
    setLoadingPhone(false);

    if (res.status === 400 && data.isNew) {
      setNeedsRegister(true);
      return;
    }

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setCliente({ ClienteDataId: data.id, Nome: data.nome, Telefone: data.telefone });
    ObterAgendamentosPorUsuarioId(data.id);
    setStep(2);
  }

  async function handleBook() {
    if (!cliente || !selectedService || !selectedDate || !selectedSlot) return;
    setBooking(true);
    setError("");

    const res = await fetch("/api/agendamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuarioId: cliente.ClienteDataId,
        servicoId: selectedService.ServicoId,
        date: selectedDate,
        horarioDeInicio: selectedSlot.HorarioDeInicio,
        horarioDeEncerramento: selectedSlot.HorarioDeFinalizacao,
      }),
    });

    setBooking(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao agendar");
      return;
    }

    setSuccess(true);
    if (cliente) ObterAgendamentosPorUsuarioId(cliente.ClienteDataId);
  }

  // Alerta ao tentar sair com agendamento não confirmado
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (selectedSlot && !success && !booking) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [selectedSlot, success, booking]);

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <div className="text-green-600 text-5xl mb-4">&#10003;</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Agendamento Confirmado!
          </h2>
          <p className="text-gray-600 mb-2">
            {selectedService?.Nome} — {new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR")}
          </p>
          <p className="text-gray-600 mb-6">
            Horario: {selectedSlot?.HorarioDeInicio} - {selectedSlot?.HorarioDeFinalizacao}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Voce recebera uma confirmacao pelo WhatsApp.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setStep(2);
              setSelectedService(null);
              setSelectedDate("");
              setSelectedSlot(null);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Fazer Novo Agendamento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-800 text-white p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Agendador</h1>
          {cliente && (
            <button
              onClick={() => {
                setStep(1);
                setCliente(null);
                setTelefone("");
                setNome("");
                setEmail("");
                setMembro(false);
                setNeedsRegister(false);
                setSelectedService(null);
                setSelectedDate("");
                setSelectedSlot(null);
                setMeusAgendamentos([]);
              }}
              className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-700 transition-colors"
            >
              Sair
            </button>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Identificação por telefone */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Informe seu telefone
            </h2>
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone (WhatsApp)
                </label>
                <input
                  type="tel"
                  required
                  value={telefone}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "").slice(0, 11);
                    let masked = raw;
                    if (raw.length > 7) {
                      masked = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
                    } else if (raw.length > 2) {
                      masked = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
                    } else if (raw.length > 0) {
                      masked = `(${raw}`;
                    }
                    setTelefone(masked);
                  }}
                  pattern="\(\d{2}\) \d{5}-\d{4}"
                  title="Digite no formato (11) 99988-7766"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  placeholder="(11) 99988-7766"
                />
              </div>

              {needsRegister && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seu nome
                    </label>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value.replace(/^\s+/, ""))}
                      onBlur={(e) => setNome(e.target.value.trim())}
                      minLength={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email (opcional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}
                      pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
                      title="Digite um email valido, ex: nome@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={membro}
                        onChange={(e) => setMembro(e.target.checked)}
                        className="rounded"
                      />
                      Sou membro da igreja
                    </label>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loadingPhone}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loadingPhone ? "Verificando..." : needsRegister ? "Cadastrar e Continuar" : "Continuar"}
              </button>
            </form>
          </div>
        )}

        {/* Step 2+: Logado como cliente */}
        {step >= 2 && cliente && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <span className="text-blue-800 text-sm">
                Ola, <strong>{cliente.Nome}</strong>!
              </span>
            </div>

            {/* Meus agendamentos */}
            {meusAgendamentos.filter(a => a.Status === "Confirmado").length > 0 && (
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  Seus agendamentos
                </h2>
                <div className="space-y-2">
                  {meusAgendamentos
                    .filter(a => a.Status === "Confirmado")
                    .sort((a, b) => {
                      const dateA = a.DataDoAgendamento + a.HorarioDeInicio;
                      const dateB = b.DataDoAgendamento + b.HorarioDeInicio;
                      return dateA.localeCompare(dateB);
                    })
                    .map((a) => (
                    <div key={a.AgendamentoId} className="flex items-center justify-between bg-gray-50 rounded p-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">{a.Servicos.Nome}</span>
                        <span className="text-gray-500 ml-2">
                          {new Date(a.DataDoAgendamento).toLocaleDateString("pt-BR", { timeZone: "UTC" })} — {a.HorarioDeInicio} - {a.HorarioDeEncerramento}
                        </span>
                      </div>
                      <span className="text-green-600 text-xs font-medium">Confirmado</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Escolha do serviço */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                1. Escolha o servico
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((s) => (
                  <button
                    key={s.ServicoId}
                    onClick={() => {
                      setSelectedService(s);
                      setSelectedDate("");
                      setSelectedSlot(null);
                      setStep(3);
                      carregarDatasDisponiveis(s);
                    }}
                    className={`text-left p-4 rounded-lg border-2 transition-colors ${
                      selectedService?.ServicoId === s.ServicoId
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <div className="font-medium text-gray-900">{s.Nome}</div>
                    {s.Descricao && (
                      <div className="text-sm text-gray-500 mt-1">{s.Descricao}</div>
                    )}
                    <div className="text-sm text-gray-600 mt-2">
                      {DURACAO_LABELS[s.Duracao] || s.Duracao}
                      {s.Custo != null && s.Custo > 0 && ` — R$ ${s.Custo.toFixed(2)}`}
                    </div>
                  </button>
                ))}
                {services.length === 0 && (
                  <p className="text-gray-500">Nenhum servico disponivel</p>
                )}
              </div>
            </div>

            {/* Escolha da data */}
            {step >= 3 && selectedService && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  2. Escolha a data
                </h2>
                {loadingDatas ? (
                  <p className="text-gray-500 text-sm">Carregando datas disponíveis...</p>
                ) : datasDisponiveis.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhuma data disponível no momento.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {datasDisponiveis.map((data) => {
                      const dataObj = new Date(data + "T00:00:00");
                      const diaSemana = dataObj.toLocaleDateString("pt-BR", { weekday: "short" });
                      const diaFormatado = dataObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
                      return (
                        <button
                          key={data}
                          onClick={() => {
                            setSelectedDate(data);
                            setSelectedSlot(null);
                            setStep(4);
                          }}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors text-center min-w-[60px] ${
                            selectedDate === data
                              ? "bg-blue-600 text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:border-blue-400"
                          }`}
                        >
                          <div className="font-semibold">{diaFormatado}</div>
                          <div className="text-xs capitalize">{diaSemana}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Escolha do horário */}
            {step >= 4 && selectedDate && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  3. Escolha o horário
                </h2>
                {loadingSlots ? (
                  <p className="text-gray-500">Carregando horários...</p>
                ) : slots.length === 0 ? (
                  <p className="text-gray-500">Nenhum horário disponivel nesta data</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.HorarioDeInicio}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setStep(5);
                        }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          selectedSlot?.HorarioDeInicio === slot.HorarioDeInicio
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:border-blue-400"
                        }`}
                      >
                        {slot.HorarioDeInicio}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Confirmação */}
            {step >= 5 && selectedSlot && (
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg shadow p-6">
                <div className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-2 rounded mb-4">
                  Atenção: Clique em "Confirmar Agendamento" para salvar. Sair da página sem confirmar perdera a seleção.
                </div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  4. Confirmar agendamento
                </h2>
                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <p><span className="font-medium">Servico:</span> {selectedService!.Nome}</p>
                  <p><span className="font-medium">Data:</span> {new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR")}</p>
                  <p><span className="font-medium">Horario:</span> {selectedSlot.HorarioDeInicio} - {selectedSlot.HorarioDeFinalizacao}</p>
                  {selectedService!.Custo != null && selectedService!.Custo > 0 && (
                    <p><span className="font-medium">Valor:</span> R$ {selectedService!.Custo.toFixed(2)}</p>
                  )}
                </div>
                <button
                  onClick={handleBook}
                  disabled={booking}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {booking ? "Agendando..." : "Confirmar Agendamento"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
