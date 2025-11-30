import * as THREE from 'three';
import GUI from 'lil-gui'; 
import { LinearTransformation } from './modules/LinearTransformation.js';
import { Determinant } from './modules/Determinant.js';
import { QuadraticForm } from './modules/QuadraticForm.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// 1. 基础场景设置
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// 2. 全局 UI
const gui = new GUI({ title: '高等代数可视化' });
const state = {
    mode: '线性变换 (Linear Transformation)' // 默认模式
};

// 3. 模块管理
const modules = {
    '线性变换 (Linear Transformation)': new LinearTransformation(scene, gui),
    '行列式与体积 (Determinant & Volume)': new Determinant(scene, gui),
    '二次型 (Quadratic Forms)': new QuadraticForm(scene, gui)
};

// 视频映射 (Bilibili BV1ys411472E 3Blue1Brown 线性代数本质)
const videoMap = {
    '线性变换 (Linear Transformation)': 4,  // P4: 矩阵与线性变换
    '行列式与体积 (Determinant & Volume)': 6, // P6: 行列式
    '二次型 (Quadratic Forms)': 14        // P14: 特征向量与特征值 (二次型核心)
};

let currentModule = null;

function switchMode(modeName) {
    // 禁用当前模块
    if (currentModule) {
        currentModule.disable();
    }
    
    // 启用新模块
    if (modules[modeName]) {
        currentModule = modules[modeName];
        currentModule.enable();
    }
}

// 初始化第一个模块
switchMode(state.mode);

// 添加模式切换菜单
gui.add(state, 'mode', Object.keys(modules)).name('选择主题').onChange(switchMode);

// 视频播放功能
const videoObj = {
    openVideo: () => {
        const page = videoMap[state.mode] || 1;
        const url = `//player.bilibili.com/player.html?bvid=BV1ys411472E&page=${page}&high_quality=1&danmaku=0`;
        
        // 创建 Overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        
        // 容器
        const container = document.createElement('div');
        container.style.width = '80%';
        container.style.height = '80%';
        container.style.position = 'relative';
        container.style.backgroundColor = '#000';
        
        // 关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '× 关闭视频';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '-40px';
        closeBtn.style.right = '0';
        closeBtn.style.padding = '10px 20px';
        closeBtn.style.fontSize = '18px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.background = '#fff';
        closeBtn.style.border = 'none';
        closeBtn.onclick = () => document.body.removeChild(overlay);
        
        // Iframe
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('scrolling', 'no');
        
        container.appendChild(closeBtn);
        container.appendChild(iframe);
        overlay.appendChild(container);
        document.body.appendChild(overlay);
    }
};

gui.add(videoObj, 'openVideo').name('🎥 观看讲解视频 (3Blue1Brown)');

// 4. 动画循环
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// 窗口大小调整
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
