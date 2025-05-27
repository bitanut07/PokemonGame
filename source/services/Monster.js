// Monster.js - Hỗ trợ hoạt động quái vật

export class Monster {
    constructor({ name, hp, attack, spriteSheet, imageSize, numFrames = 4, position }) {
        this.name = name;
        this.hp = hp;
        this.maxHp = hp;
        this.attack = attack;
        this.spriteSheet = spriteSheet;

        const frameWidth = imageSize.width / numFrames;
        const frameHeight = imageSize.height;

        const frames = [];

        for (let i = 0; i < numFrames; i++) {
            const rect = new PIXI.Rectangle(i * frameWidth, 0, frameWidth, frameHeight);
            const texture = new PIXI.Texture({ source: this.spriteSheet, frame: rect });
            frames.push(texture);
        }

        this.sprite = new PIXI.AnimatedSprite(frames);
        this.sprite.anchor.set(0.5);
        this.sprite.position.set(position.x, position.y);
        this.sprite.scale.set(1.8);
        this.sprite.animationSpeed = 0.1;
        this.sprite.loop = true;
        this.sprite.play();
    }
}


