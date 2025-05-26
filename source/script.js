// script.js - Updated for PIXI.js v8
import * as PIXI from 'pixi.js';
import { MapService } from './services/Map.js';
import { PlayerService } from './services/Player.js';
import { BattleService } from './services/Battle.js';

const offset = {
    x: 1700,
    y: 400
};

const collisionMap = [];
for (let i = 0; i < collisions.length; i += 70) {
    collisionMap.push(collisions.slice(i, i + 70));
}

console.log(collisionMap);

const battleZonesMap = [];
for (let i = 0; i < battleZonesData.length; i += 70){
    battleZonesMap.push(battleZonesData.slice(i, 70 + i))
}

console.log(battleZonesMap);

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
        //Lấy tọa độ của collision map
        const boundaries = [];

        collisionMap.forEach((row, i) => {
            row.forEach((symbol, j) => {
                if (symbol === 1025) {
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: j * Boundary.width + 100,
                                y: i * Boundary.height - 490
                            }
                        })
                    );
                }
            });
        });

        // Lấy toạ độ vùng battle
        const battleZones = []
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
                )
            })
        })

        // Khởi tạo các services
        const mapService = new MapService(app);
        const playerService = new PlayerService(app);
        const battleService = new BattleService(app);

        // Load battle
        playerService.setBattleZones(battleZones);
        // Gán callback khi vào battle
        playerService.setBattleCallback(() => {
            battleService.startBattle();
        });

        try {
            // Thêm các boundary vào stage
            boundaries.forEach(boundary => {
                app.stage.addChild(boundary);
                console.log(boundary.x, boundary.y);
            });
            // Load map và thêm vào stage
            const mapLayer = await mapService.loadMap();
            app.stage.addChild(mapLayer);

            // Thiết lập điều khiển cho map
            mapService.setupControls();

            // Load player và thêm vào stage
            const playerLayer = await playerService.loadPlayer();
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
