// Battle.js - Thực thi chiến đấu

import { MapService } from './Map.js';
import { PlayerService } from './Player.js';
import { Monster } from './Monster.js';

export class BattleService {
    constructor(app, playerService) {
        this.app = app;
        this.battleContainer = new PIXI.Container();
        this.isActive = false;
        this.playerService = playerService;

        // Khởi tạo playerMonster 1 lần
        this.playerMonster = null;
        this.initPlayerMonster();
    }

    async initPlayerMonster() {
        const baseTexturePlayer = await PIXI.Assets.load('./Player_Pokemon/embySprite.png');
        const sourceTexturePlayer = baseTexturePlayer.baseTexture;

        this.playerMonster = new Monster({
            name: 'Emby',
            hp: 100,
            attack: 20,
            spriteSheet: sourceTexturePlayer,
            imageSize: { width: 344, height: 89 },
            numFrames: 4,
            position: { x: 0, y: 0 } // Sẽ gán lại mỗi trận
        });

        this.playerMonster.sprite.scale.set(1.2);
    }

    async startBattle() {
        this.isActive = true; // ✅ Đánh dấu đang battle
        document.getElementById('endBattleButton').style.display = 'block';
        // this.app.stage.removeChildren(); // 💥 Xóa toàn bộ lớp cũ

        console.log('Chuyển sang màn hình chiến đấu (overlay)');

        this.currentTurn = 'player'; // hoặc 'enemy'
        this.turnLocked = false;     // khoá nút khi chưa tới lượt

        const dimOverlay = new PIXI.Graphics();
        dimOverlay.beginFill(0x000000, 0.5);
        dimOverlay.drawRect(0, 0, this.app.canvas.width, this.app.canvas.height);
        dimOverlay.endFill();

        const battleScene = new PIXI.Container();

        // Load ảnh battle từ thư mục Images
        const battleTexture = await PIXI.Assets.load({
            src: './Player_Pokemon/battleBackground.png',
            data: { resourceOptions: { autoLoad: true } }
        });

        const battleBackground = new PIXI.Sprite(battleTexture);
        battleBackground.width = 580;
        battleBackground.height = 420;
        battleBackground.anchor.set(0.5);
        battleBackground.x = this.app.canvas.width / 2;
        battleBackground.y = this.app.canvas.height / 2;

        battleScene.addChild(dimOverlay);
        battleScene.addChild(battleBackground);

        this.battleOverlay = battleScene;
        this.app.stage.addChild(battleScene);

        this.playerMonster.sprite.position.set(
            this.app.canvas.width / 3 + 60,
            this.app.canvas.height / 2 + 40
        );
        battleScene.addChild(this.playerMonster.sprite);

        const baseTextureEnemy = await PIXI.Assets.load('./Player_Pokemon/draggleSprite.png');
        const sourceTextureEnemy = baseTextureEnemy.baseTexture;

        this.enemyMonster = new Monster({
            name: 'Draggle',
            hp: 100,
            attack: 20,
            spriteSheet: sourceTextureEnemy,
            imageSize: { width: 344, height: 89 },
            numFrames: 4,
            position: { x: this.app.canvas.width / 2 + 185, y: this.app.canvas.height / 4 + 40 }
        });
        this.enemyMonster.sprite.scale.set(0.7);
        
        battleScene.addChild(this.enemyMonster.sprite);

        // console.log('📦 spriteSheet type:', spriteSheet.constructor.name);

        console.log('👉 Final sprite dimensions:', this.playerMonster.sprite.width, this.playerMonster.sprite.height);


        // this.battleOverlay = battleScene;
        // this.app.stage.addChild(battleScene);

        this.addBattleControls();
        
    }

