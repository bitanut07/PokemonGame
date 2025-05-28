// Map.js - Handles map-related functionality
import { rectangularCollision } from '../js/utils.js';

const collisionMap = [];
for (let i = 0; i < collisions.length; i += 70) {
    collisionMap.push(collisions.slice(i, i + 70));
}
console.log(collisionMap);

//Lấy tọa độ của collision map 1
const boundaries = [];

collisionMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025) {
            boundaries.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + 100,
                        y: i * Boundary.height - 540
                    }
                })
            );
        }
    });
});

const battleZonesMap = [];
for (let i = 0; i < battleZonesData.length; i += 70) {
    battleZonesMap.push(battleZonesData.slice(i, i + 70));
}
console.log(battleZonesMap);

//Lấy tọa độ của battleZones map 1
const battleZones = [];

battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025) {
            battleZones.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + 100,
                        y: i * Boundary.height - 540
                    },
                })
            );
        }
    });
});


import gateMapArray from '../data/gateMap.js';

const [gateData1, gateData2, gateData3] = gateMapArray;


const buildGates = (gateData, offsetX = 100, offsetY = -540) => {
    const gates = [];
    const numCols = 70; // số cột trên bản đồ (bạn đang dùng 70 phần tử mỗi dòng)

    for (let i = 0; i < gateData.length; i++) {
        if (gateData[i] === 1025) {
            const row = Math.floor(i / numCols);
            const col = i % numCols;

            gates.push(new Boundary({
                position: {
                    x: col * Boundary.width + offsetX,
                    y: row * Boundary.height + offsetY
                }
            }));
        }
    }

    return gates;
};

const gates1 = buildGates(gateData1);
const gates2 = buildGates(gateData2);
const gates3 = buildGates(gateData3);

// Gộp thành mảng tổng thể cho từng map
const gatesAllMap = [gates1, gates2, gates3];

export class MapService {
    boundariesMap = boundaries;
    constructor(app, playerService) {
        this.app = app;
        this.playerService = playerService;
        this.mapLayer = new PIXI.Container();
        this.mapContainer = new PIXI.Container();
        this.mapLayer.addChild(this.mapContainer);
        this.foregroundMap = new PIXI.Container();
        this.mapLayer.addChild(this.foregroundMap);
        this.battleZones = battleZones;
        this.battleZones.forEach(zone => {
            this.mapContainer.addChild(zone);
        });
        this.currentBattleZone = null; // Theo dõi vùng battle hiện tại


        this.numberMap = 1; // Map mặc định
        this.positionNextMap = { x: 1780, y: 420 }; // ✅ Quan trọng!
        this.gatesAllMap = gatesAllMap;
    }

    async loadMap() {
        try {
            console.log('Bắt đầu load map...');

            // Dọn sprite cũ nếu có
            this.mapContainer.removeChildren();

            const currentMapNumber = this.numberMap;
            

            const mapSrc = `./MapFinish/Map${currentMapNumber}.png`;
            const texture = await PIXI.Assets.load({
                src: mapSrc,
                data: { resourceOptions: { autoLoad: true } }
            });

            console.log("Gate: ", gates1);

            const mapSprite = new PIXI.Sprite(texture);
            this.mapContainer.addChild(mapSprite);

            // Gán position theo offset được set trong changeMap()
            mapSprite.position.set(this.positionNextMap.x, this.positionNextMap.y);
            mapSprite.scale.set(1, 1);
            mapSprite.anchor.set(0.5, 0.5);

            console.log(`✅ Map ${this.numberMap} loaded!`);

            // 🔍 Debug: hiển thị tất cả gate hiện tại bằng ô vuông xanh
            const currentGates = this.gatesAllMap[this.numberMap - 1];
            currentGates.forEach(gate => {
                const debugOverlay = new PIXI.Graphics();
                debugOverlay.beginFill(0x00ffff, 0.5); // Xanh dương nhạt
                debugOverlay.drawRect(0, 0, Boundary.width, Boundary.height);
                debugOverlay.endFill();

                debugOverlay.x = gate.x;
                debugOverlay.y = gate.y;

                this.mapContainer.addChild(debugOverlay);
            });

            return this.mapLayer;
        } catch (error) {
            console.error('❌ Không thể load map:', error.message);
            throw error;
        }
    }

    async loadForegroundMap() {
        try {
            this.foregroundMap.removeChildren();

            const foregroundSrc = `./MapFinish/forestOject.png`;
            const texture = await PIXI.Assets.load({
                src: foregroundSrc,
                data: { resourceOptions: { autoLoad: true } }
            });

            const foregroundSprite = new PIXI.Sprite(texture);
            this.foregroundMap.addChild(foregroundSprite);


            const offset = this.positionNextMap ?? { x: 1780, y: 420 };
            foregroundSprite.position.set(offset.x, offset.y);

            // foregroundSprite.position.set(this.positionNextMap.x, this.positionNextMap.y);
            foregroundSprite.scale.set(1, 1);
            foregroundSprite.anchor.set(0.5, 0.5);

            console.log(`🌲 Foreground của map ${this.numberMap} loaded!`);
            return this.foregroundMap;
        } catch (error) {
            console.error('❌ Không thể load foreground map:', error.message);
            throw error;
        }
    }

