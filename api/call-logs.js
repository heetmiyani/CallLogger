import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { staffId } = req.query;

      const logs = await prisma.callLog.findMany({
        where: staffId
        ? { staffId: Number(staffId) }
        : {},
        include: {
          client: true,
          staff: true,
        },
        orderBy: {
          dateTime: 'desc',
        },
      });

      // 🔥 Transform nested data into flat structure
      const formattedLogs = logs.map(log => ({
        id: log.id,
        clientId: log.clientId,
        staffId: log.staffId,

        clientName: log.client?.clientName || '',
        clientCode: log.client?.clientCode || '',
        phoneNumber: log.client?.phoneNumber || '',

        staffName: log.staff?.name || '',

        callRegarding: log.callRegarding,
        status: log.status,
        interestStatus: log.interestStatus,
        reminderDays: log.reminderDays,
        response: log.response,
        dateTime: log.dateTime,
      }));

      return res.status(200).json(formattedLogs);

    } catch (error) {
      console.error('Fetch call logs error:', error);
      return res.status(500).json({
        error: 'Failed to fetch logs',
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        clientId,
        staffId,
        callRegarding,
        status,
        interestStatus,
        reminderDays,
        response,
      } = req.body;

      const newLog = await prisma.callLog.create({
        data: {
          clientId,
          staffId,
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

  return res.status(405).json({
    error: 'Method not allowed',
  });
}
