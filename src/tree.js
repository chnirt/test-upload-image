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
const DELETE_NODE = gql`
	mutation deleteNode($_id: ID!) {
		deleteNode(_id: $_id)
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

const sample = {
	_id: 'bf9c20b0-0780-11ea-b1bc-9127c165b7f6',
	treeData: {
		id: '2e5cae40-0752-11ea-a4de-338b153089b3',
		title: 'Acexis',
		isDirectory: true,
		expanded: true,
		children: [
			{
				id: '7f75a950-09cb-11ea-adc7-0d095a1d54c1',
				title: 'Ban giam doc',
				parentId: '2e5cae40-0752-11ea-a4de-338b153089b3'
			},
			{
				id: '6b9b6440-0752-11ea-a4de-338b153089b3',
				title: 'Nhan su',
				parentId: '2e5cae40-0752-11ea-a4de-338b153089b3',
				expanded: true,
				children: []
			},
			{
				id: '71ec84a0-0752-11ea-a4de-338b153089b3',
				parentId: '2e5cae40-0752-11ea-a4de-338b153089b3',
				title: 'Kinh doanh',
				expanded: true,
				children: [
					{
						id: '65c55560-0754-11ea-a4de-338b153089b3',
						title: 'Cua hang A',
						expanded: true,
						children: []
					},
					{
						id: '9af76510-09d5-11ea-adc7-0d095a1d54c1',
						title: 'asas',
						parentId: '65c55560-0754-11ea-a4de-338b153089b3'
					},
					{
						id: '6a132bb0-0754-11ea-a4de-338b153089b3',
						title: 'Cua hang B',
						expanded: true,
						children: [
							{
								id: '0adee270-09d3-11ea-adc7-0d095a1d54c1',
								title: 'aaa',
								parentId: '2e5cae40-0752-11ea-a4de-338b153089b3',
								expanded: true
							},
							{
								id: '23d9be80-09d8-11ea-adc7-0d095a1d54c1',
								parentId: '71ec84a0-0752-11ea-a4de-338b153089b3',
								title: 'ewq'
							}
						]
					}
				]
			}
		]
	}
}

function Tree() {
	const [searchString, setSearchString] = useState('')
	const [searchFocusIndex, setSearchFocusIndex] = useState(0)
	const [searchFoundCount, setSearchFoundCount] = useState(null)
	const [treeData, setTreeData] = useState([])
	const [tree, setTree] = useState({})
	const [category, setCategory] = useState('COMPANY')

	const treeQuery = useQuery(GET_TREE)
	const [createTree] = useMutation(CREATE_TREE)
	const [updateTree] = useMutation(UPDATE_TREE)

	const [createNewNode] = useMutation(CREATE_NODE)
	const [updateNode] = useMutation(UPDATE_NODE)
	const [deleteNode] = useMutation(DELETE_NODE)
	const inputEl = useRef()
	// const inputEls = useRef(treeData.map(() => React.createRef()));

	console.log(treeQuery)

	useEffect(() => {
		setTreeData(treeQuery.data ? [treeQuery.data.tree.treeData] : [])
		setTree(treeQuery.tree)
	}, [treeQuery])
	function createNode() {
		const name = inputEl.current.value

		if (name === '') {
			inputEl.current.focus()
			return
		}

		// setTreeData(newTree.treeData)

		// inputEl.current.value = ''
		createNewNode({
			variables: {
				input: {
					parentId: null,
					name,
					category
				}
			}
		})
			.then(res => {
				const newNodeId = res.data.createNode._id

				const newTree = addNodeUnderParent({
					treeData: treeData,
					parentKey: null,
					expandParent: true,
					getNodeKey,
					newNode: {
						id: newNodeId,
						title: name,
						parentId: null
					}
				})

				createTree({
					variables: {
						input: newTree.treeData[0]
					}
				})
					.then(res => {
						setTreeData(newTree.treeData)
						inputEl.current.value = ''
					})
					.catch(err => {
						console.log(err)
					})
			})
			.catch(err => {
				console.log(err)
			})
	}

	function handleUpdateNode(rowInfo) {
		const { node, path, parentNode } = rowInfo
		const { id, parentId } = node

		const { value: name } = inputEl.current

		if (name === '') {
			inputEl.current.focus()
			return
		}

		updateNode({
			variables: {
				_id: id,
				input: {
					parentId: parentNode.id,
					name
				}
			}
		})
			.then(res => {
				const newTree = changeNodeAtPath({
					treeData,
					path,
					getNodeKey,
					newNode: {
						id,
						parentId,
						title: name
					}
				})
				updateTree({
					variables: {
						input: newTree[0],
						_id: tree._id
					}
				})
					.then(res => {
						setTreeData(newTree)
						inputEl.current.value = ''
					})
					.catch(err => {
						console.log(err)
					})
			})
			.catch(err => {
				console.log(err)
			})
	}

	async function addNodeChild(rowInfo) {
		let { path, node } = rowInfo
		const parentId = node.id
		const name = inputEl.current.value
		if (name === '') {
			inputEl.current.focus()
			return
		}

		createNewNode({
			variables: {
				input: {
					parentId,
					name,
					category
				}
			}
		})
			.then(res => {
				const newNodeId = res.data.createNode._id

				const newTree = addNodeUnderParent({
					treeData: treeData,
					parentKey: path[path.length - 1],
					expandParent: true,
					getNodeKey,
					newNode: {
						id: newNodeId,
						title: name,
						parentId
					}
				})

				updateTree({
					variables: {
						input: newTree.treeData[0],
						_id: tree._id
					}
				})
					.then(res => {
						setTreeData(newTree.treeData)
						inputEl.current.value = ''
					})
					.catch(err => {
						console.log(err)
					})
			})
			.catch(err => {
				console.log(err)
			})
	}

	function addNodeSibling(rowInfo) {
		const { path } = rowInfo

		const name = inputEl.current.value
		// const value = inputEls.current[treeIndex].current.value;

		if (name === '') {
			inputEl.current.focus()
			// inputEls.current[treeIndex].current.focus();
			return
		}

		const newTree = addNodeUnderParent({
			treeData: treeData,
			parentKey: path[path.length - 2],
			expandParent: true,
			getNodeKey,
			newNode: {
				title: name
			}
		})

		setTreeData(newTree.treeData)

		inputEl.current.value = ''
		// inputEls.current[treeIndex].current.value = "";
	}

	const handleMoveNode = data => {
		const { node, nextParentNode, treeData: newTreeData } = data
		updateNode({
			variables: {
				_id: node.id,
				input: {
					parentId: nextParentNode.id
				}
			}
		})
			.then(res => {
				updateTree({
					variables: {
						input: newTreeData[0],
						_id: tree._id
					}
				})
					.then(res => {
						setTreeData(newTreeData)
					})
					.catch(err => {
						console.log(err)
					})
			})
			.catch(err => {
				console.log(err)
			})
	}

	function removeNode(rowInfo) {
		const { path, node } = rowInfo

		const newTreeData = removeNodeAtPath({
			treeData,
			path,
			getNodeKey
		})
		deleteNode({
			variables: {
				_id: node._id
			}
		})
			.then(res => {
				updateTree({
					variables: {
						input: newTreeData[0],
						_id: tree._id
					}
				})
					.then(res => {
						console.log(res)
						setTreeData(newTreeData)
					})
					.catch(err => {
						console.log(err)
					})
			})
			.catch(err => {
				console.log(err)
			})
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
					onMoveNode={rowInfo => handleMoveNode(rowInfo)}
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
								<button
									label="Update"
									onClick={event => handleUpdateNode(rowInfo)}
								>
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
