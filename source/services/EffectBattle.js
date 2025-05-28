export class BattleEffectService {
    constructor(app, battleOverlay) {
        this.app = app;
        this.battleOverlay = battleOverlay;
    }

    // Heal effect
    async playHealEffect(monster, isPlayer = true, battleOverlay) {
        const texture = await PIXI.Assets.load('./Player_Pokemon/healing.png');
        const sprite = new PIXI.Sprite(texture);

        sprite.anchor.set(0.5);
        sprite.x = monster.sprite.x;
        sprite.y = monster.sprite.y;

        const initialScale = isPlayer ? 0.5 : 0.3;
        const scaleStep = isPlayer ? 0.2 : 0.1;

        sprite.scale.set(initialScale);
        sprite.alpha = 1;

        battleOverlay.addChild(sprite);

        const totalBlinks = 12;
        let blinkCount = 0;

        return new Promise((resolve) => {
            const interval = setInterval(() => {
                sprite.alpha = sprite.alpha === 1 ? 0.3 : 1;
                sprite.scale.set(sprite.scale.x + scaleStep);
                blinkCount++;
                if (blinkCount >= totalBlinks) {
                    clearInterval(interval);
                    battleOverlay.removeChild(sprite);
                    sprite.destroy();
                    resolve();
                }
            }, 100);
        });
    }

    // Explosion effect
    async playExplosionEffect(x, y, battleOverlay) {
        const texture = await PIXI.Assets.load('./Player_Pokemon/explosion.png');
        const baseTexture = texture.baseTexture;

        const frames = [];
        const frameWidth = 188;
        const frameHeight = 256;

        for (let i = 0; i < 2; i++) {
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

        battleOverlay.addChild(explosion);

        return new Promise((resolve) => {
            let loops = 0;
            explosion.onLoop = () => {
                loops++;
                if (loops >= 3) {
                    explosion.stop();
                    battleOverlay.removeChild(explosion);
                    explosion.destroy();
                    resolve();
                }
            };
            explosion.play();
        });
    }

    // Attack effect
    async playAttackEffect({ from, to, texturePath, frameSize, numFrames, battleOverlay }) {
        const texture = await PIXI.Assets.load(texturePath);
        const baseTexture = texture.baseTexture;

        const frames = [];
        const frameWidth = frameSize.width;
        const frameHeight = frameSize.height;

        for (let i = 0; i < numFrames; i++) {
            const rect = new PIXI.Rectangle(i * frameWidth / numFrames, 0, frameWidth / numFrames, frameHeight);
            const frameTexture = new PIXI.Texture({ source: baseTexture, frame: rect });
            frames.push(frameTexture);
        }

        const sprite = new PIXI.AnimatedSprite(frames);
        sprite.anchor.set(0.5);
        sprite.animationSpeed = 0.2;
        sprite.loop = true;

        sprite.x = from.sprite.x + (from === to ? 0 : from === to ? 0 : 20);
        sprite.y = from.sprite.y + (from === to ? 0 : from === to ? 0 : -20);

        battleOverlay.addChild(sprite);
        sprite.play();

        const startX = sprite.x;
        const startY = sprite.y;
        const targetX = to.sprite.x;
        const targetY = to.sprite.y;

        const duration = 1000;
        const startTime = performance.now();

        return new Promise((resolve) => {
            const animate = (now) => {
                const t = Math.min((now - startTime) / duration, 1);
                sprite.x = startX + (targetX - startX) * t;
                sprite.y = startY + (targetY - startY) * t;

                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    battleOverlay.removeChild(sprite);
                    sprite.destroy();
                    this.playExplosionEffect(targetX, targetY, battleOverlay).then(resolve);
                }
            };
            requestAnimationFrame(animate);
        });
    }

    // Hp effect blink
    async blinkHpBar(barSprite) {
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

    // Hiệu ứng chuyển cảnh khi bắt đầu battle
    async transitionIn(stage) {
        return new Promise((resolve) => {
            const duration = 600;
            const start = performance.now();

            const animate = (now) => {
                const t = Math.min((now - start) / duration, 1);
                stage.alpha = 1 - 0.8 * t;

                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    // Hiệu ứng làm mờ vào cảnh
    async fadeInScene(scene) {
        scene.alpha = 0;

        return new Promise((resolve) => {
            const duration = 500;
            const start = performance.now();

            const animate = (now) => {
                const t = Math.min((now - start) / duration, 1);
                scene.alpha = t;

                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    scene.alpha = 1;
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    // Hiệu ứng lên cấp (Level Up)
    async playLevelUpEffect(monster, battleOverlay) {
        // Load assets
        const texture = await PIXI.Assets.load('./Player_Pokemon/level_up.png');
        const baseTexture = texture.baseTexture;

        // Thiết lập kích thước
        const frameWidth = 56;
        const frameHeight = 76;
        const numFrames = 1;

        const frames = [];
        for (let i = 0; i < numFrames; i++) {
            const rect = new PIXI.Rectangle(i * frameWidth, 0, frameWidth, frameHeight);
            const frameTexture = new PIXI.Texture({ source: baseTexture, frame: rect });
            frames.push(frameTexture);
        }

        const levelUpSprite = new PIXI.AnimatedSprite(frames);
        levelUpSprite.anchor.set(0.5);
        levelUpSprite.animationSpeed = 0.2;
        levelUpSprite.loop = true;

        levelUpSprite.x = monster.sprite.x;
        const startY = monster.sprite.y - 30;
        levelUpSprite.y = startY;
        levelUpSprite.scale.set(0.8);
        levelUpSprite.alpha = 1;

        battleOverlay.addChild(levelUpSprite);
        levelUpSprite.play();

        return new Promise((resolve) => {
            const duration = 1500;
            const startTime = performance.now();

            const animate = (now) => {
                const t = Math.min((now - startTime) / duration, 1);

                // Nhấp nháy (alpha)
                levelUpSprite.alpha = Math.sin(t * 10 * Math.PI) > 0 ? 1 : 0.3;

                // Phóng to nhẹ
                const scale = 0.8 + 0.4 * t;
                levelUpSprite.scale.set(scale);

                // Di chuyển lên trên
                levelUpSprite.y = startY - 30 * t;

                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    levelUpSprite.stop();
                    battleOverlay.removeChild(levelUpSprite);
                    levelUpSprite.destroy();
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }
}