import Layout from '../../components/Layout'
import Router, { useRouter } from 'next/router'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/client'
import extractApolloCache from '../../apollo/extractApolloCache'

const PostQuery = gql`
  query PostQuery($postId: String!) {
    post(postId: $postId) {
      id
      title
      content
      published
      author {
        id
        name
      }
    }
  }
`

const PublishMutation = gql`
  mutation PublishMutation($postId: String!) {
    publish(postId: $postId) {
      id
      title
      content
      published
      author {
        id
        name
      }
    }
  }
`

const DeleteMutation = gql`
  mutation DeleteMutation($postId: String!) {
    deletePost(postId: $postId) {
      id
      title
      content
      published
      author {
        id
        name
      }
    }
  }
`

export default function Post() {
  const postId = useRouter().query.id
  const { loading, error, data } = useQuery(PostQuery, {
    variables: { postId },
  })

  const [publish] = useMutation(PublishMutation)
  const [deletePost] = useMutation(DeleteMutation)

  if (loading) {
    console.log('loading')
    return <div>Loading ...</div>
  }
  if (error) {
    console.log('error')
    return <div>Error: {error.message}</div>
  }

  console.log(`response`, data)

  let title = data.post.title
  if (!data.post.published) {
    title = `${title} (Draft)`
  }

  const authorName = data.post.author ? data.post.author.name : 'Unknown author'
  return (
    <Layout>
      <div>
        <h2>{title}</h2>
        <p>By {authorName}</p>
        <p>{data.post.content}</p>
        {!data.post.published && (
          <button
            onClick={async (e) => {
              await publish({
                variables: {
                  postId,
                },
              })
              Router.push('/')
            }}
          >
            Publish
          </button>
        )}
        <button
          onClick={async (e) => {
            await deletePost({
              variables: {
                postId,
              },
            })
            Router.push('/')
          }}
        >
          Delete
        </button>
      </div>
      <style jsx>{`
        .page {
          background: white;
          padding: 2rem;
        }

        .actions {
          margin-top: 2rem;
        }

        button {
          background: #ececec;
          border: 0;
          border-radius: 0.125rem;
          padding: 1rem 2rem;
        }

        button + button {
          margin-left: 1rem;
        }
      `}</style>
    </Layout>
  )
}

export const getServerSideProps = extractApolloCache(async (client, params) => {
  const postId = params.id
  await client.query({
    query: PostQuery,
    variables: { postId },
  })
})
