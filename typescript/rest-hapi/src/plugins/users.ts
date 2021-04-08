import Hapi from '@hapi/hapi'
import { Prisma } from '@prisma/client'
/*
 * TODO: We can't use this type because it is available only in 2.11.0 and previous versions
 * In 2.12.0, this will be namespaced under Prisma and can be used as Prisma.UserCreateInput
 * Once 2.12.0 is release, we can adjust this example.
 */
// import { UserCreateInput } from '@prisma/client'

// plugin to instantiate Prisma Client
const usersPlugin = {
  name: 'app/users',
  dependencies: ['prisma'],
  register: async function (server: Hapi.Server) {
    server.route([
      {
        method: 'POST',
        path: '/signup',
        handler: signupHandler,
      },
    ]),
      server.route([
        {
          method: 'GET',
          path: '/users',
          handler: getAllUsersHandler,
        },
      ]),
      server.route([
        {
          method: 'GET',
          path: '/user/{userId}/drafts',
          handler: getDraftsByUserHandler,
        },
      ])
  },
}

export default usersPlugin

async function signupHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma } = request.server.app
  const { name, email, posts } = request.payload as any

  const postData = posts?.map((post: Prisma.PostCreateInput) => {
    return { title: post?.title, content: post?.content }
  })

  try {
    const createdUser = await prisma.user.create({
      data: {
        name,
        email,
        posts: {
          create: postData,
        },
      },
    })
    return h.response(createdUser).code(201)
  } catch (err) {
    console.log(err)
  }
}

async function getAllUsersHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) {
  const { prisma } = request.server.app

  try {
    const users = await prisma.user.findMany()
    return h.response(users).code(200)
  } catch (err) {
    console.log(err)
  }
}

async function getDraftsByUserHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) {
  const { prisma } = request.server.app

  const userId = Number(request.params.userId)
  try {
    const drafts = await prisma.user
      .findUnique({
        where: { id: userId },
      })
      .posts({
        where: { published: false },
      })

    return h.response(drafts).code(200)
  } catch (err) {
    console.log(err)
  }
}
