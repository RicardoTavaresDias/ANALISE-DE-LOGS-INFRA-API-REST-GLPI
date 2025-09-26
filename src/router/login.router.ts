import { Router } from "express"
import { GlpiController } from "@/controller/glpi.controller"

export const glpiRouter = Router()
const glpiController = new GlpiController()

glpiRouter.post("/", glpiController.session)
glpiRouter.post("/entity", glpiController.entity)