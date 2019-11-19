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
	mutation createTree($input: JSON) {
		createTree(input: $input)
	}
`
const UPDATE_TREE = gql`
	mutation updateTree($input: JSON, $_id: ID) {
		updateTree(input: $input, _id: $_id)
	}
`

function Tree() {
	const [searchString, setSearchString] = useState('')
	const [searchFocusIndex, setSearchFocusIndex] = useState(0)
	const [searchFoundCount, setSearchFoundCount] = useState(null)
	// const [treeData, setTreeData] = useState([])
	const [tree, setTree] = useState()
	const [category, setCategory] = useState('COMPANY')

	const treeQuery = useQuery(GET_TREE)
	const [createTree] = useMutation(CREATE_TREE)
	const [updateTree] = useMutation(UPDATE_TREE)

	const [createNewNode] = useMutation(CREATE_NODE)
	const [updateNode] = useMutation(UPDATE_NODE)
	const [deleteNode] = useMutation(DELETE_NODE)
	const inputEl = useRef()
	// const inputEls = useRef(treeData.map(() => React.createRef()));

	useEffect(() => {
		const { loading, data } = treeQuery
		if (!loading) {
			setTree(data && data.tree)
		}
	}, [treeQuery])
	function handleCreateNode() {
		const name = inputEl.current.value

		if (name === '') {
			inputEl.current.focus()
			return
		}

		tree
			? createNewNode({
					variables: {
						input: {
							parentId: null,
							name,
							category
						}
					}
			  })
					.then(res => {
						const { _id, name, parentId } = res.data.createNode
						const createdNode = {
							id: _id,
							title: name,
							parentId
						}
						const updatedTree = {
							_id: tree._id,
							treeData: [...tree.treeData, createdNode]
						}
						updateTree({
							variables: {
								input: updatedTree.treeData,
								_id: updatedTree._id
							}
						})
							.then(res => {
								setTree(updatedTree)
								inputEl.current.value = ''
							})
							.catch(err => {
								console.log(err)
							})
					})
					.catch(err => {
						console.log(err)
					})
			: createNewNode({
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
							treeData: tree ? tree.treeData : [],
							parentKey: null,
							expandParent: true,
							getNodeKey,
							newNode: {
								id: newNodeId,
								title: name,
								parentId: null
							}
						})
						const { treeData } = newTree
						createTree({
							variables: {
								input: treeData
							}
						})
							.then(res => {
								const _id = res && res.data && res.data.createTree
								const createdTree = {
									_id,
									treeData: treeData
								}
								setTree(createdTree)
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
					treeData: tree.treeData,
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
						input: newTree,
						_id: tree._id
					}
				})
					.then(res => {
						const updatedTree = {
							_id: tree._id,
							treeData: newTree
						}
						setTree(updatedTree)
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
					treeData: tree.treeData,
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
						input: newTree.treeData,
						_id: tree._id
					}
				})
					.then(res => {
						const updatedTree = {
							_id: tree._id,
							treeData: newTree.treeData
						}
						setTree(updatedTree)
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
			treeData: tree.treeData,
			parentKey: path[path.length - 2],
			expandParent: true,
			getNodeKey,
			newNode: {
				title: name
			}
		})

		// setTreeData(newTree.treeData)

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
				const updatedTree = {
					_id: tree._id,
					treeData: newTreeData
				}
				setTree(updatedTree)
				updateTree({
					variables: {
						input: newTreeData,
						_id: tree._id
					}
				})
					.then(res => {})
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
			treeData: tree.treeData,
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
						input: newTreeData,
						_id: tree._id
					}
				})
					.then(res => {
						console.log(res)
						const updatedTree = {
							_id: tree._id,
							treeData: newTreeData
						}
						setTree(updatedTree)
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
		// setTreeData(treeData)
	}

	function expand(expanded) {
		// setTreeData(
		// 	toggleExpandedForAll({
		// 		treeData,
		// 		expanded
		// 	})
		// )
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
				<button onClick={() => handleCreateNode()}>Create Node</button>
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
					treeData={tree ? tree.treeData : []}
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
