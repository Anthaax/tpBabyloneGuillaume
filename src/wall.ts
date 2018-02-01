module BABYLON {
    export class Wall extends Mesh {
        static WIDTH : number = 100;
        static HEIGHT : number = 150;
        static DEPTH : number = 50;
        constructor(name: string, scene?: Nullable<Scene>)
        {
            super(name,scene);
            VertexData.CreateBox({size: 5, width: Wall.WIDTH, height: Wall.HEIGHT, depth: Wall.DEPTH}).applyToMesh(this);
        }   
    }
}