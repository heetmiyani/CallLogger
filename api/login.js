import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

/* ==============================
   Safe Prisma Instance
============================== */
let prisma

if (!global.prisma) {
  global.prisma = new PrismaClient()
}

prisma = global.prisma

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    })
  }

  try {
    const { email, password } = req.body

    /* =========================
       VALIDATION
    ========================= */
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password required'
      })
    }

    /* =========================
       FIND USER
    ========================= */
    const user = await prisma.staff.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      })
    }

    /* =========================
       PASSWORD CHECK
    ========================= */
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    )

    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Invalid credentials'
      })
    }

    /* =========================
       SUCCESS RESPONSE
       (Never return password)
    ========================= */
    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    })

  } catch (error) {
    console.error('Login Error:', error)

    return res.status(500).json({
      error: 'Internal server error'
    })
  }
}