    addBattleControls() {
        const container = document.createElement('div');
        container.id = 'battleControls';
        container.style.position = 'absolute';
        container.style.bottom = '100px';
        container.style.right = '40px';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '12px';
        container.style.zIndex = 20;

        // ====== Attack Button ======
        const attackBtn = document.createElement('button');
        attackBtn.innerText = 'Attack';
        attackBtn.style.padding = '12px 20px';
        attackBtn.style.fontSize = '16px';
        attackBtn.style.backgroundColor = '#3399ff';
        attackBtn.style.color = 'white';
        attackBtn.style.border = 'none';
        attackBtn.style.borderRadius = '8px';
        attackBtn.style.cursor = 'pointer';

        attackBtn.onclick = async () => {
            if (!this.enemyMonster || this.turnLocked || this.currentTurn !== 'player') return;

            this.turnLocked = true; // ❌ Khoá thao tác

            await this.playAttackEffect();

            this.enemyMonster.hp -= this.playerMonster.attack;
            console.log(`💥 Enemy HP: ${this.enemyMonster.hp}`);

            if (this.enemyMonster.hp <= 0) {
                await this.showVictoryBanner();
                this.endBattle(); 
                return;
            }

            // ✅ Gọi enemy phản đòn sau delay
            setTimeout(() => {
                this.enemyAttack();
            }, 700); // có thể tăng delay nếu muốn mượt hơn
        };

        // ====== Heal Button ======
        const healBtn = document.createElement('button');
        healBtn.innerText = 'Heal';
        healBtn.style.padding = '12px 20px';
        healBtn.style.fontSize = '16px';
        healBtn.style.backgroundColor = '#66cc66';
        healBtn.style.color = 'white';
        healBtn.style.border = 'none';
        healBtn.style.borderRadius = '8px';
        healBtn.style.cursor = 'pointer';

        healBtn.onclick = () => {
            if (this.turnLocked || this.currentTurn !== 'player') return;

            this.turnLocked = true;

            const maxHp = this.playerMonster.maxHp || 100;
            this.playerMonster.hp = Math.min(this.playerMonster.hp + 20, maxHp);

            console.log(`❤️ Player HP: ${this.playerMonster.hp}`);

            setTimeout(() => {
                this.enemyAttack();
            }, 700);
        };

        // Thêm nút vào DOM
        container.appendChild(attackBtn);
        container.appendChild(healBtn);
        document.body.appendChild(container);
    }

    async playAttackEffect() {
        const texture = await PIXI.Assets.load('./Player_Pokemon/fireball.png');
        const baseTexture = texture.baseTexture;

        const frames = [];
        const frameWidth = 258;
        const frameHeight = 64;

        for (let i = 0; i < 4; i++) {
            const rect = new PIXI.Rectangle(i * (frameWidth / 4), 0, frameWidth / 4, frameHeight);
            const textureFrame = new PIXI.Texture({ source: baseTexture, frame: rect });
            console.log(textureFrame);
            frames.push(textureFrame);
        }

        const effectSprite = new PIXI.AnimatedSprite(frames);
        effectSprite.animationSpeed = 0.2;
        effectSprite.loop = true;
        effectSprite.anchor.set(0.5);
        // effectSprite.play();

        // Bắt đầu từ playerMonster
        effectSprite.x = this.playerMonster.sprite.x;
        effectSprite.y = this.playerMonster.sprite.y;

        this.battleOverlay.addChild(effectSprite);
        effectSprite.play();

        // Di chuyển đến enemyMonster
        const startX = effectSprite.x;
        const startY = effectSprite.y;
        const targetX = this.enemyMonster.sprite.x;
        const targetY = this.enemyMonster.sprite.y;

        const duration = 500; // ms
        const startTime = performance.now();

        const animate = (now) => {
            const t = Math.min((now - startTime) / duration, 1);

            // Di chuyển tuyến tính
            effectSprite.x = startX + (targetX - startX) * t;
            effectSprite.y = startY + (targetY - startY) * t;

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                // Khi đến đích → bắt đầu phát animation rồi mới xoá
                effectSprite.x = targetX;
                effectSprite.y = targetY;

                if (this.battleOverlay && effectSprite.parent) {
                    this.battleOverlay.removeChild(effectSprite);
                }
                effectSprite.destroy();
            }
        };

