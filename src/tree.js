/* eslint-disable */
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
  const inputEl = useRef(treeData.map(() => React.createRef()));

  const firstNames = ["Chnirt", "Hung", "Hieu"];

  function addNodeChild(rowInfo) {
    let { node, treeIndex, path } = rowInfo;

    let newTree = addNodeUnderParent({
      treeData: treeData,
      parentKey: path[path.length - 1],
      expandParent: true,
      getNodeKey,
      newNode: {
        title: `${getRandomName()} ${node.title.split(" ")[0]}sson`
      }
    });
    setTreeData(newTree.treeData);
  }

  function addNodeSibling(rowInfo) {
    console.log(inputEl.current[rowInfo.treeIndex].current.value)
    let { node, treeIndex, path } = rowInfo;

    let newTree = addNodeUnderParent({
      treeData: treeData,
      parentKey: path[path.length - 2],
      expandParent: true,
      getNodeKey,
      newNode: {
        title: `${getRandomName()} ${node.title.split(" ")[0]}sson`
      }
    });
    setTreeData(newTree.treeData);
  }

  function removeNode(rowInfo) {
    let { node, treeIndex, path } = rowInfo;
    setTreeData(
      removeNodeAtPath({
        treeData: treeData,
        path,
        getNodeKey
      })
    );
  }

  function updateTreeData(treeData) {
    setTreeData(treeData);
  }

  const getNodeKey = ({ treeIndex }) => treeIndex;
  const getRandomName = () =>
    firstNames[Math.floor(Math.random() * firstNames.length)];

  return (
    <div style={{ height: "100vh" }}>
      <SortableTree
        treeData={treeData}
        onChange={treeData => updateTreeData(treeData)}
        generateNodeProps={rowInfo => ({
          buttons: [
            <div>
              <input ref={inputEl.current[rowInfo.treeIndex]} type="text" />
              <br />
              <button
                label="Add Sibling"
                onClick={event => addNodeSibling(rowInfo)}
              >
                Add Sibling
              </button>
              <button
                label="Add Child"
                onClick={event => addNodeChild(rowInfo)}
              >
                Add Child
              </button>
              <button label="Delete" onClick={event => removeNode(rowInfo)}>
                Remove
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
