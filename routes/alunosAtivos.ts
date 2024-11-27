import { Turma, PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { verificaToken } from "../middlewares/verificaToken";

const prisma = new PrismaClient();
const router = Router();

const alunoSchema = z.object({
  nome: z.string(),
  email: z.string().email(),
  turma: z.nativeEnum(Turma)
});

// ##########################################################################################
//                                         GET
// ##########################################################################################

router.get("/", async (req, res) => {
  try {
    const alunos = await prisma.aluno.findMany({
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
//                                        POST
// ##########################################################################################

router.post("/", verificaToken, async (req, res) => {
  const valida = alunoSchema.safeParse(req.body);
  if (!valida.success) {
    res.status(400).json({ erro: valida.error });
    return;
  }

  try {
    const aluno = await prisma.aluno.create({
      data: valida.data,
    });
    res.status(201).json(aluno);
    
  } catch (error) {
    res.status(400).json({ error });
  }
});

// ##########################################################################################
//                                        DELETE
// ##########################################################################################

router.delete("/:id", verificaToken, async (req: any, res) => {
  const { id } = req.params;

  try {
    const alunoInativo = await prisma.aluno.findUnique({
      where: { id: Number(id) },
    });

    if (alunoInativo) {
      await prisma.alunoArquivado.create({
        data: { ...alunoInativo, adminId: req.userLogadoId },
      });
    }

    const aluno = await prisma.aluno.delete({
      where: { id: Number(id) },
    });

    await prisma.log.create({
      data: {
        descricao: `Exclusão do aluno: ${aluno.nome}`,
        complemento: `Funcionário: ${req.userLogadoNome}`,
        adminId: req.userLogadoId,
      },
    });

    res.status(200).json(aluno);
  } catch (error) {
    res.status(400).json({ erro: error });
  }
});

// ##########################################################################################
//                                        PUT
// ##########################################################################################

router.put("/:id", verificaToken, async (req: any, res) => {
  const { id } = req.params;

  const valida = alunoSchema.safeParse(req.body);
  if (!valida.success) {
    res.status(400).json({ erro: valida.error });
    return;
  }

  try {
    const aluno = await prisma.aluno.update({
      where: { id: Number(id) },
      data: valida.data,
    });

    await prisma.log.create({
      data: {
        descricao: `Cadastro do aluno ${aluno.nome}, alterado com sucesso`,
        complemento: `Funcionário: ${req.userLogadoNome}`,
        adminId: req.userLogadoId,
      },
    });
    
    res.status(201).json(aluno);
  } catch (error) {
    res.status(400).json({ error });
  }
});

// ##########################################################################################
//                                        GET - PESQUISA
// ##########################################################################################

router.get("/pesquisa/:turma", verificaToken, async (req, res) => {
  const { turma } = req.params;
  try {
    const alunos = await prisma.aluno.findMany({
      where: { turma: turma.toUpperCase() as Turma },
    });
    res.status(200).json(alunos);
  } catch (error) {
    res.status(500).json({ erro: error });
  }
});

export default router;