        requestAnimationFrame(animate);
    }

    async enemyAttack() {
        if (!this.playerMonster) return;

        console.log('👾 Enemy attacks!');
        
        // 👇 Gọi animation bay tới player
        await this.playEnemyAttackEffect();

        this.playerMonster.hp -= this.enemyMonster.attack;
        console.log(`💢 Player HP: ${this.playerMonster.hp}`);

        if (this.playerMonster.hp <= 0) {
            await this.showDefeatBanner();
            this.endBattle();
            return;
        }

        this.currentTurn = 'player';
        this.turnLocked = false;
    }

    async playEnemyAttackEffect() {
        const texture = await PIXI.Assets.load('./Player_Pokemon/fireball.png');
        const baseTexture = texture.baseTexture;

        const frames = [];
        const numFrames = 4;
        const frameWidth = 258;
        const frameHeight = 64;

        for (let i = 0; i < numFrames; i++) {
            const rect = new PIXI.Rectangle(i * frameWidth / 4, 0, frameWidth / 4, frameHeight);
            const textureFrame = new PIXI.Texture({ source: baseTexture, frame: rect });
            frames.push(textureFrame);
        }

        const effectSprite = new PIXI.AnimatedSprite(frames);
        effectSprite.animationSpeed = 0.2;
        effectSprite.loop = true;
        effectSprite.anchor.set(0.5);

        effectSprite.x = this.enemyMonster.sprite.x;
        effectSprite.y = this.enemyMonster.sprite.y;

        this.battleOverlay.addChild(effectSprite);
        effectSprite.play();

        const startX = effectSprite.x;
        const startY = effectSprite.y;
        const targetX = this.playerMonster.sprite.x;
        const targetY = this.playerMonster.sprite.y;

        const duration = 500;
        const startTime = performance.now();

        return new Promise((resolve) => {
            const animate = (now) => {
                const t = Math.min((now - startTime) / duration, 1);
                effectSprite.x = startX + (targetX - startX) * t;
                effectSprite.y = startY + (targetY - startY) * t;

                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    if (this.battleOverlay && effectSprite.parent) {
                        this.battleOverlay.removeChild(effectSprite);
                    }
                    effectSprite.destroy();
                    resolve(); // ✅ hiệu ứng kết thúc
                }
            };

            requestAnimationFrame(animate);
        });
    }

    async showVictoryBanner() {
        const texture = await PIXI.Assets.load('./Player_Pokemon/victory.png');
        const baseTexture = texture.baseTexture;
        const frame = new PIXI.Rectangle(0, 0, baseTexture.width, baseTexture.height / 2);
        const croppedTexture = new PIXI.Texture({ source: baseTexture, frame });
        const sprite = new PIXI.Sprite(croppedTexture);

        sprite.anchor.set(0.5);
        sprite.x = this.app.canvas.width / 2;
        sprite.y = this.app.canvas.height / 2;
        sprite.scale.set(0.1);
        sprite.alpha = 0;

        const battleOverlay = this.battleOverlay; // ✅ Dùng biến cục bộ an toàn
        if (!battleOverlay) return; // ✅ Thêm kiểm tra phòng ngừa

        this.battleOverlay.addChild(sprite);

        let start = performance.now();

        const animate = (now) => {
            const t = Math.min((now - start) / 500, 1);
            const startScale = 0.1;
            const endScale = 0.6;
            const currentScale = startScale + (endScale - startScale) * t;

            if (sprite && sprite.transform) {
                sprite.scale.set(currentScale);
                sprite.alpha = t;
            }

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(() => {
                    this.endBattle(); // ✅ Gọi ở đây luôn
                }, 1500); // giữ 1.5s
            }
        };

        requestAnimationFrame(animate);
    }

    async showDefeatBanner() {
        const texture = await PIXI.Assets.load('./Player_Pokemon/victory.png');
        const baseTexture = texture.baseTexture;
        const frame = new PIXI.Rectangle(0, baseTexture.height / 2, baseTexture.width, baseTexture.height / 2);
        const croppedTexture = new PIXI.Texture({ source: baseTexture, frame });
        const sprite = new PIXI.Sprite(croppedTexture);

        sprite.anchor.set(0.5);
        sprite.x = this.app.canvas.width / 2;
        sprite.y = this.app.canvas.height / 2;
        sprite.scale.set(0.1);
        sprite.alpha = 0;

        const battleOverlay = this.battleOverlay; // ✅ Dùng biến cục bộ an toàn
        if (!battleOverlay) return; // ✅ Thêm kiểm tra phòng ngừa

        this.battleOverlay.addChild(sprite);

        let start = performance.now();

        const animate = (now) => {
            const t = Math.min((now - start) / 500, 1);
            const startScale = 0.1;
            const endScale = 0.6;
            const currentScale = startScale + (endScale - startScale) * t;

            if (sprite && sprite.transform) {
                sprite.scale.set(currentScale);
                sprite.alpha = t;
            }

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(() => {
                    this.endBattle(); // ✅ Gọi ở đây luôn
                }, 1500); // giữ 1.5s
            }
        };

        requestAnimationFrame(animate);
    }

    endBattle() {
        this.isActive = false;
        this.playerService.inBattle = false;
        document.getElementById('endBattleButton').style.display = 'none';

        // Giữ lại playerMonster
        if (this.playerMonster?.sprite && this.battleOverlay) {
            this.battleOverlay.removeChild(this.playerMonster.sprite);
        }

        // Xoá toàn bộ enemy và giao diện battle
        if (this.enemyMonster?.sprite) {
            this.enemyMonster.sprite.destroy();
            this.enemyMonster = null;
        }

        if (this.battleOverlay) {
            this.battleOverlay.removeChildren();
            this.app.stage.removeChild(this.battleOverlay);
            this.battleOverlay = null;
        }

        const controlDiv = document.getElementById('battleControls');
        if (controlDiv) {
            controlDiv.remove();
        }
        console.log('✅ End battle: giữ playerMonster, xoá toàn bộ còn lại');
    }
}