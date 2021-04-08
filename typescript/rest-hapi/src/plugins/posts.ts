import Hapi from '@hapi/hapi'
/*
 * TODO: We can't use this type because it is available only in 2.11.0 and previous versions
 * In 2.12.0, this will be namespaced under Prisma and can be used as Prisma.PostGetPayload
 * Once 2.12.0 is release, we can adjust this example.
 */
// import { PostGetPayload } from '@prisma/client'

// plugin to instantiate Prisma Client
const usersPlugin = {
  name: 'app/posts',
  dependencies: ['prisma'],
  register: async function (server: Hapi.Server) {
    server.route([
      {
        method: 'POST',
        path: '/post',
        handler: createPostHandler,
      },
    ])

    server.route([
      {
        method: 'GET',
        path: '/feed',
        handler: feedHandler,
      },
    ])

    server.route([
      {
        method: 'GET',
        path: '/post/{postId}',
        handler: getPostHandler,
      },
    ])

    server.route([
      {
        method: 'PUT',
        path: '/publish/{postId}',
        handler: togglePublishHandler,
      },
    ])

    server.route([
      {
        method: 'DELETE',
        path: '/post/{postId}',
        handler: deletePostHandler,
      },
    ])

    server.route([
      {
        method: 'PUT',
        path: '/post/{postId}/views',
        handler: viewIncrementHandler,
      },
    ])
  },
}

export default usersPlugin

async function feedHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma } = request.server.app

  const { searchString, skip, take, orderBy } = request.query

  const or = searchString
    ? {
        OR: [
          { title: { contains: searchString } },
          { content: { contains: searchString } },
        ],
      }
    : {}

  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        ...or,
      },
      include: { author: true },
      take: Number(take) || undefined,
      skip: Number(skip) || undefined,
      orderBy: {
        updatedAt: orderBy || undefined,
      },
    })

    return h.response(posts).code(200)
  } catch (err) {
    console.log(err)
  }
}

async function getPostHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma } = request.server.app

  const postId = Number(request.params.postId)

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })
    return h.response(post || undefined).code(200)
  } catch (err) {
    console.log(err)
  }
}

async function togglePublishHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) {
  const { prisma } = request.server.app

  const postId = Number(request.params.postId)

  try {
    const postData = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        published: true,
      },
    })

    const updatedPost = await prisma.post.update({
      where: { id: postId || undefined },
      data: { published: !postData?.published },
    })

    return h.response(updatedPost || undefined).code(201)
  } catch (err) {
    console.log(err)
    return h.response({
      error: `Post with ID ${postId}es not exist in the database`,
    })
  }
}

async function deletePostHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) {
  const { prisma } = request.server.app

  const postId = Number(request.params.postId)

  try {
    const post = await prisma.post.delete({
      where: { id: postId },
    })
    return h.response(post || undefined).code(201)
  } catch (err) {
    console.log(err)
    return h.response({
      error: `Post with ID ${postId}es not exist in the database`,
    })
  }
}

async function viewIncrementHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) {
  const { prisma } = request.server.app

  const postId = Number(request.params.postId)
  try {
    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })

    return h.response(post).code(201)
  } catch (err) {
    console.log(err)
    return h.response({
      error: `Post with ID ${postId}es not exist in the database`,
    })
  }
}

async function createPostHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) {
  const { prisma } = request.server.app

  const payload = request.payload as any

  try {
    const createdPost = await prisma.post.create({
      data: {
        title: payload.title,
        content: payload.content,
        author: {
          connect: { email: payload.authorEmail },
        },
      },
    })
    return h.response(createdPost).code(201)
  } catch (err) {
    console.log(err)
  }
}
