import { PrismaClient } from '@prisma/client';

/* ==============================
   Prisma Safe Instance
============================== */
let prisma;

if (!global.prisma) {
  global.prisma = new PrismaClient();
}

prisma = global.prisma;

export default async function handler(req, res) {
  // ================= GET ALL / SEARCH =================
  if (req.method === 'GET') {
    try {
      const { search } = req.query;

      const clients = await prisma.client.findMany({
        where: search
          ? {
              OR: [
                {
                  clientName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  clientCode: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  phoneNumber: {
                    contains: search,
                  },
                },
              ],
            }
          : undefined,
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json(clients);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // ================= CREATE CLIENT =================
  if (req.method === 'POST') {
    try {
      const { clientCode, clientName, phoneNumber, role } = req.body;

      if (role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
      }

      if (!clientCode || !clientName || !phoneNumber) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Check for duplicate clientCode
      const existing = await prisma.client.findUnique({
        where: { clientCode }
      });

      if (existing) {
        return res.status(400).json({ message: 'Client code already exists' });
      }

      const client = await prisma.client.create({
        data: {
          clientCode,
          clientName,
          phoneNumber,
        }
      });

      return res.status(201).json(client);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
