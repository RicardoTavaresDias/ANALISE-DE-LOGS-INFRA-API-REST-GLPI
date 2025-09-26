import { Router } from "express";
import { logAnalysisRouter } from "./log-analysis.router"
import { glpiRouter } from "./login.router"

export const router = Router()

router.use("/", glpiRouter)
router.use("/logs", logAnalysisRouter)