import { FBXLoader, GLTFLoader } from 'three-stdlib'

export async function loadFbx(path) {
	const fbxLoader = new FBXLoader()

	return new Promise((resolve, reject) => {
		fbxLoader.load(
			path,
			(fbx) => {
				resolve(fbx)
			},
			null,
			(err) => {
				reject(err)
			}
		)
	})
}

export async function loadGltf(path) {
	const gltfLoader = new GLTFLoader()

	return new Promise((resolve, reject) => {
		gltfLoader.load(
			path,
			(gltf) => {
				resolve(gltf)
			},
			null,
			(err) => {
				reject(err)
			}
		)
	})
}
