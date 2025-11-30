import * as THREE from 'three';

export class LinearTransformation {
    constructor(scene, gui) {
        this.scene = scene;
        this.gui = gui;
        this.folder = null;
        this.group = new THREE.Group();
        
        // 矩阵参数
        this.params = {
            m11: 1, m12: 0,
            m21: 0, m22: 1
        };
        
        this.init();
    }

    init() {
        // 创建一个网格点阵
        const geometry = new THREE.BufferGeometry();
        const points = [];
        const colors = [];
        const size = 20; // 网格范围
        const step = 0.5; // 密度

        for (let x = -size; x <= size; x += step) {
            for (let y = -size; y <= size; y += step) {
                points.push(x, y, 0);
                
                // 颜色渐变
                const r = (x + size) / (2 * size);
                const g = (y + size) / (2 * size);
                colors.push(r, g, 0.5);
            }
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        // 保存原始位置用于变换
        this.originalPositions = points.slice();

        const material = new THREE.PointsMaterial({ 
            size: 0.1, 
            vertexColors: true 
        });
        
        this.pointsMesh = new THREE.Points(geometry, material);
        this.group.add(this.pointsMesh);

        // 添加坐标轴
        const axesHelper = new THREE.AxesHelper(5);
        this.group.add(axesHelper);

        // 添加一个单位正方形 (红色)
        const squareGeom = new THREE.BufferGeometry();
        const squareVertices = new Float32Array([
            0,0,0, 1,0,0, 1,1,0, 0,1,0, 0,0,0
        ]);
        squareGeom.setAttribute('position', new THREE.BufferAttribute(squareVertices, 3));
        this.squareLine = new THREE.Line(squareGeom, new THREE.LineBasicMaterial({ color: 0xff0000 }));
        this.originalSquarePositions = Array.from(squareVertices);
        this.group.add(this.squareLine);
    }

    update() {
        const { m11, m12, m21, m22 } = this.params;
        
        // 更新点阵
        const positions = this.pointsMesh.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = this.originalPositions[i];
            const y = this.originalPositions[i + 1];
            
            // 应用矩阵变换 [x'] = [m11 m12] [x]
            //              [y']   [m21 m22] [y]
            positions[i] = m11 * x + m12 * y;
            positions[i+1] = m21 * x + m22 * y;
        }
        this.pointsMesh.geometry.attributes.position.needsUpdate = true;

        // 更新单位正方形
        const sqPos = this.squareLine.geometry.attributes.position.array;
        for (let i = 0; i < sqPos.length; i += 3) {
            const x = this.originalSquarePositions[i];
            const y = this.originalSquarePositions[i+1];
            sqPos[i] = m11 * x + m12 * y;
            sqPos[i+1] = m21 * x + m22 * y;
        }
        this.squareLine.geometry.attributes.position.needsUpdate = true;
    }

    enable() {
        this.scene.add(this.group);
        this.folder = this.gui.addFolder('Linear Transformation (2D)');
        
        const update = () => this.update();
        this.folder.add(this.params, 'm11', -2, 2).onChange(update).name('i_x (Basis i x)');
        this.folder.add(this.params, 'm21', -2, 2).onChange(update).name('i_y (Basis i y)');
        this.folder.add(this.params, 'm12', -2, 2).onChange(update).name('j_x (Basis j x)');
        this.folder.add(this.params, 'm22', -2, 2).onChange(update).name('j_y (Basis j y)');
        
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