    setupControls() {
        const keys = {
            w: { pressed: false },
            a: { pressed: false },
            d: { pressed: false },
            s: { pressed: false }
        };

        const movableMap = [
            this.mapContainer,
            ...boundaries,
            this.foregroundMap
        ];

        window.addEventListener('keydown', e => {
            switch (e.key) {
                case 'w':
                    keys.w.pressed = true;
                    break;
                case 'a':
                    keys.a.pressed = true;
                    break;
                case 'd':
                    keys.d.pressed = true;
                    break;
                case 's':
                    keys.s.pressed = true;
                    break;
            }
        });

        window.addEventListener('keyup', e => {
            switch (e.key) {
                case 'w':
                case 'ArrowUp':
                    keys.w.pressed = false;
                    this.playerService.stopAnimation();
                    break;
                case 'a':
                case 'ArrowLeft':
                    keys.a.pressed = false;
                    this.playerService.stopAnimation();
                    break;
                case 'd':
                case 'ArrowRight':
                    keys.d.pressed = false;
                    this.playerService.stopAnimation();
                    break;
                case 's':
                case 'ArrowDown':
                    keys.s.pressed = false;
                    this.playerService.stopAnimation();
                    break;
            }
        });

        // Game loop for continuous movement
        const moveMap = () => {
            // Lấy vị trí player theo thời gian thực
            const playerPos = this.playerService.getPlayerPosition();
            const player = {
                x: playerPos.x,
                y: playerPos.y,
                width: this.playerService.getFrameWidth(),
                height: this.playerService.getFrameHeight()
            };

            let canMove = true;

            if (this.playerService.inBattle) {
                requestAnimationFrame(moveMap);
                return; // ❌ Không cho di chuyển nếu đang chiến đấu
            }

            if (keys.w.pressed) {
                // Kiểm tra collision trước khi di chuyển
                for (let i = 0; i < this.boundariesMap.length; i++) {
                    const boundary = this.boundariesMap[i];
                    if (
                        rectangularCollision({
                            rectangle1: player,
                            rectangle2: {
                                x: boundary.x,
                                y: boundary.y + 4, // Kiểm tra vị trí tiếp theo
                                width: boundary.width,
                                height: boundary.height
                            }
                        })
                    ) {
                        console.log('Collision detected');
                        canMove = false;
                        this.playerService.stopAnimation();
                        break;
                    }
                }

                if (canMove) {
                    movableMap.forEach(map => {
                        map.y += 4;
                    });
                    this.playerService.switchDirection('up');
                    //load animation
                    this.playerService.loadAnimation('up');
                    this.checkBattleZoneCollision(player);
                    this.checkGateCollision(player); // ✅ THÊM DÒNG NÀY
                }
            } else if (keys.a.pressed) {
                // Tương tự cho các hướng khác
                for (let i = 0; i < this.boundariesMap.length; i++) {
                    const boundary = this.boundariesMap[i];
                    if (
                        rectangularCollision({
                            rectangle1: player,
                            rectangle2: {
                                x: boundary.x + 4,
                                y: boundary.y,
                                width: boundary.width,
                                height: boundary.height
                            }
                        })
                    ) {
                        console.log('Collision detected');
                        canMove = false;
                        this.playerService.stopAnimation();
                        break;
                    }
                }

                if (canMove) {
                    movableMap.forEach(map => {
                        map.x += 4;
                    });
                    this.playerService.switchDirection('left');
                    //load animation
                    this.playerService.loadAnimation('left');
                    this.checkBattleZoneCollision(player);
                    this.checkGateCollision(player); // ✅ THÊM DÒNG NÀY
                }
            } else if (keys.d.pressed) {
                for (let i = 0; i < this.boundariesMap.length; i++) {
                    const boundary = this.boundariesMap[i];
                    if (
                        rectangularCollision({
                            rectangle1: player,
                            rectangle2: {
                                x: boundary.x - 4,
                                y: boundary.y,
                                width: boundary.width,
                                height: boundary.height
                            }
                        })
                    ) {
                        console.log('Collision detected');
                        canMove = false;
                        this.playerService.stopAnimation();
                        break;
                    }
                }

                if (canMove) {
                    movableMap.forEach(map => {
                        map.x -= 4;
                    });
                    this.playerService.switchDirection('right');
                    //load animation
                    this.playerService.loadAnimation('right');
                    this.checkBattleZoneCollision(player);
                    this.checkGateCollision(player); // ✅ THÊM DÒNG NÀY
                }
            } else if (keys.s.pressed) {
                for (let i = 0; i < this.boundariesMap.length; i++) {
                    const boundary = this.boundariesMap[i];
                    if (
                        rectangularCollision({
                            rectangle1: player,
                            rectangle2: {
                                x: boundary.x,
                                y: boundary.y - 4,
                                width: boundary.width,
                                height: boundary.height
                            }
                        })
                    ) {
                        console.log('Collision detected');
                        canMove = false;
                        this.playerService.stopAnimation();
                        break;
                    }
                }

                if (canMove) {
                    movableMap.forEach(map => {
                        map.y -= 4;
                    });
                    this.playerService.switchDirection('down');
                    //load animation
                    this.playerService.loadAnimation('down');
                    this.checkBattleZoneCollision(player);
                    this.checkGateCollision(player); // ✅ THÊM DÒNG NÀY
                }
            }

            requestAnimationFrame(moveMap);
        };

        moveMap();
    }

