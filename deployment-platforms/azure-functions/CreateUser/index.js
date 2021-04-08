const prisma = require('../lib/prisma')

module.exports = async function (context, req) {
  const { email, name } = req.body
  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
      },
    })

    return {
      status: 200,
      body: user,
    }
  } catch (e) {
    context.log(e)
    return {
      status: 500,
      body: e.message,
    }
  }
}
