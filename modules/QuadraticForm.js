import * as THREE from 'three';

export class QuadraticForm {
    constructor(scene, gui) {
        this.scene = scene;
        this.gui = gui;
        this.folder = null;
        this.group = new THREE.Group();
        
        // 方程: Ax^2 + By^2 + Cz^2 = R^2
        this.params = {
            A: 1,
            B: 1,
            C: 1,
            R: 2
        };
        
        this.init();
    }

    init() {
        // 使用 Marching Cubes 或者简单的参数化几何体
        // 这里为了简单和性能，我们使用参数化几何体 ParametricGeometry 的变体
        // 或者直接用 SphereGeometry 然后修改顶点
        
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        this.originalPositions = geometry.attributes.position.array.slice();
        
        const material = new THREE.MeshNormalMaterial({ 
            wireframe: false,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.group.add(this.mesh);

        // 坐标轴
        const axes = new THREE.AxesHelper(4);
        this.group.add(axes);
        
        this.update();
    }

    update() {
        // 目标方程: Ax^2 + By^2 + Cz^2 = R^2
        // 球坐标方程: x = r sinθ cosφ, y = r sinθ sinφ, z = r cosθ
        // 代入: A(r sinθ cosφ)^2 + B(r sinθ sinφ)^2 + C(r cosθ)^2 = R^2
        // r^2 [ A sin^2θ cos^2φ + B sin^2θ sin^2φ + C cos^2θ ] = R^2
        // r = R / sqrt(...)
        
        const { A, B, C, R } = this.params;
        const positions = this.mesh.geometry.attributes.position.array;
        
        // 我们基于原始球体（半径为1）的方向来计算新的半径
        // 原始球体点 (x0, y0, z0) 可以看作方向向量 (因为 r=1)
        // 实际上我们需要对每个点，保持其方向 (theta, phi) 不变，拉伸其长度 r
        
        for(let i=0; i<positions.length; i+=3) {
            const x0 = this.originalPositions[i];
            const y0 = this.originalPositions[i+1];
            const z0 = this.originalPositions[i+2];
            
            // 当前方向上的分母项: A*x0^2 + B*y0^2 + C*z0^2
            // 注意：这里 x0, y0, z0 是单位球上的点，所以 x0 = sinθ cosφ 等等
            let denom = A*x0*x0 + B*y0*y0 + C*z0*z0;
            
            // 处理双曲面情况 (denom < 0 或 denom = 0)
            // 如果 A, B, C 有负值，就可能出现双曲面
            
            if (denom > 0.001) {
                const scale = R / Math.sqrt(denom);
                positions[i] = x0 * scale;
                positions[i+1] = y0 * scale;
                positions[i+2] = z0 * scale;
            } else if (denom < -0.001) {
                // 虚轴方向，无法在实空间显示，或者需要特殊处理
                // 为了可视化效果，我们将其隐藏或压缩到原点
                 positions[i] = 0;
                 positions[i+1] = 0;
                 positions[i+2] = 0;
            } else {
                // 渐近线/锥面
                positions[i] = x0 * 100; // 射向无穷远
                positions[i+1] = y0 * 100;
                positions[i+2] = z0 * 100;
            }
        }
        
        this.mesh.geometry.attributes.position.needsUpdate = true;
        this.mesh.geometry.computeVertexNormals();
    }

    enable() {
        this.scene.add(this.group);
        this.folder = this.gui.addFolder('Quadratic Form (Ax² + By² + Cz² = R²)');
        
        const update = () => this.update();
        this.folder.add(this.params, 'A', -2, 5).onChange(update).name('Coeff A (x²)');
        this.folder.add(this.params, 'B', -2, 5).onChange(update).name('Coeff B (y²)');
        this.folder.add(this.params, 'C', -2, 5).onChange(update).name('Coeff C (z²)');
        this.folder.add(this.params, 'R', 0.1, 5).onChange(update).name('Radius R');
        
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
