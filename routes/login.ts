import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const router = Router()

router.post("/", async (req, res) => {
  const { email, senha } = req.body

  const msg = "Login ou senha incorretos"

  if (!email || !senha) {
    res.status(400).json({ erro: msg })
    return
  }

  try {
    const admin = await prisma.admin.findFirst({
      where: { email }
    })

    if (admin == null) {
      res.status(400).json({ erro: msg })
      return
    }

    if (bcrypt.compareSync(senha, admin.senha)) {
      const token = jwt.sign({
        userLogadoId: admin.id,
        userLogadoNome: admin.nome
      },
        process.env.JWT_KEY as string,
        { expiresIn: "1h" }
      )

      res.status(200).json({
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
        token
      })
    } else {
      await prisma.log.create({
        data: { 
          descricao: "Tentativa de Acesso Inválida", 
          complemento: `Funcionário: ${admin.email}`,
          adminId: admin.id
        }
      })

      res.status(400).json({ erro: msg })
    }
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router