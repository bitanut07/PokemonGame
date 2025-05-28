// Battle.js - Thực thi chiến đấu

import { MapService } from './Map.js';
import { PlayerService } from './Player.js';
import { Monster } from './Monster.js';
import { BattleEffectService } from './EffectBattle.js';

export class BattleService {
    constructor(app, playerService) {
        this.app = app;
        this.battleContainer = new PIXI.Container();
        this.isActive = false;
        this.playerService = playerService;

        // Khởi tạo playerMonster 1 lần duy nhất
        this.playerMonster = null;
        this.initPlayerMonster();

        // Trỏ đến Monster bằng mũi tên
        this.arrowTarget = null;
    }

    // Khởi tạo Player Monster
    async initPlayerMonster() {
        // Load assets Player Monster 
        const baseTexturePlayer = await PIXI.Assets.load('./Player_Pokemon/embySprite.png');
        const sourceTexturePlayer = baseTexturePlayer.baseTexture;

        // Thiết lập chỉ số Monster
        this.playerMonster = new Monster({
            name: 'Hello',
            hp: 100,
            attack: 150,
            level: 1,
            spriteSheet: sourceTexturePlayer,
            imageSize: { width: 344, height: 89 },
            numFrames: 4,
            position: { x: 0, y: 0 } // Sẽ gán lại mỗi trận
        });

        // Thiết lập exp Monster
        this.playerMonster.exp = 0;
        this.playerMonster.expToNextLevel = 100;

        // Tỷ lệ Monster
        this.playerMonster.sprite.scale.set(1.2);
    }

    // Bắt đầu trận chiến
    async startBattle(mapNumber = 1) {
        this.isActive = true; // Đánh dấu đang battle
        document.getElementById('endBattleButton').style.display = 'block';

        console.log('Chuyển sang màn hình chiến đấu (overlay)');

        // Turn player
        this.currentTurn = 'player'; // hoặc 'enemy'
        this.turnLocked = false;     // khoá nút khi chưa tới lượt

        const dimOverlay = new PIXI.Graphics();
        dimOverlay.beginFill(0x000000, 0.5);
        dimOverlay.drawRect(0, 0, this.app.canvas.width, this.app.canvas.height);
        dimOverlay.endFill();

        const battleScene = new PIXI.Container();
        battleScene.alpha = 0; // Mờ hoàn toàn ban đầu

        // Load ảnh battle background từ thư mục Images
        const battleTexture = await PIXI.Assets.load({
            src: './Player_Pokemon/battleBackground.png',
            data: { resourceOptions: { autoLoad: true } }
        });

        // Thiết lập battle background
        const battleBackground = new PIXI.Sprite(battleTexture);
        battleBackground.width = 580;
        battleBackground.height = 420;
        battleBackground.anchor.set(0.5);
        battleBackground.x = this.app.canvas.width / 2;
        battleBackground.y = this.app.canvas.height / 2;

        battleScene.addChild(dimOverlay);
        battleScene.addChild(battleBackground);
        this.effectService = new BattleEffectService(this.app, this.battleOverlay);

        // Hiệu ứng chuyển cảnh
        // await this.transitionIn();
        await this.effectService.transitionIn(this.app.stage);
        this.battleOverlay = battleScene;
        this.app.stage.addChild(battleScene);
        // await this.fadeInScene(battleScene);
        await this.effectService.fadeInScene(this.battleOverlay);
        this.app.stage.alpha = 1;

        // Vị trí Player Monster
        this.playerMonster.sprite.position.set(
            this.app.canvas.width / 3 + 60,
            this.app.canvas.height / 2 + 40
        );
        battleScene.addChild(this.playerMonster.sprite);

        // Thanh thông tin và HP player monster
        this.playerHpBar = await this.createHpBar(this.playerMonster);
        this.showMonsterInfo(this.playerMonster, false);

        // Load ảnh enemy monster
        const baseTextureEnemy = await PIXI.Assets.load('./Player_Pokemon/draggleSprite.png');
        const sourceTextureEnemy = baseTextureEnemy.baseTexture;

        let enemyLevel;
        switch (mapNumber) {
            case 1:
                enemyLevel = Math.floor(Math.random() * 3) + 1; // 1–3
                break;
            case 2:
                enemyLevel = Math.floor(Math.random() * 3) + 7; // 4–6
                break;
            case 3:
                enemyLevel = Math.floor(Math.random() * 3) + 15; // 7–9
                break;
            default:
                enemyLevel = 1;
        }

        // Thiết lập enemy monster
        this.enemyMonster = new Monster({
            name: 'Draggle',
            hp: 100,
            attack: 20,
            level: enemyLevel,
            spriteSheet: sourceTextureEnemy,
            imageSize: { width: 344, height: 89 },
            numFrames: 4,
            position: { x: this.app.canvas.width / 2 + 185, y: this.app.canvas.height / 4 + 40 }
        });
        this.enemyMonster.sprite.scale.set(0.7);
        
        battleScene.addChild(this.enemyMonster.sprite);

        // Thanh thông tin và HP enemy monster
        this.enemyHpBar = await this.createHpBar(this.enemyMonster);
        this.showMonsterInfo(this.enemyMonster, true);

        // Load mũi tên turn arrow
        await this.createArrowIndicator();
        this.startArrowTracking();

        // Thao tác chiến đấu
        this.addBattleControls();
    }

