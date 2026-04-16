import Phaser from "phaser";

/**
 * Phaser.Scene 是所有场景的基类
 *
 * 类比前端：
 *   React: class MyComponent extends React.Component
 *   Vue:   export default { ... } （选项式）
 *   Phaser: class MyScene extends Phaser.Scene
 *
 * 场景的生命周期（最常用的3个方法）：
 *   init()     → 场景启动时最先调用，接收外部传入的数据（类似 props）
 *   create()   → 场景初始化，创建所有游戏对象（类似 mounted）
 *   update()   → 每帧调用，写游戏逻辑（类似 requestAnimationFrame 循环）
 *
 * 另外还有 preload() — 在 create 之前加载资源（图片、音效等）
 */

export default class GameScene extends Phaser.Scene {
  ENEMY_SPEED = 80;
  BULLET_SPEED = 500; // 子弹飞行速度
  FIRE_RATE = 300; // 射击间隔（毫秒），300ms = 每秒约3发
  PLAYER_MAX_HP = 50; // 玩家最大血量

  /**
   * constructor 里调用 super({ key: 'xxx' })
   * key 是场景的唯一标识符，用于在其他地方切换到这个场景：
   *   this.scene.start('GameScene')  → 跳转到这个场景
   *   this.scene.pause('GameScene')  → 暂停这个场景
   */
  constructor() {
    super({key: "GameScene"});
  }
  /**
   * create() — 场景初始化，只在进入场景时调用一次
   *
   * 这里做所有"准备工作"：
   *   创建游戏对象（玩家、敌人、子弹）
   *   设置输入监听
   *   初始化分数、计时器等状态
   *
   * 类比前端：useEffect(() => { // 初始化... }, [])  的依赖为空数组版
   */
  // 这里做初始化：创建玩家、敌人、UI
  create() {
    /**
     * this.add.rectangle(x, y, width, height, color)
     *
     * this.add 是 Phaser 的"游戏对象工厂"（GameObjectFactory）
     * 它能创建各种对象并自动添加到场景的显示列表中
     *
     * 参数说明：
     *   x, y    → 中心点坐标（注意！不是左上角，是中心点）
     *   width   → 宽度（像素）
     *   height  → 高度（像素）
     *   color   → 颜色，16进制数字格式 0xRRGGBB（注意不是字符串）
     *             0x00ff00 = 绿色, 0xff0000 = 红色, 0x0000ff = 蓝色
     *
     * 返回值：Phaser.GameObjects.Rectangle 对象
     *
     * 其他常用的 this.add 方法：
     *   this.add.image(x, y, 'textureKey')    → 图片
     *   this.add.sprite(x, y, 'textureKey')   → 精灵（可做动画）
     *   this.add.text(x, y, '内容', {样式})    → 文字
     *   this.add.circle(x, y, radius, color)  → 圆形
     */
    this.player = this.add.rectangle(400, 300, 32, 32, 0x00f00);

    /**
     * this.physics.add.existing(gameObject)
     *
     * 给一个显示对象"注入物理能力"。
     * 调用后，gameObject 多了一个 .body 属性（Phaser.Physics.Arcade.Body）
     *
     * 前后区别：
     *   调用前：this.player 只是一个图形，只能设置位置 x/y
     *   调用后：this.player.body 拥有了速度、加速度、碰撞检测等物理属性
     *
     * .body 的常用方法：
     *   body.setVelocity(x, y)     → 设置速度（像素/秒）
     *   body.setVelocityX(speed)   → 只设置水平速度
     *   body.setVelocityY(speed)   → 只设置垂直速度
     *   body.setBounce(0.5)        → 碰撞后弹开程度（0=不弹，1=完全弹）
     *   body.setCollideWorldBounds(true) → 不允许移出画布边界
     *   body.setImmovable(true)    → 设为不可推动（被撞了也不会动）
     */
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    /**
     * this.input.keyboard.createCursorKeys()
     *
     * 创建一个"光标键"对象，监听上/下/左/右四个方向键
     *
     * 返回值结构：
     *   cursors.up    → { isDown: bool, isUp: bool, timeDown: number, ... }
     *   cursors.down
     *   cursors.left
     *   cursors.right
     *
     * 用法：cursors.left.isDown → 左键是否正在被按住
     *
     * 其他获取输入的方式：
     *   this.input.keyboard.addKey('W')        → 监听单个键
     *   this.input.keyboard.addKeys('W,A,S,D')  → 监听多个键
     *   this.input.activePointer                → 鼠标/触摸位置
     */
    this.wasd = this.input.keyboard.addKeys("W,A,S,D");
    this.cursors = this.input.keyboard.createCursorKeys();

    /**
     * this.add.text(x, y, content, style)
     *
     * 在场景中显示文字
     * 参数：
     *   x, y     → 左上角坐标（text 默认以左上角为锚点，和 rectangle 不同）
     *   content  → 文字内容
     *   style    → 样式对象，常用属性：
     *     fontSize: '16px'     字体大小
     *     color: '#fff'        文字颜色（这里是 CSS 颜色字符串）
     *     fontFamily: 'Arial'  字体
     *     backgroundColor: '#000'  背景色
     *     padding: { x: 5, y: 3 } 内边距
     *
     * 返回值：Phaser.GameObjects.Text 对象
     * 常用方法：
     *   text.setText('新内容')   → 更新文字
     *   text.setStyle({color:'#f00'}) → 更新样式
     */
    // 显示文字
    this.add.text(10, 10, "蛋壳特工队", {
      fontSize: "17px",
      color: "#fff",
      padding: {y: 5},
    });

    /**
     * ==================== 敌人系统 ====================
     */

    /**
     * this.physics.add.group()
     *
     * 创建一个"物理组"——专门管理同类游戏对象的容器
     *
     * 类比前端：
     *   前端: 你用一个数组存数据，手动 map 渲染
     *   Phaser: Group 自动管理所有成员的显示、更新、碰撞
     *
     * Group 的好处：
     *   1. 批量操作：enemies.getChildren() 拿到所有成员
     *   2. 碰撞检测：一行代码让"所有敌人"和"玩家"检测碰撞
     *   3. 对象池（后续）：复用已销毁的对象，提升性能
     *
     * 常用方法：
     *   group.add(gameObject)           → 添加成员
     *   group.remove(gameObject, true)  → 移除并销毁
     *   group.getChildren()             → 获取所有成员数组
     *   group.countActive()             → 存活的成员数量
     */
    this.enemies = this.physics.add.group();

    /**
     * this.time.addEvent({ delay, callback, loop })
     *
     * Phaser 的定时器，类似 setInterval，但跟游戏时钟绑定
     *
     * 参数：
     *   delay    → 间隔时间（毫秒）
     *   callback → 到时间后执行的函数
     *   loop     → 是否重复（false = 只执行一次）
     *
     * 类比前端：
     *   setInterval(spawnEnemy, 2000)    ← 不受游戏暂停影响
     *   this.time.addEvent({...})        ← 游戏暂停时也暂停
     *
     * 其他用法：
     *   this.time.delayedCall(1000, fn)  → 延迟执行一次（类似 setTimeout）
     */
    this.time.addEvent({
      delay: 200, // 每1000ms（1秒）生成一个敌人
      callback: this.spawnEnemy, // 调用的方法
      callbackScope: this, // this 指向当前场景（不加这个 this 会丢失）
      loop: true, // 持续循环
    });

    /**
     * ==================== 子弹系统 ====================
     */

    /**
     * this.physics.add.group(config)
     *
     * 带配置创建物理组。这里的关键配置：
     *   runChildUpdate: true → 自动调用每个子对象的 update 方法
     *                       （后续如果子弹是自定义类就需要，现在先用不到）
     *
     * 对象池工作原理：
     *   bullets.get(x, y)  → 从池中取出一个可用对象
     *     如果池里有"已回收"的对象 → 直接复用（不创建新的）
     *     如果池是空的 → 创建一个新的
     *   子弹飞出屏幕后 → setActive(false) 回收到池里
     *
     * 类比前端：
     *   不用池：每次渲染列表都 new 组件 → 慢
     *   用池：保持组件实例，只更新数据（类似 React 的 reconciliation）
     */
    this.bullets = this.physics.add.group();
    /**
     * 记录上次射击时间，用于控制射击频率
     * 不用定时器而用手动计时，因为射击频率可能被技能改变
     */
    this.lastFireTime = 0;

    /**
     * ==================== 碰撞检测 ====================
     */

    /**
     * this.physics.add.overlap(对象A, 对象B, 回调)
     *
     * 检测两组对象是否"重叠"（穿过彼此，不产生物理弹开）
     * 每帧自动检测，有重叠时调用 callback
     *
     * 参数：
     *   对象A   → 可以是单个对象或 Group
     *   对象B   → 可以是单个对象或 Group
     *   callback → 碰到时调用的函数 (objectA, objectB)
     *
     * 为什么用 overlap 而不是 collider？
     *   collider → 碰到后互相弹开（子弹打到敌人不应该弹开）
     *   overlap  → 只是检测碰到，不产生物理效果
     *
     * 类比前端：
     *   前端: element.addEventListener('click', (e) => { ... })
     *   游戏: this.physics.add.overlap(A, B, (a, b) => { ... })
     *   区别：前端等用户操作，游戏每帧自动检测
     */
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    /**
     * 敌人碰到玩家的检测
     *
     * 这里用 collider 而不是 overlap，因为我们要敌人"被弹开"一点
     * 这样敌人不会一直贴在玩家身上
     */

    this.physics.add.collider(this.player, this.enemies, this.enemyHitPlayer, null, this);

    /**
     * ==================== 玩家状态 ====================
     */

    this.playerHp = this.PLAYER_MAX_HP;

    /**
     * HP 显示文字
     * 注意 setOrigin(0, 0) — 设置锚点为左上角
     * 默认 text 的锚点是 (0, 0)（左上角），但 rectangle 是 (0.5, 0.5)（中心）
     * setOrigin 可以统一它们的行为
     */

    this.hpText = this.add.text(10, 35, `HP: ${this.playerHp}`, {
      fontSize: "17px",
      color: "#fff",
    });
  }

