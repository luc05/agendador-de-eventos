const EVOLUTION_URL = process.env.EVOLUTION_API_URL;
const API_KEY = process.env.EVOLUTION_API_KEY;
const INSTANCE = process.env.EVOLUTION_INSTANCE_NAME;

interface SendTextParams {
  number: string;
  text: string;
}

export async function sendWhatsAppMessage({ number, text }: SendTextParams) {
  if (!EVOLUTION_URL || !API_KEY || !INSTANCE) {
    console.warn("WhatsApp nao configurado — mensagem ignorada");
    return false;
  }

  try {
    const response = await fetch(
      `${EVOLUTION_URL}/message/sendText/${INSTANCE}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: API_KEY,
        },
        body: JSON.stringify({ number, text }),
      }
    );

    if (!response.ok) {
      console.error("WhatsApp send failed:", await response.text());
    }
    return response.ok;
  } catch (error) {
    console.error("WhatsApp service unreachable:", error);
    return false;
  }
}

export async function sendBookingConfirmation(params: {
  clientName: string;
  clientPhone: string;
  serviceName: string;
  date: string;
  time: string;
}) {
  const { clientName, clientPhone, serviceName, date, time } = params;

  if (clientPhone) {
    await sendWhatsAppMessage({
      number: clientPhone,
      text: `Ola ${clientName}! Seu agendamento foi confirmado.\n\nServico: ${serviceName}\nData: ${date}\nHorario: ${time}\n\nObrigado pela preferencia!`,
    });
  }

  const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;
  if (adminNumber) {
    await sendWhatsAppMessage({
      number: adminNumber,
      text: `Novo agendamento!\n\nCliente: ${clientName}\nServico: ${serviceName}\nData: ${date}\nHorario: ${time}`,
    });
  }
}

export async function sendCancellationNotice(params: {
  clientName: string;
  clientPhone: string;
  serviceName: string;
  date: string;
  time: string;
}) {
  const { clientName, clientPhone, serviceName, date, time } = params;

  if (clientPhone) {
    await sendWhatsAppMessage({
      number: clientPhone,
      text: `Ola ${clientName}, seu agendamento foi cancelado.\n\nServico: ${serviceName}\nData: ${date}\nHorario: ${time}`,
    });
  }

  const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;
  if (adminNumber) {
    await sendWhatsAppMessage({
      number: adminNumber,
      text: `Agendamento cancelado.\n\nCliente: ${clientName}\nServico: ${serviceName}\nData: ${date}\nHorario: ${time}`,
    });
  }
}
