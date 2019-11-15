/* eslint-disable */

import 'react-sortable-tree/style.css'

import React, { useRef, useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'

import SortableTree, {
	addNodeUnderParent,
	changeNodeAtPath,
	defaultSearchMethod,
	getNodeAtPath,
	map as mapTree,
	removeNodeAtPath,
	toggleExpandedForAll
} from 'react-sortable-tree'

const GET_NODES = gql`
	query nodes {
		nodes {
			_id
			name
			start
			end
			location
			description
		}
	}
`
const GET_TREE = gql`
	query tree {
		tree {
			_id
			treeData
		}
	}
`
const CREATE_NODE = gql`
	mutation createNode($input: CreateNodeInput!) {
		createNode(input: $input) {
			_id
			parentId
			name
		}
	}
`
const UPDATE_NODE = gql`
	mutation updateNode($_id: ID!, $input: UpdateNodeInput!) {
		updateNode(_id: $_id, input: $input) {
			_id
			parentId
			name
		}
	}
`
const CREATE_TREE = gql`
	mutation createTree($input: JSONObject) {
		createTree(input: $input)
	}
`
const UPDATE_TREE = gql`
	mutation updateTree($input: JSONObject, $_id: ID) {
		updateTree(input: $input, _id: $_id)
	}
`

function Tree() {
	const [searchString, setSearchString] = useState('')
	const [searchFocusIndex, setSearchFocusIndex] = useState(0)
	const [searchFoundCount, setSearchFoundCount] = useState(null)
	const [treeData, setTreeData] = useState([])
	const [tree, setTree] = useState()
	const [category, setCategory] = useState('COMPANY')
	const [createTree] = useMutation(CREATE_TREE)
	const [updateTree] = useMutation(UPDATE_TREE)
	const [createNewNode] = useMutation(CREATE_NODE)
	const [updateNode] = useMutation(UPDATE_NODE)
	const inputEl = useRef()
	// const inputEls = useRef(treeData.map(() => React.createRef()));
	const treeQuery = useQuery(GET_TREE)
	useEffect(() => {
		const { loading, data: treeDataQuery } = treeQuery
		if (!loading) {
			setTreeData([treeDataQuery.tree.treeData])
			setTree(treeDataQuery.tree)
		}
	}, [treeQuery])
	function createNode() {
		const value = inputEl.current.value

		// if (value === '') {
		// 	inputEl.current.focus()
		// 	return
		// }

		// let newTree = addNodeUnderParent({
		// 	treeData: treeData,
		// 	parentKey: null,
		// 	expandParent: true,
		// 	getNodeKey,
		// 	newNode: {
		// 		title: value
		// 	}
		// })

		// setTreeData(newTree.treeData)

		// inputEl.current.value = ''
	}

	function handleUpdateNode(rowInfo) {
		const { node, path } = rowInfo
		const { children } = node

		const value = inputEl.current.value

		if (value === '') {
			inputEl.current.focus()
			return
		}

		let newTree = changeNodeAtPath({
			treeData,
			path,
			getNodeKey,
			newNode: {
				children,
				title: value
			}
		})

		setTreeData(newTree)

		inputEl.current.value = ''
	}

	async function addNodeChild(rowInfo) {
		let { path, node } = rowInfo
		const parentId = node.id
		let newNodeId = ''
		const { value: name } = inputEl.current
		// const value = inputEls.current[treeIndex].current.value;
		if (name === '') {
			inputEl.current.focus()
			// inputEls.current[treeIndex].current.focus();
			return
		}
		// create new node
		const newNode = {
			parentId,
			name,
			category
		}
		await createNewNode({
			variables: {
				input: newNode
			}
		})
			.then(res => {
				// console.log(res.data.createNode._id)
				newNodeId = res.data.createNode._id
			})
			.catch(err => {
				console.log(err)
			})
		let newTree = addNodeUnderParent({
			treeData: treeData,
			parentKey: path[path.length - 1],
			expandParent: true,
			getNodeKey,
			newNode: {
				_id: newNodeId,
				title: name,
				parentId
			}
		})

		updateTree({
			variables: {
				input: newTree.treeData[0],
				_id: tree._id
			},
			refetchQueries: [
				{
					query: GET_TREE
				}
			]
		})
			.then(res => {
				console.log(res)
			})
			.catch(err => {
				console.log(err)
			})
		setTreeData(newTree.treeData)
		console.log(newTree.treeData)

		inputEl.current.value = ''
		// inputEls.current[treeIndex].current.value = "";
	}

	function addNodeSibling(rowInfo) {
		let { path } = rowInfo

		const value = inputEl.current.value
		// const value = inputEls.current[treeIndex].current.value;

		if (value === '') {
			inputEl.current.focus()
			// inputEls.current[treeIndex].current.focus();
			return
		}

		let newTree = addNodeUnderParent({
			treeData: treeData,
			parentKey: path[path.length - 2],
			expandParent: true,
			getNodeKey,
			newNode: {
				title: value
			}
		})

		setTreeData(newTree.treeData)

		inputEl.current.value = ''
		// inputEls.current[treeIndex].current.value = "";
	}

	const handleMoveNode = data => {
		// data.node.parentId = data.nextParentNode.id
		console.log(data)
		const { node, nextParentNode, treeData: newTreeData } = data
		const nodeUpdated = {
			parentId: nextParentNode.id
		}
    console.log('TCL: Tree -> nodeUpdated', nodeUpdated)
		updateNode({
			variables: {
				_id: node._id,
				input: nodeUpdated
			}
		})
			.then(res => {
				console.log(res)
			})
			.catch(err => {
				console.log(err)
			})
			updateTree({
				variables: {
					input: newTreeData[0],
					_id: tree._id
				},
				refetchQueries: [
					{
						query: GET_TREE
					}
				]
			})
				.then(res => {
					console.log(res)
				})
				.catch(err => {
					console.log(err)
				})
			setTreeData(newTreeData)
	}

	function removeNode(rowInfo) {
		const { path } = rowInfo
		setTreeData(
			removeNodeAtPath({
				treeData,
				path,
				getNodeKey
			})
		)
	}

	function updateTreeData(treeData) {
		setTreeData(treeData)
	}

	function expand(expanded) {
		setTreeData(
			toggleExpandedForAll({
				treeData,
				expanded
			})
		)
	}

	function expandAll() {
		expand(true)
	}

	function collapseAll() {
		expand(false)
	}

	const alertNodeInfo = ({ node, path, treeIndex }) => {
		const objectString = Object.keys(node)
			.map(k => (k === 'children' ? 'children: Array' : `${k}: '${node[k]}'`))
			.join(',\n   ')

		global.alert(
			'Info passed to the icon and button generators:\n\n' +
				`node: {\n   ${objectString}\n},\n` +
				`path: [${path.join(', ')}],\n` +
				`treeIndex: ${treeIndex}`
		)
	}

	const selectPrevMatch = () => {
		setSearchFocusIndex(
			searchFocusIndex !== null
				? (searchFoundCount + searchFocusIndex - 1) % searchFoundCount
				: searchFoundCount - 1
		)
	}

	const selectNextMatch = () => {
		setSearchFocusIndex(
			searchFocusIndex !== null ? (searchFocusIndex + 1) % searchFoundCount : 0
		)
	}

	const getNodeKey = ({ treeIndex }) => treeIndex

	return (
		<div>
			<div style={{ flex: '0 0 auto', padding: '0 15px' }}>
				<h3>Full Node Drag Theme</h3>
				<div>
					<input ref={inputEl} type="text" />
					<select onChange={e => setCategory(e.target.value)}>
						<option value="COMPANY">COMPANY</option>
						<option value="DEPARTMENT">DEPARTMENT</option>
						<option value="CITY">CITY</option>
						<option value="STORE">STORE</option>
						<option value="POSITION">POSITION</option>
						<option value="JOB">JOB</option>
					</select>
				</div>
				<br />
				<button onClick={() => createNode()}>Create Node</button>
				<br />
				<button onClick={expandAll}>Expand All</button>
				<button onClick={collapseAll}>Collapse All</button>
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				<form
					style={{ display: 'inline-block' }}
					onSubmit={event => {
						event.preventDefault()
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

			<div style={{ height: '100vh' }}>
				<SortableTree
					treeData={treeData}
					onChange={treeData => updateTreeData(treeData)}
					onMoveNode={data => handleMoveNode(data)}
					searchQuery={searchString}
					searchFocusOffset={searchFocusIndex}
					searchFinishCallback={matches => {
						setSearchFoundCount(matches.length)
						setSearchFocusIndex(
							matches.length > 0 ? searchFocusIndex % matches.length : 0
						)
					}}
					canDrag={({ node }) => !node.dragDisabled}
					generateNodeProps={rowInfo => ({
						buttons: [
							<div>
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
								<button label="Update" onClick={event => handleUpdateNode(rowInfo)}>
									Update
								</button>
								<button label="Delete" onClick={event => removeNode(rowInfo)}>
									Remove
								</button>
								<button label="Alert" onClick={event => alertNodeInfo(rowInfo)}>
									Info
								</button>
							</div>
						],
						style: {
							height: '50px'
						}
					})}
				/>
			</div>
		</div>
	)
}

export default Tree
