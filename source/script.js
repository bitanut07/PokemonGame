// script.js - Updated for PIXI.js v8
import * as PIXI from 'pixi.js';
import { MapService } from './services/Map.js';
import { PlayerService } from './services/Player.js';
import { BattleService } from './services/Battle.js';

async function initGame() {
    try {
        // Khởi tạo Application
        const app = new PIXI.Application();

        // Initialize app với options
        await app.init({
            width: 1024,
            height: 576,
            backgroundColor: 0x000000,
            antialias: true
        });
        // Thêm canvas vào gameContainer
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.appendChild(app.canvas);

        // Lấy toạ độ vùng battle
        const battleZones = [];
        battleZonesMap.forEach((row, i) => {
            row.forEach((symbol, j) => {
                if (symbol === 1025)
                    battleZones.push(
                        new Boundary({
                            position: {
                                x: j * Boundary.width + offset.x,
                                y: i * Boundary.height + offset.y
                            }
                        })
                    );
            });
        });

        // Khởi tạo các services
        const playerService = new PlayerService(app);
        const battleService = new BattleService(app);

        // // Load battle
        // playerService.setBattleZones(battleZones);
        // // Gán callback khi vào battle
        // playerService.setBattleCallback(() => {
        //     battleService.startBattle();
        // });

        const mapService = new MapService(app, playerService);
        const foregroundMap = await mapService.loadForegroundMap();

        try {
            // Load player trước
            const playerLayer = await playerService.loadPlayer();
            app.stage.addChild(playerLayer);

            // Sau đó load map và thiết lập controls
            const mapLayer = await mapService.loadMap();
            app.stage.addChild(mapLayer);

            // //Hien boundaries
            // mapService.boundariesMap.forEach(boundary => {
            //     app.stage.addChild(boundary);
            // });
            app.stage.addChild(playerLayer);
            app.stage.addChild(foregroundMap);

            // Thiết lập điều khiển cho map sau khi player đã được load
            mapService.setupControls();
        } catch (error) {
            console.error('Error loading game assets:', error);
        }
    } catch (error) {
        console.error('Error initializing game:', error);
    }
}

// Khởi tạo game
initGame();
