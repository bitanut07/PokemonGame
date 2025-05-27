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
                                x: j * Boundary.width + 100,
                                y: i * Boundary.height - 490
                            }
                        })
                    );
            });
        });

        // Khởi tạo các services
        const playerService = new PlayerService(app);
        // const battleService = new BattleService(app);
        const battleService = new BattleService(app, playerService);


        try {
            // Thêm các boundary vào stage
            boundaries.forEach(boundary => {
                app.stage.addChild(boundary);
                console.log(boundary.x, boundary.y);
            });

            // Load map và thêm vào stage
            const mapLayer = await mapService.loadMap();
            app.stage.addChild(mapLayer);

            // ĐÚNG: vùng battle nên là con của mapContainer để di chuyển cùng map
            battleZones.forEach(zone => {
                mapService.mapContainer.addChild(zone);
            });

            // //Hien boundaries
            // mapService.boundariesMap.forEach(boundary => {
            //     app.stage.addChild(boundary);
            // });
            app.stage.addChild(playerLayer);
        } catch (error) {
            console.error('Error loading game assets:', error);
        }
    } catch (error) {
        console.error('Error initializing game:', error);
    }
}

// Khởi tạo game
initGame();
