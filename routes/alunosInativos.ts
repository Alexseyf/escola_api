import { Turma, PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { verificaToken } from "../middlewares/verificaToken";

const prisma = new PrismaClient();
const router = Router();

const alunoArquivadoSchema = z.object({
  nome: z.string(),
  email: z.string().email(),
  turma: z.nativeEnum(Turma)
});

// ##########################################################################################
//                                         GET
// ##########################################################################################

router.get("/", verificaToken, async (req, res) => {
  try {
    const alunos = await prisma.alunoArquivado.findMany({
      orderBy: { id: "desc" },
      select: {
        id: true,
        nome: true,
        email: true,
        turma: true
      },
    });
    res.status(200).json(alunos);
  } catch (error) {
    res.status(500).json({ erro: error });
  }
});

// ##########################################################################################
//                                     RECUPERA CADASTRO
// ##########################################################################################

router.put("/:id", verificaToken, async (req: any, res) => {
  const { id } = req.params;

  try {
    const aluno = await prisma.alunoArquivado.findUnique({
      where: { id: Number(id) },
    });

    if (aluno) {
      await prisma.aluno.create({
        data:
      {
        nome: aluno.nome,
        email: aluno.email,
        turma: aluno.turma
      }
      });
    }

    const alunoArquivado = await prisma.alunoArquivado.delete({
      where: { id: Number(id) },
    });

    await prisma.log.create({
      data: {
        descricao: `Recuperação de cadastro do aluno: ${aluno?.nome}`,
        complemento: `Funcionário: ${req.userLogadoNome}`,
        adminId: req.userLogadoId,
      },
    });

    res.status(200).json(alunoArquivado);
  } catch (error) {
    res.status(400).json({ erro: error });
  }
});

// ##########################################################################################
//                              PESQUISA POR MÊS DE EXCLUSÃO
// ##########################################################################################

router.get("/pesquisa/:mes", verificaToken, async (req, res) => {
  const { mes } = req.params;
  
  const mesNumber = Number(mes);
  if (mesNumber <= 0 || mesNumber > 12) {
    res.status(400).json({ erro: "Mês inválido" });
    return;
  }

  try {
    const alunos = await prisma.alunoArquivado.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), mesNumber - 1, 1),
          lt: new Date(new Date().getFullYear(), mesNumber, 1)
        }
      },
      orderBy: { id: "desc" },
      select: {
        id: true,
        nome: true,
        email: true,
        turma: true,
        createdAt: true
      },
    });
    res.status(200).json(alunos);
  } catch (error) {
    res.status(500).json({ erro: error });
  }
});

export default router;
