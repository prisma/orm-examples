import { prisma } from '../lib/prisma'
import { isAuth } from '../middlewares/isAuth'
import { Router } from 'express'

export const account = Router()

account.put('/update', (req, res) => {})

account.delete('/delete', isAuth, async (req, res) => {
  await prisma.user.delete({
    where: {
      id: req.user?.id,
    },
  })

  return res.json({ success: true })
})
