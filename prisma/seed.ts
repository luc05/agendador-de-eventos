import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@agendador.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";
  const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || "0000000000";

  const existing = await prisma.usuario.findFirst({
    where: { Email: adminEmail },
  });

  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.usuario.create({
      data: {
        Nome: "Administrador",
        Email: adminEmail,
        Telefone: adminPhone,
        passwordHash,
        TipoUsuario: "UsuarioAdministrador",
      },
    });
    console.log(`Admin criado: ${adminEmail}`);
  } else {
    console.log("Admin ja existe.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
