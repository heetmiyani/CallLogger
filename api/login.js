import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    const user = await prisma.staff.findUnique({
      where: { email },
    });

    if (!user || user.password !== password) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Login failed' });
  }
}
