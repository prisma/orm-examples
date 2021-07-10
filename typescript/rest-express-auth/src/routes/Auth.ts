import { prisma } from '../lib/prisma'
import { isAuth } from '../middlewares/isAuth'
import { generateID } from '../utils/generateID'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import argon2 from 'argon2'

export const auth = Router()

auth.post('/signup', async (req, res) => {
  const { email, password, username } = req.body

  if (!email || !password || !username) {
    return res.json({
      success: false,
      error: 'Missing request body properties',
    })
  }

  const result = await prisma.user.findFirst({
    where: {
      username,
    },
  })

  if (result) return res.json({ success: false, error: 'User already exists' })

  const hashedPassword = await argon2.hash(password)

  const user = await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
      username: username,
    },
  })

  const accessToken = jwt.sign({ userID: user.id }, 'secret')

  return res.json({ success: true, accessToken: accessToken })
})

auth.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.json({
      success: false,
      error: 'Missing request body properties',
    })
  }

  const user = await prisma.user.findFirst({
    where: {
      username,
    },
  })

  if (!user) {
    return res.json({ success: false, error: 'User not found' })
  }

  if (await argon2.verify(user.password, password)) {
    const sessionID = await generateID(30)

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        sessionID: sessionID,
      },
    })

    const accessToken = jwt.sign({ userID: user.id, sessionID }, 'secret')

    return res.json({ success: true, accessToken: accessToken })
  } else {
    return res.json({ success: false, error: 'Invalid password' })
  }
})

auth.post('/logout', isAuth, async (req, res) => {
  await prisma.user.update({
    where: {
      id: req.user?.id,
    },
    data: {
      sessionID: '',
    },
  })

  res.json({ success: true })
})
