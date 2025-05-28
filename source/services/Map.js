// Map.js - Handles map-related functionality
import { rectangularCollision } from '../js/utils.js';
import {
    offset,
    createConnectGate,
    createBoundary,
    createGate,
    collisionMap,
    gatesMap1,
    gatesMap2,
    gatesMap3,
    collisionsMap02,
    collisionsMap03
} from '../data/inforAllMap.js';

//Lấy tọa độ của collision map 1
// const boundaries = [];

// collisionMap.forEach((row, i) => {
//     row.forEach((symbol, j) => {
//         if (symbol === 1025) {
//             boundaries.push(
//                 new Boundary({
//                     position: {
//                         x: j * Boundary.width + 100,
//                         y: i * Boundary.height - 540
//                     }
//                 })
//             );
//         }
//     });
// });

export class MapService {
    originalBoundariesMap;
    originalGatesMap;
    boundariesMap;
    gatesAllMap;
    movableMap;
    gameLoopId;
    positionNextMap;
    srcMap;
    foregroundSrc;
    textureCache;
    currentMapSprite;
    currentForegroundSprite;
    speed;
    positionCollisionAndGate;
    numberMap;
    inTransition;

    constructor(app, playerService) {
        this.app = app;
        this.playerService = playerService;
        this.mapLayer = new PIXI.Container();
        this.mapContainer = new PIXI.Container();
        this.mapLayer.addChild(this.mapContainer);
        this.foregroundMap = new PIXI.Container();
        this.mapLayer.addChild(this.foregroundMap);
        this.boundaryContainer = new PIXI.Container();
        this.mapLayer.addChild(this.boundaryContainer);

        // Khởi tạo các thuộc tính cơ bản

        this.resetPositionCollisionAndGateTest();

        this.movableMap = [];
        this.gameLoopId = null;
        this.positionNextMap = {
            x: offset.map1p1.x,
            y: offset.map1p1.y
        };
        this.srcMap = [
            './MapFinish/Map1.png',
            './MapFinish/Map2.png',
            './MapFinish/Map3.png'
        ];
        this.foregroundSrc = [
            './MapFinish/forestOject.png',
            './MapFinish/forestOject2.png',
            './MapFinish/forestOject3.png'
        ];
        this.textureCache = new Map();
        this.currentMapSprite = null;
        this.currentForegroundSprite = null;
        this.speed = 5;
        this.positionCollisionAndGate = 0;
        this.numberMap = 1;
        this.inTransition = false;

        // Khởi tạo các handlers cho events
        this.initEventHandlers();
        this.initMovableMap();
    }

    getNumberMap() {
        return this.numberMap;
    }

    async getBoundariesMap() {
        //xóa tất cả boundaries cũ
        this.boundaryContainer.removeChildren();

        return this.boundariesMap[this.numberMap - 1][
            this.positionCollisionAndGate
        ];
    }

    initEventHandlers() {
        this.keys = {
            w: { pressed: false },
            a: { pressed: false },
            d: { pressed: false },
            s: { pressed: false }
        };

        this.handleKeyDown = e => {
            switch (e.key) {
                case 'w':
                    this.keys.w.pressed = true;
                    break;
                case 'a':
                    this.keys.a.pressed = true;
                    break;
                case 'd':
                    this.keys.d.pressed = true;
                    break;
                case 's':
                    this.keys.s.pressed = true;
                    break;
            }
        };

        this.handleKeyUp = e => {
            switch (e.key) {
                case 'w':
                case 'ArrowUp':
                    this.keys.w.pressed = false;
                    this.playerService.stopAnimation();
                    break;
                case 'a':
                case 'ArrowLeft':
                    this.keys.a.pressed = false;
                    this.playerService.stopAnimation();
                    break;
                case 'd':
                case 'ArrowRight':
                    this.keys.d.pressed = false;
                    this.playerService.stopAnimation();
                    break;
                case 's':
                case 'ArrowDown':
                    this.keys.s.pressed = false;
                    this.playerService.stopAnimation();
                    break;
            }
        };
    }

    initMovableMap() {
        if (!this.boundariesMap || !this.gatesAllMap) {
            console.error('boundariesMap or gatesAllMap is not initialized');
            return;
        }

        const currentMapIndex = this.numberMap - 1;
        const currentPositionIndex = this.positionCollisionAndGate;

        if (
            !this.boundariesMap[currentMapIndex] ||
            !this.gatesAllMap[currentMapIndex]
        ) {
            console.error('Invalid map index:', currentMapIndex);
            return;
        }

        this.movableMap = [
            this.mapContainer,
            ...(this.boundariesMap[currentMapIndex][currentPositionIndex] ||
                []),
            ...(this.gatesAllMap[currentMapIndex][currentPositionIndex] || []),
            this.foregroundMap
        ];
    }