  /**
   * spawnEnemy() — 生成一个敌人
   *
   * 在屏幕边缘随机位置生成，然后自动朝玩家移动
   */
  spawnEnemy() {
    /**
     * Phaser.Math.Between(min, max)
     * 返回 [min, max] 之间的随机整数，类似 Math.floor(Math.random() * (max - min + 1)) + min
     */
    const side = Phaser.Math.Between(0, 3); //0（上）， 1=（下），2（左），3（右）
    let x, y;

    // 小兵出现位置
    switch (side) {
      case 0: {
        x = Phaser.Math.Between(0, 800);
        y = -30;
        break;
      }
      case 1: {
        x = Phaser.Math.Between(0, 800);
        y = 630;
        break;
      }
      case 2: {
        x = -30;
        y = Phaser.Math.Between(0, 600);
        break;
      }
      case 3: {
        x = 830;
        y = Phaser.Math.Between(0, 600);
        break;
      }
    }

    const enemy = this.add.rectangle(x, y, 24, 24, 0xff0000);
    this.enemies.add(enemy); // 加入物理组

    /**
     * this.physics.moveToObject(source, target, speed)
     *
     * 让 source 以 speed 的速度朝 target 的当前位置移动
     * 注意：这个方法只在调用时计算一次方向，之后是直线运动
     * 如果玩家移动了，敌人不会自动转向（需要每帧重新调用）
     *
     * 参数：
     *   source → 移动的对象（敌人）
     *   target → 目标对象（玩家）
     *   speed  → 移动速度（像素/秒）
     *
     * 返回值：移动的角度（弧度）
     */
    this.physics.moveToObject(enemy, this.player, 80);

    // 设置敌人不会被玩家推动
    enemy.body.setImmovable(true);
  }

