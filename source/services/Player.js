// Player.js - Hỗ trợ nhiều hướng và animation tái sử dụng

export class PlayerService {
    constructor(app) {
        this.app = app;
        this.playerLayer = new PIXI.Container();
        this.animations = {}; // Lưu animation theo hướng
        this.currentDirection = 'down';
        this.activeSprite = null;
        this.moving = false;
        this.speed = 2;
        this.battleZones = [];
        this.battleCallback = null;
    }

    async loadPlayer() {
        // Load tất cả hướng
        await this.loadDirection('down', './Player_Pokemon/playerDown.png');
        await this.loadDirection('up', './Player_Pokemon/playerUp.png');
        await this.loadDirection('left', './Player_Pokemon/playerLeft.png');
        await this.loadDirection('right', './Player_Pokemon/playerRight.png');

        // Hiển thị hướng mặc định
        this.switchDirection('down');

        this.setupKeyboardControls();

        this.app.ticker.add(() => {
            if (this.moving && this.activeSprite) {
                switch (this.currentDirection) {
                    case 'down':
                        this.activeSprite.y += this.speed;
                        break;
                    case 'up':
                        this.activeSprite.y -= this.speed;
                        break;
                    case 'left':
                        this.activeSprite.x -= this.speed;
                        break;
                    case 'right':
                        this.activeSprite.x += this.speed;
                        break;
                }
            }
        });

        return this.playerLayer;
    }

    async loadDirection(name, path) {
        const baseTexture = await PIXI.Assets.load(path);
        const frameWidth = baseTexture.width / 4;
        const frameHeight = baseTexture.height;
        const frames = [];

        for (let i = 0; i < 4; i++) {
            const frame = new PIXI.Rectangle(
                i * frameWidth,
                0,
                frameWidth,
                frameHeight
            );
            const texture = new PIXI.Texture({ source: baseTexture, frame });
            frames.push(texture);
        }

        const anim = new PIXI.AnimatedSprite(frames);
        anim.animationSpeed = 0.15;
        anim.loop = true;
        anim.visible = false;

        anim.x = this.app.screen.width / 2;
        anim.y = this.app.screen.height / 2;

        this.animations[name] = anim;
        this.playerLayer.addChild(anim);
    }

    switchDirection(name) {
        if (this.activeSprite) {
            this.activeSprite.stop();
            this.activeSprite.visible = false;
        }

        this.currentDirection = name;
        this.activeSprite = this.animations[name];
        this.activeSprite.visible = true;
        if (this.moving) {
            this.activeSprite.play();
        }
    }
    loadAnimation(name) {
        this.activeSprite.play();
    }
    stopAnimation() {
        //reset animation về frame đầu tiên
        this.activeSprite.gotoAndStop(0);
    }

    getPlayerPosition() {
        if (this.activeSprite) {
            return {
                x: this.activeSprite.x,
                y: this.activeSprite.y
            };
        }
        return { x: 0, y: 0 };
    }
    getFrameHeight() {
        return this.activeSprite?.height ?? 0;
    }
    getFrameWidth() {
        return this.activeSprite?.width ?? 0;
    }
}