    async loadTexture(src) {
        try {
            // Kiểm tra cache
            if (this.textureCache.has(src)) {
                console.log('Lấy texture từ cache:', src);
                return this.textureCache.get(src);
            }

            // Nếu chưa có, load và cache lại
            console.log('Đang tải texture:', src);
            const texture = await PIXI.Assets.load({
                src: src,
                data: { resourceOptions: { autoLoad: true } }
            });

            this.textureCache.set(src, texture);
            console.log('Tình trạng cache:', this.textureCache);

            return texture;
        } catch (error) {
            console.error('Không thể tải texture:', src, error);
            throw error;
        }
    }

    async loadMap() {
        try {
            console.log('Loading map', this.numberMap);
            // Xóa tất cả sprites cũ trong mapContainer
            this.mapContainer.removeChildren().forEach(child => {
                if (child && child.destroy) {
                    console.log('Xóa sprite:', child);
                    child.destroy({
                        children: true,
                        texture: false,
                        baseTexture: false
                    });
                }
            });

            const src = this.srcMap[this.numberMap - 1];
            const texture = await this.loadTexture(src);

            this.currentMapSprite = new PIXI.Sprite(texture);
            this.mapContainer.addChild(this.currentMapSprite);

            this.currentMapSprite.position.set(
                this.positionNextMap.x,
                this.positionNextMap.y
            );
            this.currentMapSprite.scale.set(1, 1);
            this.currentMapSprite.anchor.set(0, 0);

            console.log('Map loaded successfully!', {
                map: this.numberMap,
                position: this.positionNextMap
            });
            console.log('Map bounds:', this.currentMapSprite.getBounds());

            return this.mapLayer;
        } catch (error) {
            console.error('Không thể load map:', error);
            throw error;
        }
    }

    async loadForegroundMap() {
        try {
            console.log('Loading foreground for map', this.numberMap);

            // Xóa tất cả sprites cũ trong foregroundMap
            this.foregroundMap.removeChildren().forEach(child => {
                if (child && child.destroy) {
                    child.destroy({
                        children: true,
                        texture: false,
                        baseTexture: false
                    });
                }
            });

            const src = this.foregroundSrc[this.numberMap - 1];
            const texture = await this.loadTexture(src);

            this.currentForegroundSprite = new PIXI.Sprite(texture);
            this.foregroundMap.addChild(this.currentForegroundSprite);

            this.currentForegroundSprite.position.set(
                this.positionNextMap.x,
                this.positionNextMap.y
            );
            this.currentForegroundSprite.scale.set(1, 1);
            this.currentForegroundSprite.anchor.set(0, 0);

            console.log(this.positionCollisionAndGate);

            console.log('Foreground map loaded successfully!');
            return this.foregroundMap;
        } catch (error) {
            console.error('Không thể load foreground map:', error);
            throw error;
        }
    }

    setupControls() {
        // Xóa event listeners cũ
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);

