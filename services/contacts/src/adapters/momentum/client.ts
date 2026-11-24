import axios from 'axios'
import { GraphQLClient, type RequestMiddleware } from 'graphql-request'
import { type MomentumApiConfig } from '@src/common/config'

/**
 * Authenticates against the Momentum API using the configured
 * username and password, and returns a bearer token.
 *
 * @param config - Momentum API connection settings.
 *
 * @returns A promise that resolves to a bearer token.
 */
const authenticate = async (config: MomentumApiConfig): Promise<string> => {
  const response = await axios.post(`${config.url}/v2/auth`, {
    method: 'password',
    identifier: config.username,
    key: config.password,
  })

  return response.data.completed.accessToken
}

/**
 * Creates a GraphQL client for the Momentum API.
 *
 * A bearer token is obtained lazily on the first request, using the
 * configured username and password, and is then cached and attached
 * to every subsequent request. No network calls are made at construction.
 *
 * @param config - Momentum API connection settings.
 *
 * @returns A configured GraphQLClient instance.
 */
export const momentumGraphQLClient = (
  config: MomentumApiConfig
): GraphQLClient => {
  /**
   * Cached token promise. Caching the promise (rather than the token)
   * ensures concurrent requests share a single login call.
   *
   * TODO: Handle token expiry / refresh once the login flow is known.
   */
  let token: Promise<string> | undefined

  const getToken = () => {
    if (!token) {
      token = authenticate(config).catch((err) => {
        token = undefined
        throw err
      })
    }
    return token
  }

  const requestMiddleware: RequestMiddleware = async (request) => {
    const headers = new Headers(request.headers)
    headers.set('Authorization', `Bearer ${await getToken()}`)

    return { ...request, headers }
  }

  return new GraphQLClient(config.graphqlUrl, { requestMiddleware })
}
