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

  function addNodeChild(rowInfo) {
    let { treeIndex, path } = rowInfo;

    const value = inputEl.current[treeIndex].current.value;

    let newTree = addNodeUnderParent({
      treeData: treeData,
      parentKey: path[path.length - 1],
      expandParent: true,
      getNodeKey,
      newNode: {
        title: value
      }
    });
    setTreeData(newTree.treeData);
  }

  function addNodeSibling(rowInfo) {
    let { treeIndex, path } = rowInfo;

    const value = inputEl.current[treeIndex].current.value;

    let newTree = addNodeUnderParent({
      treeData: treeData,
      parentKey: path[path.length - 2],
      expandParent: true,
      getNodeKey,
      newNode: {
        title: value
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
