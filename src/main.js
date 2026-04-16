import Phaser from "phaser";
import GameScene from "./scenes/GameScene.js";

/**
 * Phaser.Game(config) 是整个游戏的入口
 *
 * 类比前端：
 *   React: createRoot(document.getElementById('root')).render(<App />)
 *   Vue:   createApp(App).mount('#app')
 *   Phaser: new Phaser.Game(config)
 *
 * 区别在于：前端渲染到 DOM，Phaser 渲染到一个 <canvas> 元素
 * config 对象告诉 Phaser "游戏长什么样"
 */
const config = {
  /**
   * type: 渲染模式
   *  - Phaser.AUTO  → 自动选 WebGL（快）优先，不支持则降级到 Canvas（慢但兼容）
   *  - Phaser.WEBGL → 强制 WebGL
   *  - Phaser.CANVAS → 强制 Canvas
   *
   * 类比前端：类似于选择用 CSS transform（GPU加速）还是 top/left（CPU计算）
   */
  type: Phaser.AUTO, // 自动选择使用 WebGL 还是 Canvas
  width: 800,
  height: 600,
  backgroundColor: "#1a1a2e",
  /**
   * scale 配置 — 控制画布如何适配页面
   *
   * Phaser.Scale.FIT → 画布等比缩放，适应窗口大小（不变形）
   * Phaser.Scale.CENTER_BOTH → 画布在页面中居中
   *
   * 不加这个配置时，Phaser 可能生成一个比配置更大的画布，
   * 导致顶部内容被页面裁切
   */
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  /**
   * scene: 场景列表
   *
   * 类比前端：类似路由表 [{ path: '/', component: Home }, { path: '/game', component: Game }]
   *
   * Phaser 里场景的概念：
   *   - BootScene    → 启动场景（加载资源）
   *   - MenuScene    → 主菜单
   *   - GameScene    → 游戏主场景
   *   - GameOverScene → 结算场景
   *
   * 场景可以同时运行（比如 GameScene + HudScene 叠加）
   * 数组里第一个场景会自动启动
   */
  scene: [GameScene], // 注册场景（类比前端的路由表）
  // 物理引擎配置
  physics: {
    default: "arcade", // 使用Arcade物理引擎（轻量级，适合2D）
    arcade: {
      gravity: {y: 0}, // 俯视角游戏，不需要重力
      debug: false, // true → 显示碰撞框（绿色线框）（调试时很有用先关闭调试，后面需要在打开)
    },
  },
};

// 创建游戏实例，Phaser 会自动在 <body> 里插入一个 <canvas>
new Phaser.Game(config);
