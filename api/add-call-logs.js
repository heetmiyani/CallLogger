import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      clientCode,
      staffName,
      callRegarding,
      status,
      interestStatus,
      reminderDays,
      response,
    } = req.body;

    // 🔍 Find client
    const client = await prisma.client.findUnique({
      where: { clientCode },
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // 🔁 Auto-clear previous reminders for same client
    await prisma.callLog.updateMany({
      where: {
        clientId: client.id,
        reminderDays: { not: null },
      },
      data: {
        reminderDays: null,
      },
    });

    // 📝 Insert new call log
    const newLog = await prisma.callLog.create({
      data: {
        clientId: client.id,
        staffName,
        callRegarding,
        status,
        interestStatus,
        reminderDays: reminderDays || null,
        response: response || null,
        dateTime: new Date(),
      },
      include: {
        client: true,
      },
    });

    res.status(200).json(newLog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