    // Khởi tạo mũi tên chỉ định turn arrow
    async createArrowIndicator() {
        // Load asset turn arrow
        const texture = await PIXI.Assets.load('./Player_Pokemon/turn_arrow.png');
        const baseTexture = texture.baseTexture;

        // Thiết lập kích thước
        const frames = [];
        const frameWidth = 23;
        const frameHeight = 32;
        const numFrames = 1;

        for (let i = 0; i < numFrames; i++) {
            const rect = new PIXI.Rectangle(i * frameWidth, 0, frameWidth, frameHeight);
            const frameTexture = new PIXI.Texture({ source: baseTexture, frame: rect });
            frames.push(frameTexture);
        }

        const arrow = new PIXI.AnimatedSprite(frames);
        arrow.anchor.set(0.5);
        arrow.animationSpeed = 0.1;
        arrow.loop = true;
        arrow.play();

        arrow.visible = false; // ban đầu ẩn

        this.arrowIndicator = arrow;
        this.battleOverlay.addChild(arrow);
    }

    // Bắt đầu đối tượng chỉ định mũi tên turn arrow
    startArrowTracking() {
        const track = () => {
            if (this.arrowTarget && this.arrowIndicator) {

                const scale = this.arrowTarget.sprite.scale.y;
                const offsetY = -(this.arrowTarget.sprite.height / 2 + 75 * scale);
                // const offsetY = -this.arrowTarget.sprite.height / 2 - 45;
                this.arrowIndicator.x = this.arrowTarget.sprite.x;
                this.arrowIndicator.y = this.arrowTarget.sprite.y + offsetY;
            }
            this._arrowRAF = requestAnimationFrame(track);
        };
        this._arrowRAF = requestAnimationFrame(track);
    }

    // Cập nhật đối tượng chỉ định turn arrow
    async updateArrowTarget(monster) {
        this.arrowTarget = monster;
        if (this.arrowIndicator) {
            this.arrowIndicator.visible = true;
            await this.moveArrowTo(monster); // Chờ mũi tên tới nơi trước khi tiếp tục
        }
    }