  /**
   * fireBullet() — 自动射击
   *
   * 找到最近的敌人，朝它发射一颗子弹
   */
  fireBullet() {
    // 没有敌人就不射击
    if (this.enemies.countActive() === 0) return;

    /**
     * this.physics.closest(source, targets)
     *
     * 从 targets 中找到离 source 最近的一个
     * 返回：最近的游戏对象，或 null（如果 targets 为空）
     */
    const closestEnemy = this.physics.closest(this.player, this.enemies.getChildren());

    if (!closestEnemy) return;

    /**
     * this.bullets.get(x, y)
     *
     * 从子弹组的对象池中取出一个
     * 如果池里有回收的子弹 → 复用（性能好）
     * 如果池是空的 → 创建新的 rectangle
     *
     * 但 get() 默认只创建一个空的 GameObject，不带图形
     * 所以这里我们手动创建再添加到组
     */
    const bullet = this.add.rectangle(this.player.x, this.player.y, 8, 8, 0xffff00);
    this.bullets.add(bullet);

    /**
     * this.physics.moveToObject(source, target, speed)
     * 和敌人追踪玩家用的一样的方法，只是这次是子弹朝敌人飞
     */
    this.physics.moveToObject(bullet, closestEnemy, this.BULLET_SPEED);

    /**
     * 给子弹挂一个"超时销毁"
     * 子弹飞了 2 秒还没命中 → 销毁（防止飞出屏幕的子弹永远存在）
     *
     * Phaser 有自动销毁的配置，但这里手动控制更容易理解
     */
    this.time.delayedCall(2000, () => {
      if (bullet.active) {
        bullet.destroy();
      }
    });
  }