    checkBattleZoneCollision(player) {
        let enteredZone = false;

        for (const zone of this.battleZones) {
            const zoneX = zone.x + this.mapContainer.x;
            const zoneY = zone.y + this.mapContainer.y;

            const overlapX = Math.max(
                0,
                Math.min(player.x + player.width, zoneX + zone.width) -
                Math.max(player.x, zoneX)
            );
            const overlapY = Math.max(
                0,
                Math.min(player.y + player.height, zoneY + zone.height) -
                Math.max(player.y, zoneY)
            );
            const overlapArea = overlapX * overlapY;
            const playerArea = player.width * player.height;
            const overlapRatio = overlapArea / playerArea;

            if (overlapRatio >= 0.5) {
                if (this.currentBattleZone !== zone) {
                    // Mới bước vào vùng battle zone
                    this.currentBattleZone = zone;
                    enteredZone = true;
                }
                break;
            }
        }

        // Nếu vừa mới bước vào vùng mới => kiểm tra xác suất
        if (enteredZone && !this.playerService.inBattle) {
            const chance = Math.random(); // [0, 1]
            const battleChance = 0.1;     // 10% xác suất vào trận

            console.log(`Đã vào vùng mới. Tỉ lệ random: ${chance.toFixed(2)}`);

            if (chance < battleChance) {
                console.log('Tiến vào trận chiến!');
                this.playerService.inBattle = true;
                this.playerService.stopAnimation();
                if (this.battleService) this.battleService.startBattle();
            } else {
                console.log('Không gặp trận chiến.');
            }
        }

        // Nếu không còn nằm trong battle zone nào, reset current zone
        if (!this.battleZones.some(zone => {
            const zoneX = zone.x + this.mapContainer.x;
            const zoneY = zone.y + this.mapContainer.y;
            const overlapX = Math.max(
                0,
                Math.min(player.x + player.width, zoneX + zone.width) -
                Math.max(player.x, zoneX)
            );
            const overlapY = Math.max(
                0,
                Math.min(player.y + player.height, zoneY + zone.height) -
                Math.max(player.y, zoneY)
            );
            return (overlapX * overlapY) / (player.width * player.height) >= 0.5;
        })) {
            this.currentBattleZone = null;
        }
    }

    checkGateCollision(player) {
        const currentGates = this.gatesAllMap[this.numberMap - 1];

        for (const gate of currentGates) {
            const gateX = gate.x + this.mapContainer.x;
            const gateY = gate.y + this.mapContainer.y;

            const overlapX = Math.max(
                0,
                Math.min(player.x + player.width, gateX + gate.width) -
                Math.max(player.x, gateX)
            );
            const overlapY = Math.max(
                0,
                Math.min(player.y + player.height, gateY + gate.height) -
                Math.max(player.y, gateY)
            );

            const overlapArea = overlapX * overlapY;
            const playerArea = player.width * player.height;
            const overlapRatio = overlapArea / playerArea;

            if (overlapRatio >= 0.5) {
                console.log('🚪 Đã bước vào vùng GATE!');

                // ✅ Hiển thị thông báo (hoặc sau này overlay)
                this.showGateNotification?.(); // optional chaining để tránh lỗi

                // Chuyển map
                if (this.numberMap === 1) {
                    this.changeMap(2, { x: 1780, y: 420 });
                } else if (this.numberMap === 2) {
                    this.changeMap(3, { x: 1780, y: 420 });
                } else if (this.numberMap === 3) {
                    this.changeMap(1, { x: 1780, y: 420 });
                }

                return;
            }
        }
    }

    changeMap(newMapNumber, offset) {
        console.log(`🧭 Chuyển từ map ${this.numberMap} sang map ${newMapNumber}`);
        this.numberMap = newMapNumber;
        this.positionNextMap = offset;

        this.loadMap();
        this.loadForegroundMap();
        this.initMovableMap?.(); // dùng optional chaining nếu hàm này chưa tồn tại lúc đầu
    }


}
