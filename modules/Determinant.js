import * as THREE from 'three';

export class Determinant {
    constructor(scene, gui) {
        this.scene = scene;
        this.gui = gui;
        this.folder = null;
        this.group = new THREE.Group();
        
        this.params = {
            v1x: 1, v1y: 0, v1z: 0,
            v2x: 0, v2y: 1, v2z: 0,
            v3x: 0, v3y: 0, v3z: 1,
            determinant: 1
        };
        
        this.init();
    }

    init() {
        // 创建三个向量箭头
        this.arrow1 = new THREE.ArrowHelper(new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), 1, 0xff0000);
        this.arrow2 = new THREE.ArrowHelper(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0), 1, 0x00ff00);
        this.arrow3 = new THREE.ArrowHelper(new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,0), 1, 0x0000ff);
        
        this.group.add(this.arrow1);
        this.group.add(this.arrow2);
        this.group.add(this.arrow3);

        // 创建平行六面体 (Parallelepiped)
        // 使用 LineSegments 绘制线框
        const geometry = new THREE.BufferGeometry();
        // 8个顶点，12条边
        // 动态更新顶点
        this.boxMesh = new THREE.Mesh(
            new THREE.BoxGeometry(1,1,1),
            new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.3 })
        );
        // 我们需要手动构建几何体来匹配倾斜的形状，BoxGeometry 不行
        // 使用自定义几何体
        this.parallelepipedGeom = new THREE.BufferGeometry();
        // 8个点，组成12个三角形面
        const vertices = new Float32Array(8 * 3); 
        this.parallelepipedGeom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        
        // 索引
        const indices = [
            0,1,2, 0,2,3, // bottom
            4,5,6, 4,6,7, // top
            0,1,5, 0,5,4, // front
            1,2,6, 1,6,5, // right
            2,3,7, 2,7,6, // back
            3,0,4, 3,4,7  // left
        ];
        this.parallelepipedGeom.setIndex(indices);
        
        this.volumeMesh = new THREE.Mesh(
            this.parallelepipedGeom,
            new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
        );
        
        // 线框
        this.wireframe = new THREE.LineSegments(
            new THREE.WireframeGeometry(this.parallelepipedGeom),
            new THREE.LineBasicMaterial({ color: 0xffffff })
        );

        this.group.add(this.volumeMesh);
        this.group.add(this.wireframe);
        
        this.update();
    }

    update() {
        const v1 = new THREE.Vector3(this.params.v1x, this.params.v1y, this.params.v1z);
        const v2 = new THREE.Vector3(this.params.v2x, this.params.v2y, this.params.v2z);
        const v3 = new THREE.Vector3(this.params.v3x, this.params.v3y, this.params.v3z);

        // 更新箭头
        this.arrow1.setDirection(v1.clone().normalize());
        this.arrow1.setLength(v1.length());
        this.arrow2.setDirection(v2.clone().normalize());
        this.arrow2.setLength(v2.length());
        this.arrow3.setDirection(v3.clone().normalize());
        this.arrow3.setLength(v3.length());

        // 计算行列式 (混合积) v1 . (v2 x v3)
        const det = v1.dot(v2.clone().cross(v3));
        this.params.determinant = det.toFixed(3);

        // 更新平行六面体顶点
        // P0 = (0,0,0)
        // P1 = v1
        // P2 = v1 + v2
        // P3 = v2
        // P4 = v3
        // P5 = v1 + v3
        // P6 = v1 + v2 + v3
        // P7 = v2 + v3
        
        const p0 = new THREE.Vector3(0,0,0);
        const p1 = v1.clone();
        const p2 = v1.clone().add(v2);
        const p3 = v2.clone();
        const p4 = v3.clone();
        const p5 = v1.clone().add(v3);
        const p6 = v1.clone().add(v2).add(v3);
        const p7 = v2.clone().add(v3);
        
        const positions = [
            p0, p1, p2, p3,
            p4, p5, p6, p7
        ];
        
        const attr = this.parallelepipedGeom.attributes.position;
        for(let i=0; i<8; i++) {
            attr.setXYZ(i, positions[i].x, positions[i].y, positions[i].z);
        }
        attr.needsUpdate = true;
        
        // 线框也需要更新
        this.group.remove(this.wireframe);
        this.wireframe = new THREE.LineSegments(
            new THREE.WireframeGeometry(this.parallelepipedGeom),
            new THREE.LineBasicMaterial({ color: 0xffffff })
        );
        this.group.add(this.wireframe);
    }

    enable() {
        this.scene.add(this.group);
        this.folder = this.gui.addFolder('Determinant & Volume');
        
        const update = () => this.update();
        
        const f1 = this.folder.addFolder('Vector 1 (Red)');
        f1.add(this.params, 'v1x', -2, 2).onChange(update);
        f1.add(this.params, 'v1y', -2, 2).onChange(update);
        f1.add(this.params, 'v1z', -2, 2).onChange(update);
        
        const f2 = this.folder.addFolder('Vector 2 (Green)');
        f2.add(this.params, 'v2x', -2, 2).onChange(update);
        f2.add(this.params, 'v2y', -2, 2).onChange(update);
        f2.add(this.params, 'v2z', -2, 2).onChange(update);

        const f3 = this.folder.addFolder('Vector 3 (Blue)');
        f3.add(this.params, 'v3x', -2, 2).onChange(update);
        f3.add(this.params, 'v3y', -2, 2).onChange(update);
        f3.add(this.params, 'v3z', -2, 2).onChange(update);
        
        this.folder.add(this.params, 'determinant').listen().name('Determinant (Vol)');
        
        this.folder.open();
    }

    disable() {
        this.scene.remove(this.group);
        if (this.folder) {
            this.folder.destroy();
            this.folder = null;
        }
    }
}