    // Cập nhật vị trí turn arrow
    async moveArrowTo(monster) {
        if (!this.arrowIndicator) return;

        const scale = monster.sprite.scale.y; // Lấy scale theo chiều dọc
        const offsetY = -(monster.sprite.height / 2 + 75 * scale); // Scale offset phù hợp

        const targetX = monster.sprite.x;
        const targetY = monster.sprite.y + offsetY;

        const arrow = this.arrowIndicator;
        const duration = 300;
        const startX = arrow.x;
        const startY = arrow.y;

        return new Promise((resolve) => {
            const startTime = performance.now();

            const animate = (now) => {
                const t = Math.min((now - startTime) / duration, 1);
                arrow.x = startX + (targetX - startX) * t;
                arrow.y = startY + (targetY - startY) * t;

                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    arrow.x = targetX;
                    arrow.y = targetY;
                    resolve(); // Chờ mũi tên di chuyển xong
                }
            };

            requestAnimationFrame(animate);
        });
    }

    // Ngừng chỉ định turn arrow
    stopArrowTracking() {
        if (this._arrowRAF) cancelAnimationFrame(this._arrowRAF);
    }

    // Hiện thông tin monster
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

    // Cập nhật thông tin monster
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

    // Ẩn thông tin monster
    hideMonsterInfoBoxes() {
        document.getElementById('playerInfoBox').style.display = 'none';
        document.getElementById('enemyInfoBox').style.display = 'none';
    }

    // Điều khiển thao tác chiến đấu của player
    async addBattleControls() {
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

        await this.updateArrowTarget(this.playerMonster);

        // ATTACK
        attackBtn.onclick = async () => {
            if (!this.enemyMonster || this.turnLocked || this.currentTurn !== 'player') return;

            this.turnLocked = true; // Khoá thao tác

            await this.advanceAndAttack(this.playerMonster, this.enemyMonster, 'player');

            console.log(`💥 Enemy HP: ${this.enemyMonster.hp}`);

            if (this.enemyMonster.hp <= 0) {
                await this.knockOutMonster(this.enemyMonster);
                await this.gainExp(this.playerMonster, this.enemyMonster.level);
                await this.showBattleBanner();
                return;
            }

            // Gọi turn enemy sau delay
            setTimeout(() => {
                this.enemyTurn();
            }, 1500);
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

        // HEALING
        healBtn.onclick = async () => {
            if (this.turnLocked || this.currentTurn !== 'player') return;

            this.turnLocked = true;

            const maxHp = this.playerMonster.maxHp || 100;

            const healAmount = 20 + this.playerMonster.level * 10;
            this.playerMonster.hp = Math.min(this.playerMonster.hp + healAmount, maxHp);

            this.updateHpBar(this.playerMonster, this.playerHpBar);
            this.updateMonsterInfo(this.playerMonster, false);
            console.log(`❤️ Player HP: ${this.playerMonster.hp}`);

            await this.effectService.playHealEffect(this.playerMonster, true, this.battleOverlay); // Gọi hiệu ứng heal

            // Quay lại enemy turn
            setTimeout(() => {
                this.enemyTurn();
            }, 700);
        };

        // Thêm nút vào DOM
        container.appendChild(attackBtn);
        container.appendChild(healBtn);
        document.body.appendChild(container);
    }

    // Nhận EXP
    async gainExp(monster, enemyLevel) {
        const gainedExp = 20 + enemyLevel * 10;
        monster.exp += gainedExp;

        console.log(`✨ ${monster.name} gained ${gainedExp} EXP!`);

        // Cập nhật giao diện
        this.updateMonsterInfo(monster, false);

        if (monster.exp >= monster.expToNextLevel) {
            monster.exp -= monster.expToNextLevel;
            monster.level++;
            monster.expToNextLevel += 50;

            this.updateMonsterInfo(monster, false);

            // 💥 Hiệu ứng level up, rồi mới tới banner
            await this.effectService.playLevelUpEffect(monster, this.battleOverlay);
        }
    }

    // Tăng cấp monster
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

    // Tạo thanh HP
    async createHpBar(monster, isEnemy = false) {
        const texture = await PIXI.Assets.load('./Player_Pokemon/hp.png');
        const baseTexture = texture.baseTexture;

        const totalFrames = 4;
        const frameWidth = 160;
        const frameHeight = 40;

        const maxHp = monster.maxHp || 100;
        const hpPercent = Math.max(monster.hp, 0) / maxHp;

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

        // Gắn trực tiếp vào monster.sprite
        const offsetX = isEnemy ? -60 : -85;
        const offsetY = isEnemy ? -30 : -80;
        sprite.position.set(offsetX, offsetY);

        monster.sprite.addChild(sprite); // Gắn sprite HP vào monster

        return sprite;
    }

    // Cập nhật thanh HP
    async updateHpBar(monster, barSprite) {
        const texture = await PIXI.Assets.load('./Player_Pokemon/hp.png');
        const baseTexture = texture.baseTexture;

        const totalFrames = 4;
        const frameWidth = 160;
        const frameHeight = 40;

        const maxHp = monster.maxHp || 100;
        const hpPercent = Math.max(monster.hp, 0) / maxHp;

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
    
    // Enemy monster turn
    async enemyTurn() {
        if (!this.playerMonster) return;

        console.log('⏳ Switching turn to enemy...');
        // Di chuyển mũi tên sang enemy trước khi thực hiện hành động
        await this.updateArrowTarget(this.enemyMonster);
        await new Promise((resolve) => setTimeout(resolve, 500)); 

        console.log('👾 Enemy turn!');
        
        // Ngẫu nhiên thao tác attack/heal
        const actionRoll = Math.random();

        if (actionRoll < 0.2) {
            // HEALING
            const maxHp = this.enemyMonster.maxHp || 100;

            const healAmount = 20 + this.enemyMonster.level * 10;
            this.enemyMonster.hp = Math.min(this.enemyMonster.hp + healAmount, maxHp);

            this.updateHpBar(this.enemyMonster, this.enemyHpBar);
            this.updateMonsterInfo(this.enemyMonster, true);
            console.log(`💚 Enemy heals! New HP: ${this.enemyMonster.hp}`);

            await this.effectService.playHealEffect(this.enemyMonster, false, this.battleOverlay);

        } else {
            // ATTACK
            console.log('👾 Enemy attacks!');

            await this.advanceAndAttack(this.enemyMonster, this.playerMonster, 'enemy');

            if (this.playerMonster.hp <= 0) {
                await this.knockOutMonster(this.playerMonster);
                await this.showBattleBanner('defeat');
                return;
            }
        }

        // Di chuyển mũi tên quay lại player trước khi mở lượt mới
        await this.updateArrowTarget(this.playerMonster);
        await new Promise((resolve) => setTimeout(resolve, 300));

        this.currentTurn = 'player';
        this.turnLocked = false;
    }

    // Thao tác tấn công
    async advanceAndAttack(monster, target, attackerType = 'player') {
        const sprite = monster.sprite;
        const originalX = sprite.x;
        const originalY = sprite.y;

        // Scale monster
        const originalScale = sprite.scale.x;

        const isPlayer = attackerType === 'player';
        const isEnemy = attackerType === 'enemy';

        const targetScale = isPlayer
            ? originalScale * 0.7   // 👦 Player thu nhỏ
            : originalScale * 1.4;  // 👾 Enemy phóng to

        // Nếu là playerMonster
        const hpBar = monster === this.playerMonster ? this.playerHpBar : this.enemyHpBar;

        const targetX = target.sprite.x;
        const targetY = target.sprite.y;

        const halfwayX = originalX + (targetX - originalX) / 2;
        const halfwayY = originalY + (targetY - originalY) / 2;

        const duration = 300;

        // Di chuyển nửa đoạn đường
        await new Promise((resolve) => {
            const startTime = performance.now();
            const animate = (now) => {
                const t = Math.min((now - startTime) / duration, 1);
                sprite.x = originalX + (halfwayX - originalX) * t;
                sprite.y = originalY + (halfwayY - originalY) * t;

                // Scale
                const scaleNow = originalScale + (targetScale - originalScale) * t;
                sprite.scale.set(scaleNow);

                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });

        // Gọi hiệu ứng tấn công đúng loại player/enemy
        if (attackerType === 'player') {
            await this.effectService.playAttackEffect({
                from: this.playerMonster,
                to: this.enemyMonster,
                texturePath: './Player_Pokemon/bomb.png',
                frameSize: { width: 188, height: 44 },
                numFrames: 4,
                battleOverlay: this.battleOverlay
            });

            // Trừ HP enemy và cập nhật ngay
            this.enemyMonster.hp -= this.playerMonster.attack;
            this.updateHpBar(this.enemyMonster, this.enemyHpBar);
            this.updateMonsterInfo(this.enemyMonster, true);
            // await this.blinkHpBar(this.enemyHpBar);
            await this.effectService.blinkHpBar(this.enemyHpBar);

        } else if (attackerType === 'enemy') {
            await this.effectService.playAttackEffect({
                from: this.enemyMonster,
                to: this.playerMonster,
                texturePath: './Player_Pokemon/stones.png',
                frameSize: { width: 240, height: 45 },
                numFrames: 5,
                battleOverlay: this.battleOverlay
            });

            // Trừ HP player và cập nhật ngay
            this.playerMonster.hp -= this.enemyMonster.attack;
            this.updateHpBar(this.playerMonster, this.playerHpBar);
            this.updateMonsterInfo(this.playerMonster, false);
            // await this.blinkHpBar(this.playerHpBar);
            await this.effectService.blinkHpBar(this.playerHpBar);
        }

        // Quay lại vị trí ban đầu
        await new Promise((resolve) => {
            const returnStart = performance.now();
            const animateReturn = (now) => {
                const t = Math.min((now - returnStart) / duration, 1);
                sprite.x = halfwayX + (originalX - halfwayX) * t;
                sprite.y = halfwayY + (originalY - halfwayY) * t;

                const scaleNow = targetScale + (originalScale - targetScale) * t;
                sprite.scale.set(scaleNow);

                if (t < 1) {
                    requestAnimationFrame(animateReturn);
                } else {
                    sprite.scale.set(originalScale);
                    resolve();
                }
            };
            requestAnimationFrame(animateReturn);
        });
    }

    // Monster bị hạ gục
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
                    // Nhảy lên 1 đoạn
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

    // Hiện biểu tượng chiến thắng hoặc thất bại
    async showBattleBanner(type = 'victory') {
        // Load assets banner
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
            sprite.scale.set(0.1 + t * 0.5);
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

    // Kết thúc trận chiến
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

        this.stopArrowTracking();

        this.hideMonsterInfoBoxes();
    }
}