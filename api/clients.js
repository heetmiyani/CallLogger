import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

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

    res.status(200).json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
