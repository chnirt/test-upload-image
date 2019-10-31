import { HttpLink } from 'apollo-boost'
import { WebSocketLink } from 'apollo-link-ws'
import { ApolloLink, split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'
import { createUploadLink } from 'apollo-upload-client'
import { onError } from 'apollo-link-error'
import { setContext } from 'apollo-link-context'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'

const urn = 'devcloud4.digihcs.com:11046/graphqlcme'

const httpLink = new HttpLink({
	uri: `http://${urn}`
})

const wsLink = new WebSocketLink({
	uri: `ws://${urn}`,
	options: {
		// reconnect: true,
		// lazy: true,
		connectionParams: () => ({
			'access-token':
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3N1ZXIiOiJodHRwOi8vY2huaXJ0LmRldi5pbyIsInN1YmplY3QiOiJmZmJkZDg5MC1mOGJkLTExZTktOTgwNi04YjkxNGQ2MjNhZTkiLCJpYXQiOjE1NzI0MjY5MjIsImV4cCI6MTU3NTAxODkyMn0.I5fHO73Uy1k8aBVwOYjgUrhjbfb-F5J2HamaCswkvHE'
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
			'access-token':
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3N1ZXIiOiJodHRwOi8vY2huaXJ0LmRldi5pbyIsInN1YmplY3QiOiJmZmJkZDg5MC1mOGJkLTExZTktOTgwNi04YjkxNGQ2MjNhZTkiLCJpYXQiOjE1NzI0MjY5MjIsImV4cCI6MTU3NTAxODkyMn0.I5fHO73Uy1k8aBVwOYjgUrhjbfb-F5J2HamaCswkvHE'
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