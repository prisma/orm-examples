const createServer = require('../src/app')

describe('api endpoints', () => {
  let server
  let uniqueIdentifier = Date.now()
  let createdUserId
  let createdPostId
  let userEmail = `nelly-${uniqueIdentifier}@prisma.io`

  beforeAll(async () => {
    // Create the server without logging
    server = createServer({ logger: false })
  })
  afterAll(async () => {
    await server.close()
  })

  test('status endpoint returns 200', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/',
    })
    expect(response.statusCode).toBe(200)
    expect(response.body).toBeTruthy()
  })

  test('/user endpoint creates user', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/user',
      payload: {
        name: 'Nelly',
        email: userEmail,
      },
    })
    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body.id).toBeTruthy()
    createdUserId = body.id
  })

  test('/post endpoint creates post', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/post',
      payload: {
        title: 'New post',
        content: 'Is Prisma an ORM?',
        authorEmail: userEmail,
      },
    })
    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body.id).toBeTruthy()
    createdPostId = body.id
  })

  test('/post/comment endpoint creates comment', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/post/comment',
      payload: {
        comment: 'Interesting read!',
        authorEmail: userEmail,
        postId: createdPostId,
      },
    })
    expect(response.statusCode).toBe(200)
    expect(response.body).toBeTruthy()
  })

  test('/post/like endpoint creates like', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/post/like',
      payload: {
        userEmail: userEmail,
        postId: createdPostId,
      },
    })
    expect(response.statusCode).toBe(200)
    expect(response.body).toBeTruthy()
  })
})
