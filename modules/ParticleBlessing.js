import * as THREE from 'three';

export class ParticleBlessing {
    constructor(scene, gui) {
        this.scene = scene;
        this.gui = gui;
        this.folder = null;
        this.group = new THREE.Group();
        this.particles = null;
        this.clock = new THREE.Clock();
        
        this.params = {
            text: "祝姐姐\n永远十八岁\n天天开心",
            size: 0.05,
            color: 0xff69b4, // HotPink
            particleCount: 0, // Display only
            explode: () => this.explodeAnimation(),
            reset: () => this.createParticles()
        };

        this.material = new THREE.PointsMaterial({
            size: this.params.size,
            color: this.params.color,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
    }

    init() {
        this.createParticles();
    }

    createParticles() {
        if (this.particles) {
            this.group.remove(this.particles);
            this.particles.geometry.dispose();
        }

        const shapes = this.getPointsFromText(this.params.text);
        const geometry = new THREE.BufferGeometry();
        
        const positions = [];
        const targetPositions = [];
        const randoms = [];

        shapes.forEach(point => {
            // 目标位置 (居中处理)
            const x = (point.x - 50) * 0.1; 
            const y = -(point.y - 50) * 0.1;
            const z = 0;

            // 初始位置 (随机散布)
            const rx = (Math.random() - 0.5) * 50;
            const ry = (Math.random() - 0.5) * 50;
            const rz = (Math.random() - 0.5) * 50;

            positions.push(rx, ry, rz); // 当前位置
            targetPositions.push(x, y, z); // 目标位置
            randoms.push(Math.random()); // 用于动画相位的随机值
        });

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('targetPosition', new THREE.Float32BufferAttribute(targetPositions, 3));
        geometry.setAttribute('aRandom', new THREE.Float32BufferAttribute(randoms, 1));

        this.particles = new THREE.Points(geometry, this.material);
        this.group.add(this.particles);
        
        this.params.particleCount = shapes.length;
        this.animationTime = 0;
        this.isExploding = false;
    }

    getPointsFromText(text) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = 200; // Canvas resolution (affects density)
        const height = 200;
        canvas.width = width;
        canvas.height = height;

        // 绘制背景和文字
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        
        ctx.font = 'bold 24px "Microsoft YaHei", Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const lines = text.split('\n');
        const lineHeight = 30;
        const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, index) => {
            ctx.fillText(line, width / 2, startY + index * lineHeight);
        });

        // 获取像素数据
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const points = [];

        // 采样间隔 (越小粒子越多)
        const step = 1; 

        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                const index = (y * width + x) * 4;
                // 检查红色通道 (因为是白字黑底)
                if (data[index] > 128) { 
                    points.push({ x, y });
                }
            }
        }
        return points;
    }

    update() {
        if (!this.particles) return;

        const dt = this.clock.getDelta();
        this.animationTime += dt;

        const positions = this.particles.geometry.attributes.position.array;
        const targets = this.particles.geometry.attributes.targetPosition.array;
        const randoms = this.particles.geometry.attributes.aRandom.array;

        // 简单的聚合动画：从随机位置飞向目标位置
        // 使用 easeOutCubic 缓动
        const duration = 3.0;
        let progress = Math.min(this.animationTime / duration, 1);
        progress = 1 - Math.pow(1 - progress, 3); // Ease out

        if (this.isExploding) {
            // 爆炸模式：向外扩散并添加噪点
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += (Math.random() - 0.5) * 0.2;
                positions[i+1] += (Math.random() - 0.5) * 0.2;
                positions[i+2] += (Math.random() - 0.5) * 0.2;
            }
        } else {
            // 聚合模式
            for (let i = 0; i < positions.length; i += 3) {
                const tx = targets[i];
                const ty = targets[i+1];
                const tz = targets[i+2];

                // 添加一点正弦波动的漂浮感
                const floatSpeed = 1.0;
                const floatAmp = 0.05;
                const floatOffset = Math.sin(this.animationTime * floatSpeed + randoms[i/3] * 10) * floatAmp;

                // 线性插值 + 漂浮
                // 注意：为了能重置动画，我们这里做一个简单的 LERP 模拟
                // 实际上最好保存初始位置，但这里直接不断逼近目标位置也可以
                
                // 更好的做法：重新计算当前应在的位置
                // 由于我们没有保存初始位置数组（为了省内存），这里我们假设动画开始时很远，
                // 我们可以反向操作：如果是重置，直接重新生成 geometry。
                // 这里我们假设 positions 已经被初始化为随机值，现在慢慢趋向 target
                
                const lerpFactor = 0.05; // 每一帧逼近 5%
                
                positions[i] += (tx - positions[i]) * lerpFactor;
                positions[i+1] += (ty - positions[i+1]) * lerpFactor + floatOffset * 0.1; // Y轴添加漂浮
                positions[i+2] += (tz - positions[i+2]) * lerpFactor;
            }
        }

        this.particles.geometry.attributes.position.needsUpdate = true;
        
        // 颜色循环 (彩虹特效)
        const time = Date.now() * 0.001;
        const h = (time % 10) / 10;
        this.material.color.setHSL(h, 0.8, 0.6);
    }

    explodeAnimation() {
        this.isExploding = true;
        setTimeout(() => {
            this.isExploding = false;
            this.createParticles(); // 重置回来
        }, 1000);
    }

    enable() {
        this.scene.add(this.group);
        this.init(); // 重新初始化以触发动画
        
        this.folder = this.gui.addFolder('❤️ 姐姐专属祝福 ❤️');
        this.folder.add(this.params, 'text').name('祝福语').onFinishChange(() => this.createParticles());
        this.folder.add(this.params, 'size', 0.01, 0.2).name('粒子大小').onChange(v => this.material.size = v);
        this.folder.add(this.params, 'explode').name('💥 庆祝时刻');
        this.folder.add(this.params, 'reset').name('🔄 重新播放');
        this.folder.add(this.params, 'particleCount').name('粒子数量').disable();
        
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
