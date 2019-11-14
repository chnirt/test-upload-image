import React, { useState } from "react";
import SortableTree, { toggleExpandedForAll } from "react-sortable-tree";

import nodeContentRenderer from "./node-content-renderer";
import treeNodeRenderer from "./tree-node-renderer";

const CustomTheme = {
  nodeContentRenderer,
  treeNodeRenderer,
  scaffoldBlockPxWidth: 45
};

function TreeB() {
  const [searchString, setSearchString] = useState("");
  const [searchFocusIndex, setSearchFocusIndex] = useState(0);
  const [searchFoundCount, setSearchFoundCount] = useState(null);
  const [treeData, setTreeData] = useState([
    { title: "This is the Full Node Drag theme" },
    { title: "You can click anywhere on the node to drag it" },
    {
      title: "This node has dragging disabled",
      subtitle: "Note how the hover behavior is different",
      dragDisabled: true
    },
    { title: "Chicken", children: [{ title: "Egg" }] }
  ]);

  // const [state, setState] = useState({
  //   searchString: "",
  //   searchFocusIndex: 0,
  //   searchFoundCount: null,
  //   treeData: [
  //     { title: "This is the Full Node Drag theme" },
  //     { title: "You can click anywhere on the node to drag it" },
  //     {
  //       title: "This node has dragging disabled",
  //       subtitle: "Note how the hover behavior is different",
  //       dragDisabled: true
  //     },
  //     { title: "Chicken", children: [{ title: "Egg" }] }
  //   ]
  // });

  function updateTreeData(treeData) {
    // setState({ treeData });
    setTreeData(treeData);
  }

  function expand(expanded) {
    // setState({
    //   treeData: toggleExpandedForAll({
    //     treeData: state.treeData,
    //     expanded
    //   })
    // });
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
    // setState({
    //   searchFocusIndex:
    //     state.searchFocusIndex !== null
    //       ? (state.searchFoundCount + state.searchFocusIndex - 1) %
    //         state.searchFoundCount
    //       : state.searchFoundCount - 1
    // });
    setSearchFocusIndex(
      searchFocusIndex !== null
        ? (searchFoundCount + searchFocusIndex - 1) % searchFoundCount
        : searchFoundCount - 1
    );
  };

  const selectNextMatch = () => {
    // setState({
    //   searchFocusIndex:
    //     state.searchFocusIndex !== null
    //       ? (state.searchFocusIndex + 1) % state.searchFoundCount
    //       : 0
    // });
    setSearchFocusIndex(
      searchFocusIndex !== null ? (searchFocusIndex + 1) % searchFoundCount : 0
    );
  };

  console.log(treeData);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ flex: "0 0 auto", padding: "0 15px" }}>
        <h3>Full Node Drag Theme</h3>
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

      <div style={{ flex: "1 0 50%", padding: "0 0 0 15px", height: "100vh" }}>
        <SortableTree
          theme={CustomTheme}
          treeData={treeData}
          onChange={updateTreeData}
          searchQuery={searchString}
          searchFocusOffset={searchFocusIndex}
          // style={{ width: "600px" }}
          // rowHeight={45}
          searchFinishCallback={matches => {
            setSearchFoundCount(matches.length);
            setSearchFocusIndex(
              matches.length > 0 ? searchFocusIndex % matches.length : 0
            );
          }}
          canDrag={({ node }) => !node.dragDisabled}
          generateNodeProps={rowInfo => ({
            buttons: [<button onClick={() => alertNodeInfo(rowInfo)}>i</button>]
          })}
        />
      </div>
    </div>
  );
}

export default TreeB;
