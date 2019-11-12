import React, { useState, useRef } from "react";
import SortableTree, {
  addNodeUnderParent,
  removeNodeAtPath,
  changeNodeAtPath,
  getNodeAtPath,
  toggleExpandedForAll,
  defaultSearchMethod,
  map as mapTree
} from "react-sortable-tree";
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
  const inputEl = useRef(null);

  function addNode(rowInfo) {
    inputEl.current.focus();
    console.log(inputEl.current.value());
    let NEW_NODE = { title: "" };
    let { node, treeIndex, path } = rowInfo;
    path.pop();
    let parentNode = getNodeAtPath({
      treeData: treeData,
      path: path,
      getNodeKey: ({ treeIndex }) => treeIndex,
      ignoreCollapsed: true
    });
    let getNodeKey = ({ node: object, treeIndex: number }) => {
      return number;
    };
    let parentKey = getNodeKey(parentNode);
    if (parentKey == -1) {
      parentKey = null;
    }
    let newTree = addNodeUnderParent({
      treeData: treeData,
      newNode: NEW_NODE,
      expandParent: true,
      parentKey: parentKey,
      getNodeKey: ({ treeIndex }) => treeIndex
    });
    setTreeData(newTree.treeData);
  }

  function removeNode(rowInfo) {
    let { node, treeIndex, path } = rowInfo;
    setTreeData(
      removeNodeAtPath({
        treeData: treeData,
        path: path, // You can use path from here
        getNodeKey: ({ node: TreeNode, treeIndex: number }) => {
          console.log(number);
          return number;
        },
        ignoreCollapsed: false
      })
    );
  }

  function updateTreeData(treeData) {
    setTreeData(treeData);
  }

  return (
    <div style={{ height: "100vh" }}>
      <SortableTree
        treeData={treeData}
        onChange={treeData => updateTreeData(treeData)}
        generateNodeProps={rowInfo => ({
          buttons: [
            <div>
              <input ref={inputEl} type="text" />
              <br />
              <button label="Delete" onClick={event => removeNode(rowInfo)}>
                Remove
              </button>
              <button label="Add" onClick={event => addNode(rowInfo)}>
                Add
              </button>
            </div>
          ],
          style: {
            height: "50px"
          }
        })}
      />
    </div>
  );
}

export default Tree;
