import React from "react";
import "./App.css";
import client from "./client";
import { ApolloProvider } from "@apollo/react-hooks";
import Upload from "./upload";
// import Stripe from "./stripe";
import Tree from "./tree";

function App() {
  return (
    <div>
      <ApolloProvider client={client}>
        {/* <Tree /> */}
        <Upload />
        {/* <Stripe /> */}
      </ApolloProvider>
    </div>
  );
}

export default App;
