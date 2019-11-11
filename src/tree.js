import React, { useState } from "react";
import SortableTree from "react-sortable-tree";
import "react-sortable-tree/style.css";

function Tree() {
  const [treeData, setTreeData] = useState([
    {
      title: "Chicken",
      children: [{ title: "Egg", children: [{ title: "ASD" }] }]
    },
    { title: "Fish", children: [{ title: "fingerline" }] },
    { title: "Pick", children: [{ title: "Pickon" }] }
  ]);
  console.log(treeData);

  return (
    <div style={{ height: "100vh" }}>
      <SortableTree
        treeData={treeData}
        onChange={treeData => setTreeData(treeData)}
      />
    </div>
  );
}

export default Tree;
