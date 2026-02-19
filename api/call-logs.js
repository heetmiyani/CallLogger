import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { staff } = req.query;

      const logs = await prisma.callLog.findMany({
        where: staff ? { staffName: staff } : {},
        include: {
          client: true,
        },
        orderBy: {
          dateTime: 'desc',
        },
      });

      return res.status(200).json(logs);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch logs' });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        clientId,
        staffName,
        callRegarding,
        status,
        interestStatus,
        reminderDays,
        response,
      } = req.body;

      const newLog = await prisma.callLog.create({
        data: {
          clientId,
          staffName,
          callRegarding,
          status,
          interestStatus,
          reminderDays,
          response,
          dateTime: new Date(),
        },
      });

      return res.status(201).json(newLog);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  // 🔥 VERY IMPORTANT
  return res.status(405).json({
    error: 'Method not allowed',
  });
}
