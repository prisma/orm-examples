const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const context = {
  prisma: prisma,
}

module.exports = {
  context,
}
