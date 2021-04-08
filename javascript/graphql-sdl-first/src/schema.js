/**
 * @typedef { import("@prisma/client").PrismaClient } Prisma
 * @typedef { import("@prisma/client").UserCreateArgs } UserCreateArgs
 */

const { makeExecutableSchema } = require('apollo-server')
const { GraphQLDateTime } = require('graphql-iso-date')

const typeDefs = `
type Mutation {
  createDraft(authorEmail: String!, data: PostCreateInput!): Post
  deletePost(id: Int!): Post
  incrementPostViewCount(id: Int!): Post
  signupUser(data: UserCreateInput!): User!
  togglePublishPost(id: Int!): Post
}

type Post {
  author: User
  content: String
  createdAt: DateTime!
  id: Int!
  published: Boolean!
  title: String!
  updatedAt: DateTime!
  viewCount: Int!
}

input PostCreateInput {
  content: String
  title: String!
}

input PostOrderByUpdatedAtInput {
  updatedAt: SortOrder!
}

type Query {
  allUsers: [User!]!
  draftsByUser(userUniqueInput: UserUniqueInput!): [Post]
  feed(orderBy: PostOrderByUpdatedAtInput, searchString: String, skip: Int, take: Int): [Post!]!
  postById(id: Int): Post
}

enum SortOrder {
  asc
  desc
}

type User {
  email: String!
  id: Int!
  name: String
  posts: [Post!]!
}

input UserCreateInput {
  email: String!
  name: String
  posts: [PostCreateInput!]
}

input UserUniqueInput {
  email: String
  id: Int
}

scalar DateTime
`

const resolvers = {
  Query: {
    /**
     * @param {any} _parent
     * @param {any} _args
     * @param {{ prisma: Prisma }} context
     */
    allUsers: (_parent, _args, context) => {
      return context.prisma.user.findMany()
    },
    /**
     *
     * @param {any} _parent
     * @param {{id: number}} args
     * @param {{ prisma: Prisma }} context
     * @returns
     */
    postById: (_parent, args, context) => {
      return context.prisma.post.findUnique({
        where: { id: args.id || undefined },
      })
    },
    /**
     *
     * @param {any} _parent
     * @param {{searchString?: string, skip?: number, take?: number, orderBy?:{"asc", "desc"}}} args
     * @param {{ prisma: Prisma }} context
     */
    feed: (_parent, args, context) => {
      const or = args.searchString
        ? {
            OR: [
              { title: { contains: args.searchString } },
              { content: { contains: args.searchString } },
            ],
          }
        : {}

      return context.prisma.post.findMany({
        where: {
          published: true,
          ...or,
        },
        take: args.take || undefined,
        skip: args.skip || undefined,
        orderBy: args.orderBy || undefined,
      })
    },
    /**
     *
     * @param {any} _parent
     * @param {{userUniqueInput: { id: number, email: string}}} args
     * @param {{ prisma: Prisma }} context
     */
    draftsByUser: (_parent, args, context) => {
      return context.prisma.user
        .findUnique({
          where: {
            id: args.userUniqueInput.id || undefined,
            email: args.userUniqueInput.email || undefined,
          },
        })
        .posts({
          where: {
            published: false,
          },
        })
    },
  },
  Mutation: {
    /**
     * @param {any} _parent
     * @param {{data: {email: string, name?: string, post?: {title: string, email: string}[]}}} args
     * @param {{ prisma: Prisma }} context
     */
    signupUser: (_parent, args, context) => {
      const postData = args.data.posts
        ? args.data.posts.map((post) => {
            return { title: post.title, content: post.content || undefined }
          })
        : []

      return context.prisma.user.create({
        data: {
          name: args.data.name,
          email: args.data.email,
          posts: {
            create: postData,
          },
        },
      })
    },
    /**
     * @param {any} _parent
     * @param {{data:{ title: string, content?: string }, authorEmail: string}} args
     * @param {{ prisma: Prisma }} context
     */
    createDraft: (_parent, args, context) => {
      return context.prisma.post.create({
        data: {
          title: args.data.title,
          content: args.data.content,
          author: {
            connect: { email: args.authorEmail },
          },
        },
      })
    },
    /**
     *
     * @param {any} _parent
     * @param {{id: number}} args
     * @param {{ prisma: Prisma }} context
     */
    togglePublishPost: async (_parent, args, context) => {
      try {
        const post = await context.prisma.post.findUnique({
          where: { id: args.id || undefined },
          select: {
            published: true,
          },
        })

        return context.prisma.post.update({
          where: { id: args.id || undefined },
          data: { published: !post.published || undefined },
        })
      } catch (error) {
        throw new Error(
          `Post with ID ${args.id} does not exist in the database.`,
        )
      }
    },
    /**
     * @param {any} _parent
     * @param {*} args
     * @param {{ prisma: Prisma }} context
     */
    incrementPostViewCount: (_parent, args, context) => {
      return context.prisma.post.update({
        where: { id: args.id || undefined },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      })
    },
    /**
     * @param {any} _parent
     * @param {{id: number}} args
     * @param {{ prisma: Prisma }} context
     */
    deletePost: (_parent, args, context) => {
      return context.prisma.post.delete({
        where: { id: args.id },
      })
    },
  },
  User: {
    /**
     * @param {{ id: number }} parent
     * @param {any} args
     * @param {{ prisma: Prisma }} ctx
     */
    posts: (parent, args, ctx) => {
      return ctx.prisma.user
        .findUnique({
          where: { id: parent.id },
        })
        .posts()
    },
  },
  Post: {
    /**
     * @param {{ id: number }} parent
     * @param {any} args
     * @param {{ prisma: Prisma }} ctx
     */
    author: (parent, _args, ctx) => {
      return ctx.prisma.post
        .findUnique({
          where: { id: parent.id },
        })
        .author()
    },
  },
  DateTime: GraphQLDateTime,
}

const schema = makeExecutableSchema({
  resolvers,
  typeDefs,
})

module.exports = {
  schema,
}
