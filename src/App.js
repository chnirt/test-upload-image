import React from "react";
import "./App.css";
import client from "./client";
import { ApolloProvider } from "@apollo/react-hooks";
// import TreeB from "./treeB";
import Tree from "./tree";
// import Upload from "./upload";
// import Stripe from "./stripe";
// import Hdnd from "./h-dnd";
// import Vdnd from "./v-dnd";
// import Zdnd from "./z-dnd";

function App() {
  return (
    <div>
      <ApolloProvider client={client}>
        {/* <TreeB /> */}
        <Tree />
        {/* <Upload /> */}
        {/* <Stripe /> */}
        {/* <Hdnd /> */}
        {/* <Vdnd /> */}
        {/* <Zdnd /> */}
      </ApolloProvider>
    </div>
  );
}

export default App;
