// Battle.js - Thực thi chiến đấu

import { MapService } from './Map.js';
import { PlayerService } from './Player.js';

export class BattleService {
    constructor(app, playerService) {
        this.app = app;
        this.battleContainer = new PIXI.Container();
        this.playerService = playerService;
        this.isActive = false;
    }

    startBattle() {
        this.isActive = true;

        const fade = new PIXI.Graphics();
        fade.beginFill(0x000000, 0.0);
        fade.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
        fade.endFill();
        this.app.stage.addChild(fade);

        this.app.ticker.add(() => {
        if (fade.alpha < 1) {
            fade.alpha += 0.05;
        } else {
            this.app.stage.removeChildren();
            this.battleContainer.removeChildren();

            const text = new PIXI.Text('BATTLE START!', {
            fill: 'white',
            fontSize: 48,
            fontWeight: 'bold'
            });
            text.anchor.set(0.5);
            text.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
            this.battleContainer.addChild(text);

            this.app.stage.addChild(this.battleContainer);
        }
        });
    }

    endBattle() {
        this.isActive = false;
        this.battleContainer.removeChildren();
        this.app.stage.removeChild(this.battleContainer);
        this.playerService.inBattle = false;
    }
}
