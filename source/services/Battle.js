// Battle.js - Thực thi chiến đấu

import { MapService } from './Map.js';
import { PlayerService } from './Player.js';

export class BattleService {
    constructor(app) {
        this.app = app;
        this.battleContainer = new PIXI.Container();
        this.isActive = false;
    }

    async startBattle() {
        console.log('Chuyển sang màn hình chiến đấu (overlay)');

        const dimOverlay = new PIXI.Graphics();
        dimOverlay.beginFill(0x000000, 0.5);
        dimOverlay.drawRect(0, 0, this.app.view.width, this.app.view.height);
        dimOverlay.endFill();

        const battleScene = new PIXI.Container();

        // ✅ Load ảnh battle từ thư mục Images
        const battleTexture = await PIXI.Assets.load({
            src: './Player_Pokemon/battleBackground.png',
            data: { resourceOptions: { autoLoad: true } }
        });

        const battleBackground = new PIXI.Sprite(battleTexture);
        battleBackground.width = 480;
        battleBackground.height = 320;
        battleBackground.anchor.set(0.5);
        battleBackground.x = this.app.view.width / 2;
        battleBackground.y = this.app.view.height / 2;

        battleScene.addChild(dimOverlay);
        battleScene.addChild(battleBackground);

        this.battleOverlay = battleScene;
        this.app.stage.addChild(battleScene);
    }


    endBattle() {
        this.isActive = false;
        this.battleContainer.removeChildren();
        this.app.stage.removeChild(this.battleContainer);
    }
}