  /**
   * hitEnemy(bullet, enemy) — 子弹命中敌人
   *
   * 这是 overlap 回调，参数顺序和注册时一致：
   *   overlap(bullets, enemies, callback) → callback(bullet, enemy)
   */
  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.destroy();
    enemy.destroy();
  }

  /**
   * enemyHitPlayer(player, enemy) — 敌人碰到玩家
   *
   * collider 回调，参数顺序也和注册时一致：
   *   collider(player, enemies, callback) → callback(player, enemy)
   */
  enemyHitPlayer(player, enemy) {
    this.playerHp--;

    // 更新 HP 显示
    this.hpText.setText(`HP: ${this.playerHp}`);
    if (this.playerHp <= 0) {
      this.physics.pause();
      this.add
        .text(400, 280, "游戏结束", {
          fontSize: "48px",
          color: "#ff0000",
          padding: {x: 0, y: 5},
        })
        .setOrigin(0.5);
    }
  }

  /**
   * update(time, delta) — 每帧调用，游戏的核心循环
   *
   * 参数：
   *   time  → 游戏启动以来的总时间（毫秒）
   *   delta → 上一帧到这帧的时间差（毫秒）
   *           60fps 时 delta ≈ 16.67ms
   *           30fps 时 delta ≈ 33.33ms
   *
   * 为什么需要 delta？
   *   如果速度是 200px/s：
   *     60fps: 每帧移动 200 * 0.0167 ≈ 3.3px
   *     30fps: 每帧移动 200 * 0.0333 ≈ 6.6px
   *   不管帧率多少，每秒移动的总距离都是 200px
   *   → 这叫"帧率无关移动"
   *
   * 注意：Phaser Arcade 物理的 setVelocity 已经自动处理了 delta
   *       所以你只需要设一个速度值，不用自己乘 delta
   */
  update(time, delta) {
    const speed = 300; // 像素/秒
    const body = this.player.body;

    /**
     * body.setVelocity(0) — 每帧开始先归零
     *
     * 这是游戏开发中的常见模式：
     *   前端思维：事件驱动，按一次键触发一次
     *   游戏思维：每帧检查当前状态，重新计算
     *
     * 为什么每帧归零？
     *   因为 setVelocity 设的是"持续速度"（不是"一次性的力"）
     *   如果上一帧设了 velocityX = 300，下一帧不按键了，
     *   角色还会继续往右飘（速度没有被清除）
     *   所以每帧先归零，再根据当前按键状态设置新速度
     */
    body.setVelocity(0);

    /**
     * 对角移动的速度问题（进阶知识点，先了解即可）：
     *
     * 如果同时按右+下：
     *   velocityX = 300, velocityY = 300
     *   实际速度 = √(300² + 300²) = 424 → 比单方向快了 41%！
     *
     * 解决方案（后续会用到）：
     *   body.setVelocity(vx, vy) 后调用 body.velocity.normalize().scale(speed)
     *   或者用 this.physics.velocityFromRotation(angle, speed, body.velocity)
     */

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      body.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      body.setVelocityY(speed);
    }

    /**
     * 敌人追踪玩家
     *
     * moveToObject 只在调用时算一次方向。
     * 如果玩家在移动，敌人会朝"玩家旧位置"走，而不是"追着跑"。
     * 所以每帧都重新调用，让敌人持续追踪玩家当前位置。
     *
     * 类比前端：
     *   前端: 你设了 CSS transition，浏览器自动处理中间帧
     *   游戏: 你每帧手动更新方向，才有"追踪"的效果
     */
    this.enemies.getChildren().forEach((enemy) => {
      this.physics.moveToObject(enemy, this.player, 80);
    });

    /**
     * 自动射击
     *
     * 用 time（游戏总时间）和 lastFireTime（上次射击时间）的差来控制频率
     *
     * 为什么不用 time.addEvent？
     *   因为射击频率后续会被技能改变（比如"攻速+50%"）
     *   用时间差比定时器更灵活，随时改 FIRE_RATE 就行
     */
    if (time > this.lastFireTime + this.FIRE_RATE) {
      this.fireBullet();
      this.lastFireTime = time;
    }
  }
}
