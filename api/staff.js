import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    // CREATE USER
    if (req.method === 'POST') {
      const { name, email, password, role } = req.body;

      const user = await prisma.staff.create({
        data: { name, email, password, role },
      });

      return res.status(201).json(user);
    }

    // GET ALL USERS
    if (req.method === 'GET') {
      const users = await prisma.staff.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          password: true,
        },
      });

      return res.status(200).json(users);
    }

    // UPDATE PASSWORD
    if (req.method === 'PUT') {
      const { id, password } = req.body;

      const updated = await prisma.staff.update({
        where: { id },
        data: { password },
      });

      return res.status(200).json(updated);
    }

    // DELETE USER
    if (req.method === 'DELETE') {
      const { id } = req.body;

      await prisma.staff.delete({
        where: { id },
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
