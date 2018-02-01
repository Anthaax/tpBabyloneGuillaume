/// <reference types="babylonjs" />
declare var Game: (canvasId: any) => void;
declare module BABYLON {
    class Main {
        engine: Engine;
        scene: Scene;
        camera: FreeCamera;
        light: PointLight;
        ground: GroundMesh;
        bullets: number;
        /**
         * Constructor
         */
        constructor();
        setupActions(cube: Mesh): void;
        setupCubePhysics(cube: Mesh): void;
        createBullet(scene: Scene, camera: TargetCamera, pickedPoint: Vector3): void;
        moveBullet(base: Mesh, pickedPoint: Vector3): void;
        impulseTarget(target: AbstractMesh, point: Vector3): void;
        /**
         * Runs the engine to render the scene into the canvas
         */
        run(): void;
    }
}
declare module BABYLON {
    class OceanMaterial {
        material: ShaderMaterial;
        diffuseSampler1: Texture;
        diffuseSampler2: Texture;
        time: number;
        /**
         * Constructor
         * @param scene the scene where to add the material
         */
        constructor(scene: Scene);
    }
}
declare module BABYLON {
    class Wall extends Mesh {
        static WIDTH: number;
        static HEIGHT: number;
        static DEPTH: number;
        constructor(name: string, scene?: Nullable<Scene>);
    }
}
declare module BABYLON {
    class Weapon extends Mesh {
        constructor(name: string, scene: Scene, camera: Camera);
    }
}
