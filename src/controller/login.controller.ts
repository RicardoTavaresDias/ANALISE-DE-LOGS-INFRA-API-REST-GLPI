import { Request, Response, NextFunction } from "express";
import { loginSchema } from "@/schemas/glpi.schema";
import { GlpiFacade } from "@/application/facade/glpi-facade";

/**
 * @swagger
 * /:
 *   post:
 *     summary: Login GLPI
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
 *         description: Login realizado com sucesso.
 *       400:
 *         description: Erro de validação dos dados enviados no corpo da requisição.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password is required"
 *                 issues:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       path:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["password"]
 *                       message:
 *                         type: string
 *                         example: "Password is required"
 *                       code:
 *                         type: string
 *                         example: "invalid_type"
 *       401:
 *         description: Nome de usuário ou senha inválidos
 *       500:
 *         description: Elemento de entidade não carregou após login no Glpi.
 */

export class LoginController {
  async session (request: Request, response: Response, next: NextFunction) {
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

    await glpiFacade.processCalleds(user.data.dateInterval)
  }
}