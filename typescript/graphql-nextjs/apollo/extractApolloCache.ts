import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { GetStaticPropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { initializeApollo } from './client'

/**
 * This function extracts the Apollo cache following the performing of any
 * pre-loadable queries so that it can be transmitted down to your client.
 *
 * Use this to perform GraphQL queries in either getStaticProps or getServerSideProps.
 *
 * @param performInitialQueries A block that performs graphql queries to cache.
 * @returns The prepopulated cache for Apollo, formatted as a valid return from either
 *   getStaticProps or getServerSideProps.
 */
export default function extractApolloCache(
  performInitialQueries: (
    client: ApolloClient<NormalizedCacheObject>,
    params: ParsedUrlQuery,
  ) => Promise<void>,
): (ctx: {
  params: ParsedUrlQuery
}) => Promise<{ props: { apolloState: NormalizedCacheObject } }> {
  return async (ctx: {
    params: ParsedUrlQuery
  }): Promise<{
    props: { apolloState: NormalizedCacheObject }
  }> => {
    const apolloClient = initializeApollo()

    await performInitialQueries(apolloClient, ctx.params)

    return {
      props: {
        apolloState: apolloClient.cache.extract(),
      },
    }
  }
}
