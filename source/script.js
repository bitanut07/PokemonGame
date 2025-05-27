// script.js - Updated for PIXI.js v8
import * as PIXI from 'pixi.js';
import { MapService } from './services/Map.js';
import { PlayerService } from './services/Player.js';
import { BattleService } from './services/Battle.js';
// import { Monster } from '.services/Monster.js'

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

        // Khởi tạo các services
        const playerService = new PlayerService(app);
        const battleService = new BattleService(app, playerService);
        window.battleService = battleService;

        const mapService = new MapService(app, playerService);
        mapService.battleService = battleService;
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

            // Hiển thị overlay xanh dương để kiểm tra vị trí battle zone
            // mapService.battleZones.forEach(zone => {
            //     const debugOverlay = new PIXI.Graphics();
            //     debugOverlay.beginFill(0xf00000);
            //     debugOverlay.drawRect(0, 0, 48, 48);
            //     debugOverlay.endFill();
            //     debugOverlay.x = zone.x;
            //     debugOverlay.y = zone.y;

            //     // Thêm vào cùng mapContainer để di chuyển theo bản đồ
            //     mapService.mapContainer.addChild(debugOverlay);
            // });

            app.stage.addChild(playerLayer);
            app.stage.addChild(foregroundMap);

            document.getElementById('endBattleButton').addEventListener('click', () => {
                // Giả sử bạn đã có `battleService` là một biến toàn cục hoặc truy cập được
                if (window.battleService && battleService.isActive) {
                    battleService.endBattle();
                }
            });

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
