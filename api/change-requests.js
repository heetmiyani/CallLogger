import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // ================= GET ALL =================
  if (req.method === 'GET') {
    try {
      const requests = await prisma.changeRequest.findMany({
        include: {
          client: true,
          staff: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.status(200).json(requests);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Fetch failed' });
    }
  }

  // ================= CREATE =================
  if (req.method === 'POST') {
    try {
      const {
        clientId,
        field,
        oldValue,
        newValue,
        requestedBy,
      } = req.body;

      const request = await prisma.changeRequest.create({
        data: {
          clientId,
          field,
          oldValue,
          newValue,
          requestedBy,
        },
      });

      return res.status(201).json(request);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Create failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
