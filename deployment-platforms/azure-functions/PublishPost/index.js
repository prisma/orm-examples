const prisma = require('../lib/prisma')

module.exports = async function (context, req) {
  const { postId } = context.bindingData

  const publishedPost = await prisma.post.update({
    where: {
      id: parseInt(postId, 10),
    },
    data: {
      published: true,
    },
  })

  return {
    status: 200,
    body: publishedPost,
  }
}
