import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { requestId } = req.body;

    const request = await prisma.changeRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Update client dynamically
    await prisma.client.update({
      where: { id: request.clientId },
      data: {
        [request.field]: request.newValue,
      },
    });

    await prisma.changeRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED' },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Approve failed' });
  }
}
