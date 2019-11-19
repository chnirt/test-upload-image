import { HttpLink } from 'apollo-boost'
import { WebSocketLink } from 'apollo-link-ws'
import { ApolloLink, split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'
import { createUploadLink } from 'apollo-upload-client'
import { onError } from 'apollo-link-error'
import { setContext } from 'apollo-link-context'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'

const urn = 'devcloud4.digihcs.com:14047/graphql'

const token =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJiMDA1M2E1MC0wYTljLTExZWEtODRkOS0yYjE0M2U5M2JiOWUiLCJpYXQiOjE1NzQxNTAzNzYsImV4cCI6MTU3Njc0MjM3NiwiYXVkIjoiaHR0cDovL2NobmlydC5naXRodWIuaW8iLCJpc3MiOiJDaG5pcnQgY29ycCIsInN1YiI6InRyaW5oY2hpbi5pbm5vc0BnbWFpbC5jb20ifQ.YGbiWVGJTfFD-PyKUjjaX_JXcNkiBQ9AzjWBa7hiL5A'

const httpLink = new HttpLink({
	uri: `http://${urn}`
})

const wsLink = new WebSocketLink({
	uri: `ws://${urn}`,
	options: {
		// reconnect: true,
		// lazy: true,
		connectionParams: () => ({
			'access-token': token
		})
	}
})

const link = split(
	// split based on operation type
	({ query }) => {
		const definition = getMainDefinition(query)
		return (
			definition.kind === 'OperationDefinition' &&
			definition.operation === 'subscription'
		)
	},
	wsLink,
	httpLink
)

const isFile = value =>
	(typeof File !== 'undefined' && value instanceof File) ||
	(typeof Blob !== 'undefined' && value instanceof Blob)

const isUpload = ({ variables }) => Object.values(variables).some(isFile)

const uploadLink = createUploadLink({
	uri: `http://${urn}`
})

const terminalLink = split(isUpload, uploadLink, link)

const errorLink = new onError(({ graphQLErrors, networkError, operation }) => {
	if (graphQLErrors) {
		graphQLErrors.forEach(({ message, locations, path, code }) => {
			console.log(
				`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, Code: ${code}`
			)
		})
	}
	if (networkError) {
		console.log(
			`[Network error ${operation.operationName}]: ${networkError.message}`
		)
	}
})

const authLink = setContext((_, { headers }) => {
	// return the headers to the context so httpLink can read them
	return {
		headers: {
			...headers,
			'access-token': token
		}
	}
})

const client = new ApolloClient({
	// uri: 'http://devcloud4.digihcs.com:11047/graphql',
	cache: new InMemoryCache().restore(window.__APOLLO_STATE__),
	link: ApolloLink.from([errorLink, authLink, terminalLink]),
	connectToDevTools: true
})

export default client
