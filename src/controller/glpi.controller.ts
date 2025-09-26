import { Request, Response } from "express";
import { loginSchema, sessionLoginShema } from "@/schemas/glpi.schema";
import { GlpiFacade } from "@/services/facade/glpi-facade";
import { GLPIEntityServices } from "@/services/glpi-entity.services";

export class GlpiController {

/**
 * @swagger
 * /:
 *   post:
 *     summary: Login GLPI e processa chamados
 *     tags:
 *       - Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 example: "joao.silva"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               dateInterval:
 *                 type: object
 *                 required:
 *                   - dateStart
 *                   - dateEnd
 *                 properties:
 *                   dateStart:
 *                     type: string
 *                     example: "2025-08-05"
 *                   dateEnd:
 *                     type: string
 *                     example: "2025-08-09"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso e chamados processados.
 *       400:
 *         description: Erro de validação dos dados enviados no corpo da requisição.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["password Required", "user Required"]
 *       401:
 *         description: Nome de usuário ou senha inválidos
 *       500:
 *         description: Erro interno ao processar os chamados ou carregar entidades no GLPI.
 */

  async session (request: Request, response: Response) {
    const user = loginSchema.safeParse(request.body)
    if(!user.success) {
      return response.status(400).json({ 
        message: user.error.issues.map(err => (err.path + " " + err.message)) 
      })
    }

    const glpiFacade = new GlpiFacade({ 
      password: user.data.password, 
      user: user.data.user
    })

    const result = await glpiFacade.processCalleds(user.data.dateInterval)
    response.status(200).json({ message: result })
  }

 /**
 * @swagger
 * /entity:
 *   post:
 *     summary: Login GLPI e listar entidades
 *     tags:
 *       - Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 example: "joao.silva"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso e retorno das entidades.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 302
 *                   name:
 *                     type: string
 *                     example: "UBS Jardim Aeroporto - Dr. Massaki Udihara"
 *                   completename:
 *                     type: string
 *                     example: "REGIAO SACA > UBS Jardim Aeroporto - Dr. Massaki Udihara"
 *       400:
 *         description: Erro de validação dos dados enviados no corpo da requisição.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["password Required", "user Required"]
 */

  async entity (request: Request, response: Response) {
    const user = sessionLoginShema.safeParse(request.body)
    if(!user.success) {
      return response.status(400).json({ 
        message: user.error.issues.map(err => (err.path + " " + err.message)) 
      })
    }

    const entity = new GLPIEntityServices ({
      user: user.data.user,
      password: user.data.password
    })

    const resultEntity = await entity.entityServices()
    response.status(200).json(resultEntity)
  }
}