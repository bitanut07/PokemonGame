// Battle.js - Thực thi chiến đấu

import { MapService } from './Map.js';
import { PlayerService } from './Player.js';
import { Monster } from './Monster.js';
import { Text, TextStyle } from 'pixi.js';

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
            name: 'Hello',
            hp: 100,
            attack: 100,
            level: 1, // 👈 ví dụ player level 3
            spriteSheet: sourceTexturePlayer,
            imageSize: { width: 344, height: 89 },
            numFrames: 4,
            position: { x: 0, y: 0 } // Sẽ gán lại mỗi trận
        });

        this.playerMonster.exp = 0;
        this.playerMonster.expToNextLevel = 100; // hoặc tùy chỉnh theo level

        this.playerMonster.sprite.scale.set(1.2);
    }

    async startBattle() {
        this.isActive = true; // ✅ Đánh dấu đang battle
        document.getElementById('endBattleButton').style.display = 'block';

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

        this.playerHpBar = await this.createHpBar(this.playerMonster);
        this.showMonsterInfo(this.playerMonster, false);

        const baseTextureEnemy = await PIXI.Assets.load('./Player_Pokemon/draggleSprite.png');
        const sourceTextureEnemy = baseTextureEnemy.baseTexture;

        const enemyLevel = Math.floor(Math.random() * 3) + 1; // 👉 Random level từ 1 đến 5

        this.enemyMonster = new Monster({
            name: 'Draggle',
            hp: 100,
            attack: 20,
            level: enemyLevel, // 👈 Thêm level ngẫu nhiên
            spriteSheet: sourceTextureEnemy,
            imageSize: { width: 344, height: 89 },
            numFrames: 4,
            position: { x: this.app.canvas.width / 2 + 185, y: this.app.canvas.height / 4 + 40 }
        });
        this.enemyMonster.sprite.scale.set(0.7);
        
        battleScene.addChild(this.enemyMonster.sprite);

        this.enemyHpBar = await this.createHpBar(this.enemyMonster);
        this.showMonsterInfo(this.enemyMonster, true);

        this.addBattleControls();
    }


    showMonsterInfo(monster, isEnemy = false) {
        const boxId = isEnemy ? 'enemyInfoBox' : 'playerInfoBox';
        const box = document.getElementById(boxId);

        if (!box || !monster) return;

        let expLine = '';
        if (!isEnemy) {
            expLine = `<strong>EXP:</strong> ${monster.exp}/${monster.expToNextLevel}<br>`;
        }

        box.innerHTML = `
            <strong>Name:</strong> ${monster.name}<br>
            <strong>Level:</strong> ${monster.level}<br>
            <strong>HP:</strong> ${monster.hp}/${monster.maxHp}<br>
            ${expLine}
        `;

        box.style.display = 'block';
    }

    updateMonsterInfo(monster, isEnemy = false) {
        const boxId = isEnemy ? 'enemyInfoBox' : 'playerInfoBox';
        const box = document.getElementById(boxId);

        if (!box || !monster) return;

        let expLine = '';
        if (!isEnemy) {
            expLine = `<strong>EXP:</strong> ${monster.exp}/${monster.expToNextLevel}<br>`;
        }

        box.innerHTML = `
            <strong>Name:</strong> ${monster.name}<br>
            <strong>Level:</strong> ${monster.level}<br>
            <strong>HP:</strong> ${Math.max(0, monster.hp)}/${monster.maxHp}<br>
            ${expLine}
        `;
    }

    hideMonsterInfoBoxes() {
        document.getElementById('playerInfoBox').style.display = 'none';
        document.getElementById('enemyInfoBox').style.display = 'none';
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

            await this.advanceAndAttack(this.playerMonster, this.enemyMonster, 'player');

            console.log(`💥 Enemy HP: ${this.enemyMonster.hp}`);

            if (this.enemyMonster.hp <= 0) {
                await this.knockOutMonster(this.enemyMonster);
                this.gainExp(this.playerMonster, this.enemyMonster.level);
                await this.showBattleBanner();
                return;
            }

            // ✅ Gọi enemy phản đòn sau delay
            setTimeout(() => {
                this.enemyTurn();
            }, 1500); // có thể tăng delay nếu muốn mượt hơn
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

        healBtn.onclick = async () => {
            if (this.turnLocked || this.currentTurn !== 'player') return;

            this.turnLocked = true;

            const maxHp = this.playerMonster.maxHp || 100;
            // this.playerMonster.hp = Math.min(this.playerMonster.hp + 30, maxHp);

            const healAmount = 20 + this.playerMonster.level * 10;
            this.playerMonster.hp = Math.min(this.playerMonster.hp + healAmount, maxHp);

            this.updateHpBar(this.playerMonster, this.playerHpBar);
            this.updateMonsterInfo(this.playerMonster, false); // nếu bị player tấn công
            console.log(`❤️ Player HP: ${this.playerMonster.hp}`);

            await this.playHealEffect(this.playerMonster); // 💚 Gọi hiệu ứng heal

            setTimeout(() => {
                this.enemyTurn();
            }, 700);
        };

        // Thêm nút vào DOM
        container.appendChild(attackBtn);
        container.appendChild(healBtn);
        document.body.appendChild(container);
    }

    gainExp(monster, enemyLevel) {
        const gainedExp = 20 + enemyLevel * 10;
        monster.exp += gainedExp;

        console.log(`✨ ${monster.name} gained ${gainedExp} EXP!`);

        // 👉 Cập nhật lại thông tin hiển thị của player
        this.updateMonsterInfo(monster, false);

        if (monster.exp >= monster.expToNextLevel) {
            this.levelUp(monster);
        }
    }

    levelUp(monster) {
        monster.level++;
        monster.exp = 0;
        monster.expToNextLevel += 50; // tăng dần khó hơn
        monster.hp = monster.maxHp = monster.maxHp + 20; // tăng máu
        monster.attack += 5; // tăng sát thương

        this.updateHpBar(monster, this.playerHpBar);
        this.updateMonsterInfo(monster);

        console.log(`⬆️ ${monster.name} leveled up to ${monster.level}!`);
    }

    async createHpBar(monster, isEnemy = false) {
        const texture = await PIXI.Assets.load('./Player_Pokemon/hp.png');
        const baseTexture = texture.baseTexture;

        const totalFrames = 4;
        const frameWidth = 160;
        const frameHeight = 40;

        const maxHp = monster.maxHp || 100;
        const hpPercent = Math.max(monster.hp, 0) / maxHp;

        // let frameIndex;
        // if (monster.hp <= 0) {
        //     frameIndex = totalFrames - 1; // 🔻 HP cạn → dùng frame cuối
        // } else {
        //     frameIndex = Math.floor((1 - hpPercent) * (totalFrames - 1));
        // }

        let frameIndex;
        const ratio = monster.hp / maxHp;

        if (monster.hp <= 0) {
            frameIndex = 3; // KO
        } else if (ratio > 0.8) {
            frameIndex = 0;
        } else if (ratio > 0.4) {
            frameIndex = 1;
        } else {
            frameIndex = 2;
        }

        const rect = new PIXI.Rectangle(0, frameIndex * frameHeight, frameWidth, frameHeight);
        const croppedTexture = new PIXI.Texture({ source: baseTexture, frame: rect });
        const sprite = new PIXI.Sprite(croppedTexture);

        sprite.anchor.set(0, 0.5);

        // ✅ Gắn trực tiếp vào monster.sprite
        const offsetX = isEnemy ? -60 : -85;
        const offsetY = isEnemy ? -30 : -80;
        sprite.position.set(offsetX, offsetY);

        monster.sprite.addChild(sprite); // Gắn sprite HP vào monster

        return sprite;
    }

    async updateHpBar(monster, barSprite) {
        const texture = await PIXI.Assets.load('./Player_Pokemon/hp.png');
        const baseTexture = texture.baseTexture;

        const totalFrames = 4;
        const frameWidth = 160;
        const frameHeight = 40;

        const maxHp = monster.maxHp || 100;
        const hpPercent = Math.max(monster.hp, 0) / maxHp;

        // let frameIndex;
        // if (monster.hp <= 0) {
        //     frameIndex = totalFrames - 1;
        // } else {
        //     frameIndex = Math.floor((1 - hpPercent) * (totalFrames - 1));
        // }

        let frameIndex;
        const ratio = monster.hp / maxHp;

        if (monster.hp <= 0) {
            frameIndex = 3; // KO
        } else if (ratio > 0.8) {
            frameIndex = 0;
        } else if (ratio > 0.4) {
            frameIndex = 1;
        } else {
            frameIndex = 2;
        }

        const rect = new PIXI.Rectangle(0, frameIndex * frameHeight, frameWidth, frameHeight);
        barSprite.texture.frame = rect;
        barSprite.texture.updateUvs();
    }
    
    async enemyTurn() {
        if (!this.playerMonster) return;

        console.log('👾 Enemy attacks!');
        
        const actionRoll = Math.random(); // random từ 0 → 1

        if (actionRoll < 0.3) {
            // 👉 Heal
            const maxHp = this.enemyMonster.maxHp || 100;
            // this.enemyMonster.hp = Math.min(this.enemyMonster.hp + 40, maxHp);

            const healAmount = 20 + this.enemyMonster.level * 10;
            this.enemyMonster.hp = Math.min(this.enemyMonster.hp + healAmount, maxHp);

            this.updateHpBar(this.enemyMonster, this.enemyHpBar);
            this.updateMonsterInfo(this.enemyMonster, true); // nếu bị player tấn công
            console.log(`💚 Enemy heals! New HP: ${this.enemyMonster.hp}`);

            await this.playHealEffect(this.enemyMonster, false);

        } else {
            // 👉 Tấn công như bình thường
            console.log('👾 Enemy attacks!');

            await this.advanceAndAttack(this.enemyMonster, this.playerMonster, 'enemy');

            console.log(`💢 Player HP: ${this.playerMonster.hp}`);

            if (this.playerMonster.hp <= 0) {
                await this.knockOutMonster(this.playerMonster);
                await this.showBattleBanner('defeat');
                return;
            }
        }

        this.currentTurn = 'player';
        this.turnLocked = false;
    }

    blinkHpBar(barSprite) {
        const originalAlpha = barSprite.alpha;
        const blinkTimes = 6;
        const interval = 100;
        let count = 0;

        return new Promise((resolve) => {
            const blink = setInterval(() => {
                barSprite.alpha = barSprite.alpha === 1 ? 0.3 : 1;
                count++;
                if (count >= blinkTimes) {
                    clearInterval(blink);
                    barSprite.alpha = originalAlpha;
                    resolve();
                }
            }, interval);
        });
    }

    async playProjectileAttack({ from, to, texturePath, frameSize, numFrames }) {
        const texture = await PIXI.Assets.load(texturePath);
        const baseTexture = texture.baseTexture;

        const frames = [];
        const frameWidth = frameSize.width;
        const frameHeight = frameSize.height;

        for (let i = 0; i < numFrames; i++) {
            const rect = new PIXI.Rectangle(i * frameWidth / numFrames, 0, frameWidth / numFrames, frameHeight);
            const textureFrame = new PIXI.Texture({ source: baseTexture, frame: rect });
            frames.push(textureFrame);
        }

        const effectSprite = new PIXI.AnimatedSprite(frames);
        effectSprite.animationSpeed = 0.2;
        effectSprite.loop = true;
        effectSprite.anchor.set(0.5);

        effectSprite.x = from.sprite.x + (from === this.playerMonster ? 20 : -10);
        effectSprite.y = from.sprite.y + (from === this.playerMonster ? -20 : 10);

        this.battleOverlay.addChild(effectSprite);
        effectSprite.play();

        const startX = effectSprite.x;
        const startY = effectSprite.y;
        const targetX = to.sprite.x + (from === this.playerMonster ? 0 : 0);
        const targetY = to.sprite.y + (from === this.playerMonster ? 0 : 0);

        const duration = 1000;
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

                    this.playExplosionEffect(targetX, targetY).then(() => {
                        resolve();
                    });
                }
            };

            requestAnimationFrame(animate);
        });
    }

    async advanceAndAttack(monster, target, attackerType = 'player') {
        const sprite = monster.sprite;
        const originalX = sprite.x;
        const originalY = sprite.y;

        // Nếu là playerMonster
        const hpBar = monster === this.playerMonster ? this.playerHpBar : this.enemyHpBar;

        const targetX = target.sprite.x;
        const targetY = target.sprite.y;

        const halfwayX = originalX + (targetX - originalX) / 2;
        const halfwayY = originalY + (targetY - originalY) / 2;

        const duration = 300;

        // 👉 Di chuyển nửa đoạn đường
        await new Promise((resolve) => {
            const startTime = performance.now();
            const animate = (now) => {
                const t = Math.min((now - startTime) / duration, 1);
                sprite.x = originalX + (halfwayX - originalX) * t;
                sprite.y = originalY + (halfwayY - originalY) * t;

                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });

        // 👉 Gọi hiệu ứng tấn công đúng loại
        if (attackerType === 'player') {
            // await this.playAttackEffect();
            await this.playProjectileAttack({
                from: this.playerMonster,
                to: this.enemyMonster,
                texturePath: './Player_Pokemon/bomb.png',
                frameSize: { width: 188, height: 44 },
                numFrames: 4
            });

            // 👉 Trừ HP và cập nhật ngay
            this.enemyMonster.hp -= this.playerMonster.attack;
            this.updateHpBar(this.enemyMonster, this.enemyHpBar);
            this.updateMonsterInfo(this.enemyMonster, true); // nếu bị player tấn công
            await this.blinkHpBar(this.enemyHpBar);

        } else if (attackerType === 'enemy') {
            // await this.playEnemyAttackEffect();
            await this.playProjectileAttack({
                from: this.enemyMonster,
                to: this.playerMonster,
                texturePath: './Player_Pokemon/stones.png',
                frameSize: { width: 240, height: 45 },
                numFrames: 5
            });

            this.playerMonster.hp -= this.enemyMonster.attack;
            this.updateHpBar(this.playerMonster, this.playerHpBar);
            this.updateMonsterInfo(this.playerMonster, false); // nếu bị player tấn công
            await this.blinkHpBar(this.playerHpBar);
        }

        // 👉 Quay lại chỗ cũ
        await new Promise((resolve) => {
            const returnStart = performance.now();
            const animateReturn = (now) => {
                const t = Math.min((now - returnStart) / duration, 1);
                sprite.x = halfwayX + (originalX - halfwayX) * t;
                sprite.y = halfwayY + (originalY - halfwayY) * t;

                // Cập nhật vị trí HP bar
                // this.updateHpBarPosition(monster, hpBar);

                if (t < 1) {
                    requestAnimationFrame(animateReturn);
                } else {
                    resolve();
                }
            };
            requestAnimationFrame(animateReturn);
        });
    }

    async playHealEffect(monster, isPlayer = true) {
        const texture = await PIXI.Assets.load('./Player_Pokemon/healing.png');
        const sprite = new PIXI.Sprite(texture);

        sprite.anchor.set(0.5);
        sprite.x = monster.sprite.x;
        sprite.y = monster.sprite.y;

        // 👇 Phân biệt scale ban đầu và bước scale
        const initialScale = isPlayer ? 0.5 : 0.3;
        const scaleStep = isPlayer ? 0.2 : 0.1;

        sprite.scale.set(initialScale);
        sprite.alpha = 1;

        this.battleOverlay.addChild(sprite);

        const totalBlinks = 12;
        let blinkCount = 0;

        const blinkInterval = 100;

        return new Promise((resolve) => {
            const interval = setInterval(() => {
                // 👉 Nhấp nháy alpha
                sprite.alpha = sprite.alpha === 1 ? 0.3 : 1;

                // 👉 Phóng to mỗi nhịp
                const currentScale = sprite.scale.x;
                sprite.scale.set(currentScale + scaleStep);

                blinkCount++;
                if (blinkCount >= totalBlinks) {
                    clearInterval(interval);

                    if (sprite.parent) this.battleOverlay.removeChild(sprite);
                    sprite.destroy();
                    resolve();
                }
            }, blinkInterval);
        });
    }

    async playExplosionEffect(x, y) {
        const texture = await PIXI.Assets.load('./Player_Pokemon/explosion.png');
        const baseTexture = texture.baseTexture;

        const frames = [];
        const frameWidth = 188;
        const frameHeight = 256;
        const numFrames = 2;

        for (let i = 0; i < numFrames; i++) {
            const rect = new PIXI.Rectangle(0, i * (frameHeight / 2), frameWidth, frameHeight / 2);
            const frameTexture = new PIXI.Texture({ source: baseTexture, frame: rect });
            frames.push(frameTexture);
        }

        const explosion = new PIXI.AnimatedSprite(frames);
        explosion.anchor.set(0.5);
        explosion.x = x;
        explosion.y = y;
        explosion.animationSpeed = 0.15;
        explosion.loop = true;

        this.battleOverlay.addChild(explosion);

        return new Promise((resolve) => {
            let loops = 0;
            const repeatCount = 3

            explosion.onLoop = () => {
                loops++;
                if (loops >= repeatCount) {
                    explosion.stop();
                    if (explosion.parent) {
                        this.battleOverlay.removeChild(explosion);
                    }
                    explosion.destroy();
                    resolve(); // ✅ hoàn tất sau số vòng lặp
                }
            };

            explosion.play();
        });
    }

    async knockOutMonster(monster) {
        const sprite = monster.sprite;
        const originalY = sprite.y;
        const jumpHeight = 80;
        const duration = 500;

        return new Promise((resolve) => {
            const start = performance.now();

            const animate = (now) => {
                const t = (now - start) / duration;

                if (t < 1) {
                    // Parabolic jump up then fall
                    sprite.y = originalY - jumpHeight * Math.sin(Math.PI * t);
                    requestAnimationFrame(animate);
                } else {
                    // Rơi nhanh khỏi màn hình
                    const fallDuration = 600;
                    const fallStart = performance.now();
                    const screenHeight = this.app.canvas.height;

                    const fall = (nowFall) => {
                        const tFall = Math.min((nowFall - fallStart) / fallDuration, 1);
                        sprite.y = originalY + tFall * screenHeight;

                        if (tFall < 1) {
                            requestAnimationFrame(fall);
                        } else {
                            if (sprite.parent) sprite.parent.removeChild(sprite);
                            resolve();
                        }
                    };

                    requestAnimationFrame(fall);
                }
            };

            requestAnimationFrame(animate);
        });
    }

    async showBattleBanner(type = 'victory') {
        const texture = await PIXI.Assets.load('./Player_Pokemon/victory.png');
        const baseTexture = texture.baseTexture;

        // Cắt phần ảnh theo type
        const isVictory = type === 'victory';
        const rect = new PIXI.Rectangle(
            0,
            isVictory ? 0 : baseTexture.height / 2,
            baseTexture.width,
            baseTexture.height / 2
        );

        const croppedTexture = new PIXI.Texture({ source: baseTexture, frame: rect });
        const sprite = new PIXI.Sprite(croppedTexture);

        sprite.anchor.set(0.5);
        sprite.x = this.app.canvas.width / 2;
        sprite.y = this.app.canvas.height / 2;
        sprite.scale.set(0.1);
        sprite.alpha = 0;

        const battleOverlay = this.battleOverlay;
        if (!battleOverlay) return;

        battleOverlay.addChild(sprite);

        let start = performance.now();

        const animate = (now) => {
            const t = Math.min((now - start) / 500, 1);
            sprite.scale.set(0.1 + t * 0.5); // scale tối đa 0.6
            sprite.alpha = t;

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(() => {
                    this.endBattle();
                }, 1500);
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
        this.hideMonsterInfoBoxes();
    }
}