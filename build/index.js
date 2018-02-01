var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Game = (function () {
    function Game(canvasId) {
        var _this = this;
        this.time = 0;
        var canvas = document.getElementById(canvasId);
        this.engine = new BABYLON.Engine(canvas, true);
        // Contiens l'ensemble des assets du jeu autre que l'environnement
        this.assets = [];
        this.targets = [];
        // La scène 3D du jeu
        this.scene = null;
        this.timeGui = document.getElementById('time');
        this.targetGui = document.getElementById('targets');
        // On resize le jeu en fonction de la taille de la fenetre
        window.addEventListener("resize", function () {
            _this.engine.resize();
        });
        this.run();
    }
    Game.prototype.initScene = function () {
        var _this = this;
        // Change camera controls
        var cam = this.scene.activeCamera;
        cam.attachControl(this.engine.getRenderingCanvas());
        cam.keysUp.push(90);
        cam.keysDown.push(83);
        cam.keysLeft.push(81);
        cam.keysRight.push(68);
        // Set full screen
        var setFullScreen = function () {
            _this.engine.isPointerLock = true;
            window.removeEventListener('click', setFullScreen);
        };
        window.addEventListener('click', setFullScreen);
        // Skybox
        var skybox = BABYLON.Mesh.CreateSphere("skyBox", 32, 1000.0, this.scene);
        skybox.position.y = 50;
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("skybox/TropicalSunnyDay", this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;
        // Gestion des ombres portees
        var defaultLight = this.scene.getLightByName('Default light');
        defaultLight.intensity = 0.5;
        var dir = new BABYLON.DirectionalLight('dirLight', new BABYLON.Vector3(-0.5, -1, -0.5), this.scene);
        dir.position = new BABYLON.Vector3(40, 60, 40);
        var shadowGenerator = new BABYLON.ShadowGenerator(1024, dir);
        shadowGenerator.useBlurVarianceShadowMap = true;
        // Application des ombres aux maisons et arbre
        this.scene.meshes.forEach(function (m) {
            if (m.name.indexOf('maison') !== -1 || m.name.indexOf('arbre') !== -1) {
                shadowGenerator.getShadowMap().renderList.push(m);
                m.receiveShadows = false;
            }
            else {
                m.receiveShadows = true;
            }
        });
        // Le son de l'arme
        var gunshot = new BABYLON.Sound("gunshot", "assets/sounds/shot.wav", this.scene, null, { loop: false, autoplay: false });
        this.assets['gunshot'] = gunshot;
    };
    Game.prototype.run = function () {
        var _this = this;
        BABYLON.SceneLoader.Load('assets/', 'map.babylon', this.engine, function (scene) {
            _this.scene = scene;
            _this.initScene();
            _this.scene.executeWhenReady(function () {
                _this.engine.runRenderLoop(function () {
                    _this.scene.render();
                });
            });
            _this.initGame();
            // this.scene.debugLayer.show();
        });
    };
    Game.prototype.initGame = function () {
        var _this = this;
        // Get weapon
        this.scene.getMeshByName('blaster').position = new BABYLON.Vector3(0.05, -0.1, 0.4);
        this.scene.getMeshByName('blaster').parent = this.scene.activeCamera;
        // Active toutes les cibles de la scène
        this.scene.meshes.forEach(function (m) {
            if (m.name.indexOf('target') !== -1) {
                m.isPickable = true; // Pour pouvoir les détruire
                m.rotationQuaternion = null;
                _this.targets.push(m);
            }
        });
        var soleil = BABYLON.Mesh.CreateSphere('soleil', 16, 10, this.scene);
        soleil.position = new BABYLON.Vector3(0, 100, 0);
        var soleilMaterial = new BABYLON.StandardMaterial('soleilMaterial', this.scene);
        soleilMaterial.emissiveColor = BABYLON.Color3.Yellow();
        soleilMaterial.specularColor = BABYLON.Color3.Black();
        soleil.material = soleilMaterial;
        // Rotation infinie de toutes les cibles
        this.scene.registerBeforeRender(function () {
            _this.targets.forEach(function (target) {
                target.rotation.y += 0.1 * _this.scene.getAnimationRatio();
            });
        });
        // Active le tir
        this.scene.onPointerDown = function (evt, pr) {
            var width = _this.scene.getEngine().getRenderWidth();
            var height = _this.scene.getEngine().getRenderHeight();
            var pickInfo = _this.scene.pick(width / 2, height / 2);
            // Effet sonore
            _this.assets['gunshot'].play();
            if (pickInfo.hit) {
                _this.destroyTarget(pickInfo.pickedMesh);
            }
        };
        // Lance le timer
        setInterval(this.updateTime.bind(this), 1000);
    };
    /**
     * Efface la cible donnée en paramètre.
     */
    Game.prototype.destroyTarget = function (target) {
        var index = this.targets.indexOf(target);
        if (index > -1) {
            this.targets.splice(index, 1);
            target.dispose();
            // Mise à jour de l'interface
            this.targetGui.innerHTML = String(this.targets.length);
            if (this.targets.length == 0) {
            }
        }
    };
    Game.prototype.updateTime = function () {
        this.time++;
        this.timeGui.innerHTML = String(this.time);
    };
    return Game;
})();
//# sourceMappingURL=Game.js.map 
var BABYLON;
(function (BABYLON) {
    var Main = /** @class */ (function () {
        /**
         * Constructor
         */
        function Main() {
            var _this = this;
            var canvas = document.getElementById('renderCanvas');
            this.engine = new BABYLON.Engine(document.getElementById('renderCanvas'));
            this.scene = new BABYLON.Scene(this.engine);
            this.scene.collisionsEnabled = true;
            this.bullets = 0;
            //Setup physics
            this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());
            this.camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(35, 35, 35), this.scene);
            this.camera.setTarget(new BABYLON.Vector3(50, 100, 0));
            this.camera.attachControl(this.engine.getRenderingCanvas());
            this.camera.checkCollisions = true;
            this.camera.ellipsoid = new BABYLON.Vector3(2, 2, 3);
            this.camera.minZ = -0.5;
            this.camera.applyGravity = true;
            this.camera.keysUp = [90]; // Z
            this.camera.keysDown = [83]; // S
            this.camera.keysLeft = [81]; // Q
            this.camera.keysRight = [68]; // D
            // Set full screen
            var setFullScreen = function () {
                canvas.requestPointerLock();
            };
            window.addEventListener('click', setFullScreen);
            // Skybox
            var skybox = BABYLON.Mesh.CreateSphere("skyBox", 32, 1000.0, this.scene);
            skybox.infiniteDistance = true;
            var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
            skybox.material = skyboxMaterial;
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("../assets/TropicalSunnyDay", this.scene);
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
            skyboxMaterial.disableLighting = true;
            this.light = new BABYLON.PointLight('light', new BABYLON.Vector3(15, 15, 15), this.scene);
            // Ground and amterial
            this.ground = BABYLON.Mesh.CreateGround('ground', 512, 512, 32, this.scene);
            this.ground.checkCollisions = true;
            this.ground.physicsImpostor = new BABYLON.PhysicsImpostor(this.ground, BABYLON.PhysicsImpostor.BoxImpostor, {
                mass: 0
            });
            //Create Walls
            /*
            const leftWall = new Wall("leftWall", this.scene);
            const rigthWall = new Wall("rigthWall", this.scene);
            leftWall.checkCollisions = true;
            rigthWall.checkCollisions = true;
            
            leftWall.position.x = 0;
            leftWall.position.y = 0;
            leftWall.position.z = 0;
            rigthWall.position.x = 0;
            rigthWall.position.y = 0;
            rigthWall.position.z = Wall.DEPTH + 20;
            */
            //AddWeaponToCameara
            BABYLON.SceneLoader.Append('./assets/', 'mp5.babylon', this.scene, function () {
                _this.scene.activeCamera = _this.camera;
                var mp5 = _this.scene.getMeshByName('MP5_Trip');
                mp5.parent = _this.camera;
                mp5.skeleton.enableBlending(0.1);
                mp5.scaling.set(0.1, 0.1, 0.1);
                mp5.position.x = 0.5;
                mp5.rotation.y = -Math.PI / 2;
                _this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnLeftPickTrigger, function (evt) {
                }));
            });
            //Create cube
            var height = 15;
            var width = 10;
            var size = 5;
            var diffuse = new BABYLON.Texture('./assets/diffuse.png', this.scene);
            var normal = new BABYLON.Texture('./assets/normal.png', this.scene);
            for (var i = 0; i < height; i++) {
                var offsetx = -(width / 2) * 5;
                for (var j = 0; j < width; j++) {
                    var cube = BABYLON.Mesh.CreateBox('cude', size, this.scene);
                    cube.position.x = offsetx;
                    cube.position.y = (5 * i) + size / 2;
                    var material = new BABYLON.StandardMaterial('cubemat', this.scene);
                    material.diffuseTexture = diffuse;
                    material.bumpTexture = normal;
                    cube.material = material;
                    this.setupCubePhysics(cube);
                    cube.checkCollisions = true;
                    offsetx += size;
                    cube.isPickable = true;
                }
            }
            var clickEvent = function (event) {
                switch (event.which) {
                    case 1:
                        shootWithWeapon();
                        break;
                    case 3:
                        aimWeapon(true);
                        break;
                }
            };
            var mouseUp = function (event) {
                switch (event.which) {
                    case 3:
                        aimWeapon(false);
                        break;
                }
            };
            var shootWithWeapon = function () {
                var width = _this.scene.getEngine().getRenderWidth();
                var height = _this.scene.getEngine().getRenderHeight();
                var pickInfo = _this.scene.pick(width / 2, height / 2);
                _this.createBullet(_this.scene, _this.camera, pickInfo.pickedPoint);
                if (pickInfo.hit) {
                    _this.impulseTarget(pickInfo.pickedMesh, pickInfo.pickedPoint);
                }
            };
            var aimWeapon = function (aim) {
                var weapon = _this.scene.getMeshByName('MP5_Trip');
                if (aim)
                    weapon.position.x -= 1;
                if (!aim)
                    weapon.position.x += 1;
            };
            canvas.onmousedown = clickEvent;
            canvas.onmouseup = mouseUp;
        }
        Main.prototype.setupActions = function (cube) {
            cube.actionManager = new BABYLON.ActionManager(this.scene);
            cube.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnLeftPickTrigger, function (evt) {
            }));
        };
        Main.prototype.setupCubePhysics = function (cube) {
            cube.physicsImpostor = new BABYLON.PhysicsImpostor(cube, BABYLON.PhysicsImpostor.BoxImpostor, {
                mass: 1
            });
        };
        Main.prototype.createBullet = function (scene, camera, pickedPoint) {
            //Bullet
            var bullet = BABYLON.Mesh.CreateCylinder("bulletBase" + this.bullets.toString(), 2, 1, 0, 24, 1, scene);
            var scaling = 0.5;
            bullet.position.x = camera.position.x;
            bullet.position.y = camera.position.y;
            bullet.position.z = camera.position.z;
            bullet.material = new BABYLON.StandardMaterial('yolo', scene);
            bullet.material.diffuseColor = new BABYLON.Color3(0.23, 0.26, 0.26);
            bullet.material.emissiveColor = new BABYLON.Color3(0.23, 0.26, 0.26);
            bullet.scaling = new BABYLON.Vector3(scaling, scaling, scaling);
            bullet.rotation.x = -Math.PI / 2;
            bullet.rotation.y = camera.rotation.y;
            bullet.physicsImpostor = new BABYLON.PhysicsImpostor(bullet, BABYLON.PhysicsImpostor.CylinderImpostor, {
                mass: 0.1
            });
            bullet.checkCollisions = true;
            this.bullets++;
            this.moveBullet(bullet, pickedPoint);
        };
        Main.prototype.moveBullet = function (base, pickedPoint) {
            base.applyImpulse(pickedPoint.subtract(base.position), base.position);
        };
        Main.prototype.impulseTarget = function (target, point) {
            var direction = target.position.subtract(this.scene.activeCamera.position);
            target.applyImpulse(direction, point);
        };
        /**
         * Runs the engine to render the scene into the canvas
         */
        Main.prototype.run = function () {
            var _this = this;
            this.engine.runRenderLoop(function () {
                _this.scene.render();
            });
        };
        return Main;
    }());
    BABYLON.Main = Main;
})(BABYLON || (BABYLON = {}));
var BABYLON;
(function (BABYLON) {
    var OceanMaterial = /** @class */ (function () {
        /**
         * Constructor
         * @param scene the scene where to add the material
         */
        function OceanMaterial(scene) {
            var _this = this;
            this.time = 0;
            this.material = new BABYLON.ShaderMaterial('ocean', scene, {
                vertexElement: './shaders/ocean',
                fragmentElement: './shaders/ocean',
            }, {
                attributes: ['position', 'uv'],
                uniforms: ['worldViewProjection', 'time'],
                samplers: ['diffuseSampler1', 'diffuseSampler2'],
                defines: [],
            });
            // Textures
            this.diffuseSampler1 = new BABYLON.Texture('./assets/ocean.png', scene);
            this.diffuseSampler2 = this.diffuseSampler1.clone(); // new Texture('./assets/diffuse.png', scene);
            // Bind
            this.material.onBind = function (mesh) {
                _this.time += scene.getEngine().getDeltaTime() * 0.003;
                _this.material.setFloat('time', _this.time);
                _this.material.setTexture('diffuseSampler1', _this.diffuseSampler1);
                _this.material.setTexture('diffuseSampler2', _this.diffuseSampler2);
            };
        }
        return OceanMaterial;
    }());
    BABYLON.OceanMaterial = OceanMaterial;
})(BABYLON || (BABYLON = {}));
var BABYLON;
(function (BABYLON) {
    var Wall = /** @class */ (function (_super) {
        __extends(Wall, _super);
        function Wall(name, scene) {
            var _this = _super.call(this, name, scene) || this;
            BABYLON.VertexData.CreateBox({ size: 5, width: Wall.WIDTH, height: Wall.HEIGHT, depth: Wall.DEPTH }).applyToMesh(_this);
            return _this;
        }
        Wall.WIDTH = 100;
        Wall.HEIGHT = 150;
        Wall.DEPTH = 50;
        return Wall;
    }(BABYLON.Mesh));
    BABYLON.Wall = Wall;
})(BABYLON || (BABYLON = {}));
var BABYLON;
(function (BABYLON) {
    var Weapon = /** @class */ (function (_super) {
        __extends(Weapon, _super);
        // Public members
        function Weapon(name, scene, camera) {
            var _this = _super.call(this, name, scene) || this;
            BABYLON.SceneLoader.Append('./assets/', 'mp5.babylon', scene, function () {
                scene.activeCamera = camera;
                var mp5 = scene.getMeshByName('MP5_Trip');
                mp5.parent = camera;
                mp5.skeleton.enableBlending(0.1);
                mp5.position.x = 1;
                mp5.rotation.y = -Math.PI / 2;
                mp5.checkCollisions = true;
            });
            return _this;
        }
        return Weapon;
    }(BABYLON.Mesh));
    BABYLON.Weapon = Weapon;
})(BABYLON || (BABYLON = {}));
//# sourceMappingURL=index.js.map