import { auth as AuthRoutes } from './routes/Auth'
import { account as AccountRoutes } from './routes/Account'
import express from 'express'

declare global {
  namespace Express {
    interface Request {
      user?: import('@prisma/client').User
    }
  }
}

const app = express()

app.use(express.json())

app.use('/auth', AuthRoutes)
app.use('/account', AccountRoutes)

app.listen(3000, () => console.log(`🚀 Server ready at: http://localhost:3000`))
