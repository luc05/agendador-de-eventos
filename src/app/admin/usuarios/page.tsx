"use client";

import { useEffect, useState } from "react";

interface Usuario {
  UsuarioId: number;
  Nome: string;
  Telefone: string;
  Email: string | null;
  TipoUsuario: string;
  Membro: boolean;
}

export default function AdminTelaUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtroAdmin, setFiltroAdmin] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [alterarSenha, setAlterarSenha] = useState(false);
  const [form, setForm] = useState({
    Nome: "",
    Telefone: "",
    Email: "",
    Membro: false,
    TipoUsuario: "UsuarioCliente",
    Senha: "",
  });

  function abrirCriacaoUsuario() {
    setEditando(null);
    setMostrarForm(true);
    setAlterarSenha(false);
    setForm({
      Nome: "",
      Telefone: "",
      Email: "",
      Membro: false,
      TipoUsuario: "UsuarioCliente",
      Senha: "",
    });
  }

  async function CriarUsuario(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setMostrarForm(false);
    ObterUsuarios();
  }

  async function ObterUsuarios() {
    const res = await fetch("/api/usuarios");
    setUsuarios(await res.json());
  }

  function abrirEdicaoUsuario(usuario: Usuario) {
    setEditando(usuario);
    setMostrarForm(true);
    setAlterarSenha(false);
    setForm({
      Nome: usuario.Nome,
      Telefone: usuario.Telefone,
      Email: usuario.Email || "",
      Membro: usuario.Membro,
      TipoUsuario: usuario.TipoUsuario,
      Senha: "",
    });
  }

  async function EditarUsuario(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    await fetch(`/api/usuarios/${editando!.UsuarioId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditando(null);
    setMostrarForm(false);
    ObterUsuarios();
  }

  async function ExcluirUsuario(id: number) {
    if (!confirm("Deseja excluir este usuário?")) return;
    await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
    ObterUsuarios();
  }

  useEffect(() => {
    ObterUsuarios();
  }, []);

  const lstUsuario = filtroAdmin
    ? usuarios.filter((u) => u.TipoUsuario === "UsuarioAdministrador")
    : usuarios;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        <button
          onClick={() => abrirCriacaoUsuario()}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Novo Usuário
        </button>
      </div>
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={filtroAdmin}
            onChange={(e) => setFiltroAdmin(e.target.checked)}
          />
          Mostrar somente Administradores
        </label>
      </div>
      {mostrarForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            {editando ? "Editar Usuário" : "Novo Usuário"}
          </h2>
          <form onSubmit={editando ? EditarUsuario : CriarUsuario} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                required
                value={form.Nome}
                onChange={(e) => setForm({ ...form, Nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                required
                value={form.Telefone}
                onChange={(e) => setForm({ ...form, Telefone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required={form.TipoUsuario === "UsuarioAdministrador"}
                value={form.Email}
                onChange={(e) => setForm({ ...form, Email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.Membro}
                  onChange={(e) =>
                    setForm({ ...form, Membro: e.target.checked })
                  }
                />
                Membro da igreja
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.TipoUsuario === "UsuarioAdministrador"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      TipoUsuario: e.target.checked
                        ? "UsuarioAdministrador"
                        : "UsuarioCliente",
                    })
                  }
                />
                Usuário Administrador
              </label>
            </div>
            {form.TipoUsuario === "UsuarioAdministrador" && (
              <>
                {editando?.TipoUsuario === "UsuarioAdministrador" ? (
                  <>
                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={alterarSenha}
                          onChange={(e) => {
                            setAlterarSenha(e.target.checked);
                            if (!e.target.checked)
                              setForm({ ...form, Senha: "" });
                          }}
                        />
                        Alterar Senha
                      </label>
                    </div>
                    {alterarSenha && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nova Senha
                        </label>
                        <input
                          type="password"
                          required
                          value={form.Senha}
                          onChange={(e) =>
                            setForm({ ...form, Senha: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Senha
                    </label>
                    <input
                      type="password"
                      required
                      value={form.Senha}
                      onChange={(e) =>
                        setForm({ ...form, Senha: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    />
                  </div>
                )}
              </>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => { setEditando(null); setMostrarForm(false); }}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Telefone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Membro
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {lstUsuario.map((usuario) => (
              <tr key={usuario.UsuarioId}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {usuario.Nome}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {usuario.Telefone}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {usuario.Email || "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {usuario.TipoUsuario === "UsuarioAdministrador"
                    ? "Admin"
                    : "Cliente"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {usuario.Membro === true ? "Sim" : "Não"}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => abrirEdicaoUsuario(usuario)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => ExcluirUsuario(usuario.UsuarioId)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {lstUsuario.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Nenhum usuário encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
