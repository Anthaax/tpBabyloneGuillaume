module BABYLON {
    export class Main {
        // Public members
        public engine: Engine;
        public scene: Scene;

        public camera: FreeCamera;
        public light: PointLight;

        public ground: GroundMesh;
        public bullets: number;

        /**
         * Constructor
         */
        constructor () {
            var canvas =  document.getElementById('renderCanvas');
            this.engine = new Engine(<HTMLCanvasElement> document.getElementById('renderCanvas'));
            this.scene = new Scene(this.engine);
            this.scene.collisionsEnabled = true;
            this.bullets = 0;
            //Setup physics
            this.scene.enablePhysics(new Vector3(0, -9.81, 0), new CannonJSPlugin())
            
            this.camera = new FreeCamera('camera', new Vector3(35, 35, 35), this.scene);
            this.camera.setTarget(new Vector3(50,100,0));
            this.camera.attachControl(this.engine.getRenderingCanvas());
            this.camera.checkCollisions = true;
            this.camera.ellipsoid =  new Vector3(2,2,3);
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

            this.light = new PointLight('light', new Vector3(15, 15, 15), this.scene);

            // Ground and amterial
            this.ground = <GroundMesh> Mesh.CreateGround('ground', 512, 512, 32, this.scene);
            this.ground.checkCollisions = true; 
            this.ground.physicsImpostor = new PhysicsImpostor(this.ground, PhysicsImpostor.BoxImpostor,{
                mass: 0
            })

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
            SceneLoader.Append('./assets/', 'mp5.babylon', this.scene, () => {
                this.scene.activeCamera = this.camera;
            
                const mp5 = this.scene.getMeshByName('MP5_Trip');
                mp5.parent = this.camera;
                mp5.skeleton.enableBlending(0.1);
                mp5.scaling.set(0.1,0.1,0.1);
                mp5.position.x = 0.5;
                mp5.rotation.y = -Math.PI /2;
                this.scene.actionManager.registerAction(new ExecuteCodeAction(
                    ActionManager.OnLeftPickTrigger,
                    (evt) => {
                        
                    }));
            });

            //Create cube

            var height = 15;
            var width = 10;
            var size = 5

            const diffuse = new Texture('./assets/diffuse.png', this.scene);
            const normal = new Texture('./assets/normal.png', this.scene);
            for (var i = 0; i < height; i++) {
                var offsetx = -(width/2)*5;
                for (var j = 0; j < width; j++) {
                    const cube = Mesh.CreateBox('cude', size, this.scene);
                    cube.position.x = offsetx;
                    cube.position.y = (5*i) + size/2;

                    const material =new StandardMaterial('cubemat', this.scene);
                    material.diffuseTexture = diffuse;
                    material.bumpTexture = normal;
                                        
                    cube.material = material;

                    this.setupCubePhysics(cube);
                    cube.checkCollisions = true;
                    
                    offsetx += size;
                    cube.isPickable = true;
                }
            }

            


            var clickEvent = (event) =>{
                switch (event.which) {
                case 1:
                    shootWithWeapon();
                    break;
                case 3:
                    aimWeapon(true);
                    break;
                }
            }
            var mouseUp = (event) =>{
                switch (event.which) {
                case 3:
                    aimWeapon(false);
                    break;
                }
            }
            var shootWithWeapon = () => {
                var width = this.scene.getEngine().getRenderWidth();
                var height = this.scene.getEngine().getRenderHeight();
                var pickInfo = this.scene.pick(width / 2, height / 2);
                this.createBullet(this.scene, this.camera, pickInfo.pickedPoint);
                if (pickInfo.hit) {
                    this.impulseTarget(pickInfo.pickedMesh, pickInfo.pickedPoint);
                }
            }

            var aimWeapon = (aim : boolean) => {
                const weapon = this.scene.getMeshByName('MP5_Trip');
                if(aim) weapon.position.x -= 1;
                if(!aim) weapon.position.x += 1;

            }

            canvas.onmousedown = clickEvent;
            canvas.onmouseup = mouseUp;
        }

        public setupActions (cube: Mesh) : void {
            cube.actionManager = new ActionManager(this.scene); 
            cube.actionManager.registerAction(new ExecuteCodeAction(
                ActionManager.OnLeftPickTrigger,
                (evt) => {
                    
                }
            ))
        }

        public setupCubePhysics (cube: Mesh) : void{
            cube.physicsImpostor = new PhysicsImpostor(cube, PhysicsImpostor.BoxImpostor, {
                mass: 1
            })
        }

        public createBullet(scene : Scene, camera : TargetCamera, pickedPoint: Vector3){
            //Bullet

            const bullet = Mesh.CreateCylinder("bulletBase"+this.bullets.toString(),2,1,0,24,1, scene);
            var scaling = 0.5;

            bullet.position.x = camera.position.x;
            bullet.position.y = camera.position.y;
            bullet.position.z = camera.position.z;
            bullet.material = new StandardMaterial('yolo', scene);
            (<StandardMaterial>bullet.material).diffuseColor = new Color3(0.23, 0.26, 0.26);
            (<StandardMaterial>bullet.material).emissiveColor = new Color3(0.23, 0.26, 0.26);
            bullet.scaling = new Vector3(scaling,scaling,scaling);
            bullet.rotation.x = - Math.PI / 2;
            bullet.rotation.y = camera.rotation.y;
            bullet.physicsImpostor = new PhysicsImpostor(bullet, PhysicsImpostor.CylinderImpostor, {
                mass: 0.1
            });
            bullet.checkCollisions = true;
            this.bullets++;
            this.moveBullet(bullet, pickedPoint);
            
        }

        public moveBullet(base:Mesh, pickedPoint: Vector3) {
            base.applyImpulse(pickedPoint.subtract(base.position), base.position);               
        }
        
        public impulseTarget (target : AbstractMesh, point : Vector3)
        {
            const direction = target.position.subtract(this.scene.activeCamera.position);
            target.applyImpulse(direction, point);
        }
        /**
         * Runs the engine to render the scene into the canvas
         */
        public run () {
            this.engine.runRenderLoop(() => {
                this.scene.render();
            });
        }

        
    }
}
