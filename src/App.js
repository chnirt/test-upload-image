import React from "react";
import "./App.css";
import client from "./client";
import { ApolloProvider } from "@apollo/react-hooks";
// import Tree from "./tree";
// import Upload from "./upload";
// import Stripe from "./stripe";
import Dnd from "./dnd";

function App() {
  return (
    <div>
      <ApolloProvider client={client}>
        {/* <Tree /> */}
        {/* <Upload /> */}
        {/* <Stripe /> */}
        <Dnd />
      </ApolloProvider>
    </div>
  );
}

export default App;
