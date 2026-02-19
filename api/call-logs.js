import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { search, status, category, staff } = req.query;

    const logs = await prisma.callLog.findMany({
      where: {
        AND: [
          staff ? { staffName: staff } : {},

          search
            ? {
                OR: [
                  {
                    client: {
                      clientName: {
                        contains: search,
                        mode: 'insensitive',
                      },
                    },
                  },
                  {
                    client: {
                      clientCode: {
                        contains: search,
                        mode: 'insensitive',
                      },
                    },
                  },
                  {
                    client: {
                      phoneNumber: {
                        contains: search,
                      },
                    },
                  },
                ],
              }
            : {},

          status && status !== 'all' ? { status } : {},

          category && category !== 'all'
            ? { callRegarding: category }
            : {},
        ],
      },
      include: {
        client: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
