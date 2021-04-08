import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

// GET /api/filterPosts?searchString=:searchString
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { searchString } = req.query
  const resultPosts = await prisma.post.findMany({
    where: {
      OR: [
        {
          title: { contains: searchString },
        },
        {
          content: { contains: searchString },
        },
      ],
    },
  })
  res.json(resultPosts)
}
