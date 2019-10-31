import React from 'react';
import './App.css';
import client from './client'
import { ApolloProvider } from '@apollo/react-hooks'
import Upload from './upload'

function App() {
  return (
		<div>
				<ApolloProvider client={client}>
					<Upload />
				</ApolloProvider>
		</div>
	)
}

export default App;
