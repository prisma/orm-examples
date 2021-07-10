import { prisma } from '../lib/prisma'
import { Router } from 'express'

export const post = Router()

post.get('/get', async (req, res) => {
  const result = await prisma.post.findMany({})

  return res.json(result)
})
