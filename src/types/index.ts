import type { TipoUsuarioEnumBase } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: TipoUsuarioEnumBase;
      phone?: string | null;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: TipoUsuarioEnumBase;
    phone?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: TipoUsuarioEnumBase;
    phone?: string | null;
  }
}
