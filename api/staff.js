import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

/* ==============================
   Prisma Safe Instance
============================== */
let prisma

if (!global.prisma) {
  global.prisma = new PrismaClient()
}

prisma = global.prisma

export default async function handler(req, res) {
  try {

    /* =========================
       CREATE USER
    ========================= */
    if (req.method === 'POST') {
      const { name, email, password, role } = req.body

      if (!name || !email || !password || !role) {
        return res.status(400).json({
          error: 'Missing required fields'
        })
      }

      if (!['admin', 'staff'].includes(role)) {
        return res.status(400).json({
          error: 'Invalid role'
        })
      }

      // Check duplicate email
      const existing = await prisma.staff.findUnique({
        where: { email }
      })

      if (existing) {
        return res.status(400).json({
          error: 'Email already exists'
        })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      const user = await prisma.staff.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      })

      return res.status(201).json(user)
    }

    /* =========================
       GET ALL USERS
    ========================= */
    if (req.method === 'GET') {
      const users = await prisma.staff.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      })

      return res.status(200).json(users)
    }

    /* =========================
       UPDATE PASSWORD
    ========================= */
    if (req.method === 'PUT') {
      const { id, password } = req.body

      const parsedId = parseInt(id)

      if (!parsedId || !password) {
        return res.status(400).json({
          error: 'Invalid id or password'
        })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      await prisma.staff.update({
        where: { id: parsedId },
        data: { password: hashedPassword }
      })

      return res.status(200).json({
        success: true
      })
    }

    /* =========================
       DELETE USER
    ========================= */
    if (req.method === 'DELETE') {
      const { id } = req.body

      const parsedId = parseInt(id)

      if (!parsedId) {
        return res.status(400).json({
          error: 'Invalid id'
        })
      }

      await prisma.staff.delete({
        where: { id: parsedId }
      })

      return res.status(200).json({
        success: true
      })
    }

    return res.status(405).json({
      error: 'Method not allowed'
    })

  } catch (error) {
    console.error('Staff API Error:', error)

    return res.status(500).json({
      error: 'Internal server error'
    })
  }
}