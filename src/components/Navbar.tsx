"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  function linkClass(href: string) {
    const active = pathname === href;
    return `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      active
        ? "bg-blue-700 text-white"
        : "text-gray-300 hover:bg-blue-600 hover:text-white"
    }`;
  }

  return (
    <nav className="bg-blue-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-white font-bold text-lg">
              Agendador
            </Link>
            <div className="hidden sm:flex gap-1">
              <Link href="/admin" className={linkClass("/admin")}>
                Painel
              </Link>
              <Link href="/admin/servicos" className={linkClass("/admin/servicos")}>
                Serviços
              </Link>
              <Link href="/admin/agenda" className={linkClass("/admin/agenda")}>
                Horários
              </Link>
              <Link href="/admin/agendamentos" className={linkClass("/admin/agendamentos")}>
                Agendamentos
              </Link>
              <Link href="/admin/usuarios" className={linkClass("/admin/usuarios")}>
                Usuários
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-300 text-sm hidden sm:block">
              {session?.user?.name}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-700 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
