import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col">
      <header className="p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-white text-2xl font-bold">Agendador</h1>
          <Link
            href="/login"
            className="text-white border border-white/30 px-4 py-2 rounded-md hover:bg-white/10 transition-colors text-sm"
          >
            Admin
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Agende seus serviços de forma rápida e fácil
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Escolha o serviço, selecione o horário disponivel e receba a
            confirmação pelo WhatsApp. Simples assim.
          </p>
          <Link
            href="/Agendar"
            className="inline-block bg-white text-blue-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
          >
            Agendar Agora
          </Link>
        </div>
      </main>

      <footer className="p-6 text-center text-blue-200 text-sm">
        Salão Voluntário &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
