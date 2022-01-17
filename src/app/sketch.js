// @ts-check
import * as THREE from 'three'
import { OrbitControls, RGBELoader } from 'three-stdlib'
import Stats from 'stats.js'
import GUI from 'lil-gui'
import { loadGltf } from './utils'

export class Sketch {
	constructor(props) {
		this.root = props.root
		this.setup()
		this.resize()
		window.addEventListener('resize', this.resize)
		window.addEventListener('keydown', this.fullscreen)
		window.addEventListener('mousemove', this.mousemove)
	}

	setup() {
		this.guiProps = {}
		this.width = window.innerWidth
		this.height = window.innerHeight
		this.clock = new THREE.Clock()
		this.mouse = new THREE.Vector2()
		this.then = performance.now()

		this.scene = new THREE.Scene()
		this.scene.background = new THREE.Color('#111111')

		const fov = 50
		const aspect = this.width / this.height
		const near = 0.1
		const far = 100
		this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
		this.camera.position.set(0, 0, 30)

		this.renderer = new THREE.WebGLRenderer({ antialias: true })
		this.renderer.setAnimationLoop(this.update)
		this.renderer.physicallyCorrectLights = true
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping
		this.renderer.toneMappingExposure = 1
		this.renderer.outputEncoding = THREE.sRGBEncoding
		this.renderer.shadowMap.enabled = true
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
		this.root.appendChild(this.renderer.domElement)

		this.orbit = new OrbitControls(this.camera, this.renderer.domElement)
		this.orbit.enableDamping = true
		this.orbit.target.set(0, 0, 0)
		this.orbit.enablePan = true
		this.orbit.enableRotate = true
		this.orbit.enableZoom = true
		// this.orbit.maxPolarAngle = Math.PI / 2

		this.stats = new Stats()
		this.root.appendChild(this.stats.dom)

		const loadingManager = new THREE.LoadingManager()
		this.rgbeLoader = new RGBELoader(loadingManager)
		this.textureLoader = new THREE.TextureLoader(loadingManager)
		this.cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)

		this.addGui()
		this.addStuff()
		this.addLights()
	}

	async addStuff() {
		/**
		 * Add stuff here
		 */
		this.ground = new THREE.Mesh(new THREE.PlaneGeometry(50, 50, 50, 50), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide }))
		this.ground.rotation.x = -Math.PI / 2
		this.ground.position.y = -5
		this.ground.receiveShadow = true
		this.scene.add(this.ground)

		const gltf = await loadGltf('/models/suzanne.gltf')
		this.suzanne = gltf.scene
		this.suzanne.scale.setScalar(4)
		this.suzanne.traverse((c) => {
			if (c.isMesh) {
				c.castShadow = true
				c.material = new THREE.MeshStandardMaterial()
			}
		})
		this.scene.add(this.suzanne)
	}

	addLights() {
		const ambientLight = new THREE.AmbientLight(0xffffff, 1)
		this.scene.add(ambientLight)

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
		directionalLight.position.set(10, 10, 10)
		directionalLight.shadow.mapSize.set(2048, 2048)
		directionalLight.shadow.camera.left = 10
		directionalLight.shadow.camera.right = -10
		directionalLight.shadow.camera.top = 10
		directionalLight.shadow.camera.bottom = -10
		directionalLight.shadow.camera.far = 50
		directionalLight.shadow.camera.near = 1
		directionalLight.castShadow = true
		this.scene.add(directionalLight)
		// this.scene.add(new THREE.CameraHelper(directionalLight.shadow.camera))
	}

	addGui() {
		this.gui = new GUI({ width: 300 })
	}

	animate(elapsedTime, deltaTime) {
		/**
		 * Animate stuff here
		 */
	}

	update = () => {
		const now = performance.now()
		const elapsedTime = this.clock.getElapsedTime()
		const deltaTime = (now - this.then) * 0.001
		this.then = now
		this.animate(elapsedTime, deltaTime)
		this.stats.update()
		this.orbit.update()
		this.renderer.render(this.scene, this.camera)
	}

	resize = () => {
		this.width = window.innerWidth
		this.height = window.innerHeight

		this.camera.aspect = this.width / this.height
		this.camera.updateProjectionMatrix()

		this.renderer.setSize(this.width, this.height)
		this.renderer.setPixelRatio(window.devicePixelRatio)
	}

	fullscreen = (e) => {
		if (e.ctrlKey && e.code === 'Space') {
			if (document.fullscreenElement) {
				document.exitFullscreen()
			} else {
				this.renderer.domElement.requestFullscreen()
			}
		}
	}

	mousemove = (e) => {
		this.mouse.x = e.clientX / this.width - 0.5
		this.mouse.y = 0.5 - e.clientY / this.height
	}
}