        // Thêm event listeners mới
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);

        // Hủy game loop cũ nếu có
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }

        // Game loop for continuous movement
        const moveMap = async () => {
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

            if (this.playerService.inBattle) {
                requestAnimationFrame(moveMap);
                return; // ❌ Không cho di chuyển nếu đang chiến đấu
            }

            // Kiểm tra va chạm với cổng
            for (
                let i = 0;
                i <
                this.gatesAllMap[this.numberMap - 1][
                    this.positionCollisionAndGate
                ].length;
                i++
            ) {
                const gate =
                    this.gatesAllMap[this.numberMap - 1][
                        this.positionCollisionAndGate
                    ][i];
                if (
                    rectangularCollision({
                        rectangle1: player,
                        rectangle2: {
                            x: gate.x,
                            y: gate.y,
                            width: gate.width,
                            height: gate.height
                        }
                    })
                ) {
                    console.log('Collision with gate detected');
                    console.log('gate', gate.x, gate.y);
                    const connect = this.ConnectGate(gate);

                    if (connect && connect.numberChangeMap !== undefined) {
                        console.log('Connecting to gate:', connect);
                        this.inTransition = true;

                        await this.changeMap(
                            connect.numberChangeMap,
                            connect.inforScreen,
                            connect.numberGate
                        );

                        return;
                    } else {
                        console.log('Không có cổng kết nối');
                        canMove = false;
                    }
                }
            }

            // Xử lý di chuyển
            if (this.keys.w.pressed) {
                // Kiểm tra collision trước khi di chuyển
                for (
                    let i = 0;
                    i <
                    this.boundariesMap[this.numberMap - 1][
                        this.positionCollisionAndGate
                    ].length;
                    i++
                ) {
                    const boundary =
                        this.boundariesMap[this.numberMap - 1][
                            this.positionCollisionAndGate
                        ][i];
                    if (
                        rectangularCollision({
                            rectangle1: player,
                            rectangle2: {
                                x: boundary.x,
                                y: boundary.y + 4,
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
                    this.movableMap.forEach(map => {
                        if (map) map.y += this.speed;
                    });
                    this.playerService.switchDirection('up');
                    this.playerService.loadAnimation('up');
                    this.checkBattleZoneCollision(player);
                }
            } else if (this.keys.a.pressed) {
                for (
                    let i = 0;
                    i <
                    this.boundariesMap[this.numberMap - 1][
                        this.positionCollisionAndGate
                    ].length;
                    i++
                ) {
                    const boundary =
                        this.boundariesMap[this.numberMap - 1][
                            this.positionCollisionAndGate
                        ][i];
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
                    this.movableMap.forEach(map => {
                        if (map) map.x += this.speed;
                    });
                    this.playerService.switchDirection('left');
                    this.playerService.loadAnimation('left');
                    this.checkBattleZoneCollision(player);
                }
            } else if (this.keys.d.pressed) {
                for (
                    let i = 0;
                    i <
                    this.boundariesMap[this.numberMap - 1][
                        this.positionCollisionAndGate
                    ].length;
                    i++
                ) {
                    const boundary =
                        this.boundariesMap[this.numberMap - 1][
                            this.positionCollisionAndGate
                        ][i];
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
                    this.movableMap.forEach(map => {
                        if (map) map.x -= this.speed;
                    });
                    this.playerService.switchDirection('right');
                    this.playerService.loadAnimation('right');
                    this.checkBattleZoneCollision(player);
                }
            } else if (this.keys.s.pressed) {
                for (
                    let i = 0;
                    i <
                    this.boundariesMap[this.numberMap - 1][
                        this.positionCollisionAndGate
                    ].length;
                    i++
                ) {
                    const boundary =
                        this.boundariesMap[this.numberMap - 1][
                            this.positionCollisionAndGate
                        ][i];
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
                    this.movableMap.forEach(map => {
                        if (map) map.y -= this.speed;
                    });
                    this.playerService.switchDirection('down');
                    this.playerService.loadAnimation('down');
                    this.checkBattleZoneCollision(player);
                }
            }

            this.gameLoopId = requestAnimationFrame(moveMap);
        };

        // Bắt đầu game loop mới
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
            const battleChance = 0.1; // 10% xác suất vào trận

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
        if (
            !this.battleZones.some(zone => {
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
                return (
                    (overlapX * overlapY) / (player.width * player.height) >=
                    0.5
                );
            })
        ) {
            this.currentBattleZone = null;
        }
    }

    resetPositionCollisionAndGateTest() {
        let boundariesCopy = createBoundary(collisionMap, offset.map1p1);
        let boundaries1p2Copy = createBoundary(collisionMap, offset.map1p2);
        let boundaries2Copy = createBoundary(collisionsMap02, offset.map2);
        let boundaries2p2Copy = createBoundary(collisionsMap02, offset.map2p2);
        let boundaries3Copy = createBoundary(collisionsMap03, offset.map3);

        let gates1Copy = createGate(gatesMap1, offset.map1p1);
        let gates1p2Copy = createGate(gatesMap1, offset.map1p2);
        let gates2Copy = createGate(gatesMap2, offset.map2);
        let gates2p2Copy = createGate(gatesMap2, offset.map2p2);
        let gates3Copy = createGate(gatesMap3, offset.map3);

        this.boundariesMap = [
            [boundariesCopy, boundaries1p2Copy],
            [boundaries2Copy, boundaries2p2Copy],
            [boundaries3Copy]
        ];

        this.gatesAllMap = [
            [gates1Copy, gates1p2Copy],
            [gates2Copy, gates2p2Copy],
            [gates3Copy]
        ];
        this.connectGate = createConnectGate(
            gates1Copy,
            gates1p2Copy,
            gates2Copy,
            gates2p2Copy,
            gates3Copy
        );
    }

    async changeMap(numberMap, inforScreen, numberGate) {
        try {
            console.log('Starting map change to:', numberMap);
            this.resetPositionCollisionAndGateTest();

            const oldMapIndex = this.numberMap - 1;
            const oldMapSrc = this.srcMap[oldMapIndex];
            const oldFgSrc = this.foregroundSrc[oldMapIndex];

            // Hủy vòng lặp cũ
            if (this.gameLoopId) {
                cancelAnimationFrame(this.gameLoopId);
                this.gameLoopId = null;
            }

            // Destroy sprite hiện tại
            this.currentMapSprite?.destroy({
                children: true,
                texture: true,
                baseTexture: true
            });
            this.currentForegroundSprite?.destroy({
                children: true,
                texture: true,
                baseTexture: true
            });
            this.currentMapSprite = null;
            this.currentForegroundSprite = null;

            // Xóa cache map cũ
            PIXI.Assets.unload(oldMapSrc);
            PIXI.Assets.unload(oldFgSrc);

            // ⚠️ Dọn cache map mới (đề phòng cache cũ chưa bị unload)
            const newMapSrc = this.srcMap[numberMap - 1];
            const newFgSrc = this.foregroundSrc[numberMap - 1];
            PIXI.Assets.unload(newMapSrc);
            PIXI.Assets.unload(newFgSrc);

            // Cập nhật trạng thái
            this.numberMap = numberMap;
            this.positionCollisionAndGate = numberGate;
            this.positionNextMap = {
                x: inforScreen.x,
                y: inforScreen.y
            };

            //reset position container map
            this.mapContainer.position.set(0, 0);
            this.foregroundMap.position.set(0, 0);

            console.log(
                'Container position before reset:',
                this.mapContainer.position
            );
            console.log(
                'Boundary position before reset:',
                this.boundariesMap[this.numberMap - 1][
                    this.positionCollisionAndGate
                ][0].position
            );

            await this.loadMap();
            await this.loadForegroundMap();

            this.initMovableMap();
            this.setupControls();

            console.log('✅ Map change completed');
        } catch (error) {
            console.error('❌ Error during map change:', error);
            throw error;
        }
    }

    ConnectGate(boundaryGate) {
        for (const gate of this.connectGate) {
            for (const boundary of gate.positionGate1.boundaryPosition) {
                if (
                    boundary.x === boundaryGate.x &&
                    boundary.y === boundaryGate.y
                ) {
                    return gate.positionGate1.connect;
                }
            }
            for (const boundary of gate.positionGate2.boundaryPosition) {
                if (
                    boundary.x === boundaryGate.x &&
                    boundary.y === boundaryGate.y
                ) {
                    return gate.positionGate2.connect;
                }
            }
        }

        return null;
    }

    renderBoundaries() {
        // Xóa boundaries cũ
        this.boundaryContainer.removeChildren();

        // Render boundaries của map hiện tại
        const currentBoundaries =
            this.boundariesMap[this.numberMap - 1][
                this.positionCollisionAndGate
            ];
        currentBoundaries.forEach(boundary => {
            const boundaryGraphics = new PIXI.Graphics();
            boundaryGraphics.beginFill(0xff0000, 0.5);
            boundaryGraphics.drawRect(0, 0, boundary.width, boundary.height);
            boundaryGraphics.endFill();
            boundaryGraphics.x = boundary.x;
            boundaryGraphics.y = boundary.y;
            this.boundaryContainer.addChild(boundaryGraphics);
        });

        // Render gates của map hiện tại
        const currentGates =
            this.gatesAllMap[this.numberMap - 1][this.positionCollisionAndGate];
        currentGates.forEach(gate => {
            const gateGraphics = new PIXI.Graphics();
            gateGraphics.beginFill(0x00ff00, 0.5);
            gateGraphics.drawRect(0, 0, gate.width, gate.height);
            gateGraphics.endFill();
            gateGraphics.x = gate.x;
            gateGraphics.y = gate.y;
            this.boundaryContainer.addChild(gateGraphics);
        });
    }

    // Method để cleanup khi cần thiết
    destroy() {
        // Hủy game loop
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }

        // Xóa event listeners
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);

        // Destroy sprites
        if (this.currentMapSprite) {
            this.currentMapSprite.destroy();
            this.currentMapSprite = null;
        }

        if (this.currentForegroundSprite) {
            this.currentForegroundSprite.destroy();
            this.currentForegroundSprite = null;
        }

        // Clear texture cache
        this.textureCache.clear();
    }
}
