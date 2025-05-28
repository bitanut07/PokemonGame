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
            // Load player
            const playerLayer = await playerService.loadPlayer();

            // Load map đúng thứ tự
            const mapLayer = await mapService.loadMap();
            const foregroundMap = await mapService.loadForegroundMap();

            // Thêm vào stage theo thứ tự
            app.stage.addChild(mapLayer);

            app.stage.addChild(playerLayer);

            app.stage.addChild(foregroundMap);

            // Setup điều khiển
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
