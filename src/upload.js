import React from 'react'
import gql from 'graphql-tag'
import {  useMutation } from '@apollo/react-hooks'

function UploadFile(props) {
	const [uploadFile] = useMutation(UPLOAD_FILE)

	async function upload(files) {
		console.log(files[0])

		await uploadFile({
			variables: {
				file: files[0]
			}
		})
	}

	return (
		<form encType='multipart/form-data'>
			<input type='file' required onChange={e => upload(e.target.files)} />
		</form>
	)
}

const UPLOAD_FILE = gql`
	mutation($file: Upload!) {
		uploadFile(file: $file) {
			_id
			filename
			path
			createdAt
		}
	}
`

export default UploadFile
