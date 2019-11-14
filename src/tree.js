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
  const [searchString, setSearchString] = useState("");
  const [searchFocusIndex, setSearchFocusIndex] = useState(0);
  const [searchFoundCount, setSearchFoundCount] = useState(null);
  const [treeData, setTreeData] = useState([
    {
      title: "Chicken",
      children: [{ title: "Egg", children: [{ title: "ASD" }] }]
    },
    { title: "Fish", children: [{ title: "fingerline" }] },
    {
      title: "Pick",
      children: [{ title: "Pickon", children: [{ title: "ASD" }] }]
    }
  ]);

  const inputEl = useRef();
  // const inputEls = useRef(treeData.map(() => React.createRef()));

  function createNode() {
    const value = inputEl.current.value;

    if (value === "") {
      inputEl.current.focus();
      return;
    }

    let newTree = addNodeUnderParent({
      treeData: treeData,
      parentKey: null,
      expandParent: true,
      getNodeKey,
      newNode: {
        title: value
      }
    });

    setTreeData(newTree.treeData);

    inputEl.current.value = "";
  }

  function addNodeChild(rowInfo) {
    let { treeIndex, path } = rowInfo;

    const value = inputEl.current.value;
    // const value = inputEls.current[treeIndex].current.value;

    if (value === "") {
      inputEl.current.focus();
      // inputEls.current[treeIndex].current.focus();
      return;
    }

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

    inputEl.current.value = "";
    // inputEls.current[treeIndex].current.value = "";
  }

  function addNodeSibling(rowInfo) {
    let { treeIndex, path } = rowInfo;

    const value = inputEl.current.value;
    // const value = inputEls.current[treeIndex].current.value;

    if (value === "") {
      inputEl.current.focus();
      // inputEls.current[treeIndex].current.focus();
      return;
    }

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

    inputEl.current.value = "";
    // inputEls.current[treeIndex].current.value = "";
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

  function expand(expanded) {
    setTreeData(
      toggleExpandedForAll({
        treeData,
        expanded
      })
    );
  }

  function expandAll() {
    expand(true);
  }

  function collapseAll() {
    expand(false);
  }

  const alertNodeInfo = ({ node, path, treeIndex }) => {
    const objectString = Object.keys(node)
      .map(k => (k === "children" ? "children: Array" : `${k}: '${node[k]}'`))
      .join(",\n   ");

    global.alert(
      "Info passed to the icon and button generators:\n\n" +
        `node: {\n   ${objectString}\n},\n` +
        `path: [${path.join(", ")}],\n` +
        `treeIndex: ${treeIndex}`
    );
  };

  const selectPrevMatch = () => {
    setSearchFocusIndex(
      searchFocusIndex !== null
        ? (searchFoundCount + searchFocusIndex - 1) % searchFoundCount
        : searchFoundCount - 1
    );
  };

  const selectNextMatch = () => {
    setSearchFocusIndex(
      searchFocusIndex !== null ? (searchFocusIndex + 1) % searchFoundCount : 0
    );
  };

  const getNodeKey = ({ treeIndex }) => treeIndex;

  return (
    <div>
      <div style={{ flex: "0 0 auto", padding: "0 15px" }}>
        <h3>Full Node Drag Theme</h3>
        <input ref={inputEl} type="text" />
        <br />
        <button onClick={createNode}>Create Node</button>
        <br />
        <button onClick={expandAll}>Expand All</button>
        <button onClick={collapseAll}>Collapse All</button>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <form
          style={{ display: "inline-block" }}
          onSubmit={event => {
            event.preventDefault();
          }}
        >
          <label htmlFor="find-box">
            Search:&nbsp;
            <input
              id="find-box"
              type="text"
              value={searchString}
              onChange={event => setSearchString(event.target.value)}
            />
          </label>

          <button
            type="button"
            disabled={!searchFoundCount}
            onClick={selectPrevMatch}
          >
            &lt;
          </button>

          <button
            type="submit"
            disabled={!searchFoundCount}
            onClick={selectNextMatch}
          >
            &gt;
          </button>

          <span>
            &nbsp;
            {searchFoundCount > 0 ? searchFocusIndex + 1 : 0}
            &nbsp;/&nbsp;
            {searchFoundCount || 0}
          </span>
        </form>
      </div>

      <div style={{ height: "100vh" }}>
        <SortableTree
          treeData={treeData}
          onChange={treeData => updateTreeData(treeData)}
          searchQuery={searchString}
          searchFocusOffset={searchFocusIndex}
          searchFinishCallback={matches => {
            setSearchFoundCount(matches.length);
            setSearchFocusIndex(
              matches.length > 0 ? searchFocusIndex % matches.length : 0
            );
          }}
          canDrag={({ node }) => !node.dragDisabled}
          generateNodeProps={rowInfo => ({
            buttons: [
              <div>
                {/* <input ref={inputEls.current[rowInfo.treeIndex]} type="text" /> */}
                {/* <br /> */}
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
    </div>
  );
}

export default Tree;
