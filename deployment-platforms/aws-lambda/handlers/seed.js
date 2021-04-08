const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

exports.handler = async (event, context, callback) => {
  try {
    await Promise.all([prisma.profile.deleteMany(), prisma.post.deleteMany()])
    await prisma.user.deleteMany()

    const createdUser = await prisma.user.create({
      data: seedUser,
    })

    const createdUser2 = await prisma.user.create({
      data: seedUser2,
    })

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([createdUser, createdUser2]),
    }
  } catch (error) {
    console.error(error)
    return { statusCode: 500 }
  }
}

const seedUser = {
  email: 'jane@prisma.io',
  name: 'Jane',
  profile: {
    create: {
      bio: 'Health Enthusiast',
    },
  },
  posts: {
    create: [
      {
        title:
          'Comparing Database Types: How Database Types Evolved to Meet Different Needs',
        content:
          'https://www.prisma.io/blog/comparison-of-database-models-1iz9u29nwn37/',
      },
      {
        title: 'Analysing Sleep Patterns: The Quantified Self',
        content: 'https://quantifiedself.com/get-started/',
      },
      {
        title: 'Prisma 2 Docs',
        content: 'https://www.prisma.io/docs/',
      },
    ],
  },
}

const seedUser2 = {
  email: 'toru@prisma.io',
  name: 'Toru Takemitsu',
  profile: {
    create: {
      bio: 'Musician',
    },
  },
  posts: {
    create: [
      {
        title: 'Requiem for String Orchestra',
        content: '',
      },
      {
        title: 'Music of Tree',
        content: '',
      },
      {
        title: 'Waves for clarinet, horn, two trombones and bass drum ',
        content: '',
      },
    ],
  },
}
