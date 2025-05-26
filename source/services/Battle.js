// Battle.js - Thực thi chiến đấu

import { MapService } from './Map.js';
import { PlayerService } from './Player.js';

export class BattleService {
    constructor(app) {
        this.app = app;
        this.battleContainer = new PIXI.Container();
        this.isActive = false;
    }

    startBattle() {
        this.isActive = true;

        // Clear stage
        this.app.stage.removeChildren();

        // Tạo UI đơn giản cho màn battle
        const battleText = new PIXI.Text('BATTLE START!', {
            fill: 'white',
            fontSize: 48,
            fontWeight: 'bold',
        });
        battleText.anchor.set(0.5);
        battleText.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
        this.battleContainer.addChild(battleText);

        // Thêm container vào stage
        this.app.stage.addChild(this.battleContainer);

        console.log('Switched to battle scene');
    }

    endBattle() {
        this.isActive = false;
        this.battleContainer.removeChildren();
        this.app.stage.removeChild(this.battleContainer);
    }
}