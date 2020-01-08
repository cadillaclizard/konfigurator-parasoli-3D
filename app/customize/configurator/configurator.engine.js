function ConfiguratorEngine($model, $q, $element, $scope) {
	var mainMesh, scene, renderer, camera, controls = {}, images = {}, selectedImage, raycaster, textureLoader, mouse, mouseHelper;
	var zoom = 0;

	this.isCameraEnabled = function() { return controls.enableRotate; }
	this.toggleCamera = function(enable) {
		controls.enableRotate = enable != undefined ? enable : !controls.enableRotate;
	}
	
	this.getCameraZoom = function() { return zoom; }
	this.zoomCamera = function(delta) {
		zoom = Math.max(0, Math.min(zoom + delta, 100));
		var distanceDelta = controls.maxDistance - controls.minDistance;
		controls.distance = controls.minDistance + distanceDelta * (100 - zoom) / 100;
		controls.update();
	}

	this.changeColor = function(color) {
		var colorInt = parseInt('0x' + color);
		mainMesh.traverse(function(child) {
			if (child instanceof THREE.Mesh) {
				child.material.color.setHex(colorInt);
			}
		});
	}

	this.addImage = function(image) {
		images[image.id] = image;
		initializeImage(image);
	}

	this.selectImage = function(image) { selectedImage = image; }
	
	this.updateImage = function(image) {
		if (!!image.decal.origin) {
			updateImageDecals(image);
		}
	}

	this.removeImage = function(image) {
		if (!!image.decal.material) {
			image.decal.material.dispose();
		}
		_.forEach(image.decal.items, function(decal) { scene.remove(decal); });
	}

	this.getScreenshot = function(phi, theta) {
		var oldDistance = controls.distance;
		var oldSpherical = $.extend({}, controls.spherical);
		var oldWidth = $element[0].offsetWidth;
		var oldHeight = $element[0].offsetHeight;

		// set canvas for screenshot
		this.zoomCamera(-100);
		this.zoomCamera(50);
		renderer.setSize(280 * 4, 200 * 4);
		controls.setPhi(1000);
		controls.setPhi(phi);
		controls.setTheta(theta);
		controls.update();
		renderer.render(scene, camera);

		var dataUrl = renderer.domElement.toDataURL();

		// revert changes
		renderer.setSize(oldWidth, oldHeight);
		controls.distance = oldDistance;
		controls.spherical = oldSpherical;
		controls.update();
		renderer.render(scene, camera);

		return dataUrl;
	}

	this.init = function() {
		var defer = $q.defer();
		scene = new THREE.Scene();

		// etc
		raycaster = new THREE.Raycaster();
		textureLoader = new THREE.TextureLoader();
		mouse = new THREE.Vector2();
		mouseHelper = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 10), new THREE.MeshNormalMaterial());

		loadModel().then(function() {
			// camera
			camera = new THREE.PerspectiveCamera(45, $element[0].offsetWidth / $element[0].offsetHeight, 1, 1000);
			camera.position.z = 500;

			// renderer
			renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
			renderer.setClearColor(0xf3f3f3);
			renderer.setPixelRatio(window.devicePixelRatio);
			renderer.setSize($element[0].offsetWidth, $element[0].offsetHeight);
			$element[0].appendChild(renderer.domElement);

			// lights
			var directionalLight = new THREE.DirectionalLight(0xffffff, 0.15);
			directionalLight.position.set(250, 500, 500);
			directionalLight.target.position.set(0, 0, 0);
			scene.add(directionalLight);
			directionalLight = new THREE.DirectionalLight(0xffffff, 0.15);
			directionalLight.position.set(500, 500, -250);
			directionalLight.target.position.set(0, 0, 0);
			scene.add(directionalLight);
			directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
			directionalLight.position.set(-250, 500, 0);
			directionalLight.target.position.set(0, 0, 0);
			scene.add(directionalLight);
			scene.add(new THREE.AmbientLight(0x404040, 2.5));

			// controls
			controls = new THREE.OrbitControls(camera, renderer.domElement);
			controls.setPhi(-45);
			controls.setTheta(70);
			controls.update();

			// TODO: dodać dispose
			(function render() {
				renderer.render(scene, camera);
				requestAnimationFrame(render);
			})();

			initUserEvents();

			defer.resolve();
		});

		return defer.promise;
	}

	function updateImageDecals(image) {
		var decalRepeat = getModelRepeat(image);
		var angleStep = 360 / decalRepeat * (Math.PI / 180);
		var scale = new THREE.Vector3(image.decal.scale * image.aspectRatio, image.decal.scale, image.decal.scale);
		var origin = threeOriginFromSimpleObj(image.decal.origin);
		origin.rotation.z -= image.decal.rotation * (Math.PI / 180);
		var geometry = new THREE.DecalGeometry(mainMesh, origin.point, origin.rotation, scale);
		var mesh = new THREE.Mesh(geometry, image.decal.material);

		_.forEach(image.decal.items, function(decal) { scene.remove(decal); });
		image.decal.items = [];
		
		for (var i = 0; i < decalRepeat; i++) {
			var decal = mesh.clone();
			decal.rotateOnAxis(new THREE.Vector3(0, 1, 0), angleStep * i);
			image.decal.items.push(decal);
			scene.add(decal);
		}

		$scope.$evalAsync(function() {});
	}

	function checkCollision() {
		if (controls.enableRotate)
			return null;
		
		raycaster.setFromCamera(mouse, camera);
		var intersects = raycaster.intersectObjects([mainMesh])[0];

		if (intersects) {
			var point = intersects.point;
			var normal = intersects.face.normal.clone();
			normal.add(point);

			mouseHelper.position.copy(point);
			mouseHelper.lookAt(normal);

			var origin = {
				point: point.clone(),
				normal: normal.clone(),
				rotation: mouseHelper.rotation.clone()
			}

			return simplifyOrigin(origin);
		}

		return null;
	}

	// ↓ Boring stuff below this line ↓

	function initializeImage(image) {
		if (!image.decal) {
			image.decal = {};
			image.decal.scale = !!image.textData ? 5 : 20;
			image.decal.rotation = 0;
		}

		image.decal.material = new THREE.MeshPhongMaterial({
			specular: 0x444444,
			normalScale: new THREE.Vector2(1, 1),
			shininess: 30,
			transparent: true,
			depthTest: true,
			depthWrite: false,
			polygonOffset: true,
			polygonOffsetFactor: -4,
			wireframe: false
		});
		
		var tex = textureLoader.load(image.url);
		tex.magFilter = THREE.LinearFilter;
		tex.anisotropy = 16;

		image.decal.material.map = tex;

		if (!!image.decal.origin) {
			updateImageDecals(image);
		}
	}

	function getModelRepeat(image) {
		if (image.repetition === "all")
			return $model.tiles;

		if (image.repetition === "half")
			return $model.tiles / 2;
		
		return 1;
	}

	function loadModel() {
		var loader = new THREE.JSONLoader();
		var modelPromise = $q.defer();
		var modelPartLoaded = new Rx.Subject();

		loader.load($model.model3d.top,
			function(geometry, materials) {
				var material = new THREE.MeshPhongMaterial({ specular: 0x111111 });
				mainMesh = new THREE.Mesh(geometry, material);
				mainMesh.position.y = -50;
				scene.add(mainMesh);
				modelPartLoaded.onNext();
			});

		loader.load($model.model3d.bot,
			function(geometry, materials) {
				var material = new THREE.MeshLambertMaterial({ color: 0xffffff });
				var mesh = new THREE.Mesh(geometry, material);
				mesh.position.y = -50;
				scene.add(mesh);
				modelPartLoaded.onNext();
			});

		modelPartLoaded.skip(1).take(1)
			.subscribeOnNext(function() {
				modelPromise.resolve();
			})

		return modelPromise.promise;
	}

	// Events ↓

	function initUserEvents() {
		renderer.domElement.addEventListener("mousedown", onMouseDown);
		renderer.domElement.addEventListener("mouseup", onMouseUp);
		renderer.domElement.addEventListener("mousemove", onTouchMove);
		renderer.domElement.addEventListener("touchmove", onTouchMove);
		window.addEventListener("resize", function() {
			camera.aspect = $element[0].offsetWidth /  $element[0].offsetHeight;
			camera.updateProjectionMatrix();
			renderer.setSize($element[0].offsetWidth, $element[0].offsetHeight);
		}, false);
	}

	function onMouseDown(event) {
		if (!selectedImage || !!controls.enableRotate)
			return;

		controls.enabled = false;
		onTouchMove(event);
	}

	function onMouseUp() { controls.enabled = true; }

	function onTouchMove(event) {
		if (controls.enabled)
			return;
		
		var x, y;

		if (event.changedTouches) {
			x = event.changedTouches[0].pageX;
			y = event.changedTouches[0].pageY;
		} else {
			x = event.offsetX;
			y = event.offsetY;
		}

		mouse.x = (x / $element[0].offsetWidth) * 2 - 1;
		mouse.y = - (y / $element[0].offsetHeight) * 2 + 1;

		var collision = checkCollision();
		if (!!collision && !controls.enabled) {
			selectedImage.decal.origin = collision;
			updateImageDecals(selectedImage);
		}
	}

	function simplifyOrigin(origin) {
		return {
			point: simplifyVector3(origin.point),
			normal: simplifyVector3(origin.normal),
			rotation: simplifyVector3(origin.rotation),
		}
	}

	function simplifyVector3(vector) {
		return { x: vector.x, y: vector.y, z: vector.z }
	}

	function threeVector3FromSimpleObj(vectorSimple) {
		return new THREE.Vector3(vectorSimple.x, vectorSimple.y, vectorSimple.z);
	}

	function threeOriginFromSimpleObj(originSimple) {
		return {
			point: threeVector3FromSimpleObj(originSimple.point),
			normal: threeVector3FromSimpleObj(originSimple.normal),
			rotation: threeVector3FromSimpleObj(originSimple.rotation),
		}
	}
}