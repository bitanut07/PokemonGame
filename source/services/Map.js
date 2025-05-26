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
    }

    async loadMap() {
        try {
            console.log('Bắt đầu load map...');

            const texture = await PIXI.Assets.load({
                src: './MapFinish/Map1.png',
                data: { resourceOptions: { autoLoad: true } }
            });

            console.log('Đã load xong texture');

            const map1 = new PIXI.Sprite(texture);
            console.log('Đã tạo sprite');

            this.mapContainer.addChild(map1);
            map1.position.set(1780, 420);
            map1.scale.set(1, 1);
            map1.anchor.set(0.5, 0.5);

            console.log('Map loaded successfully!');
            return this.mapLayer;
        } catch (error) {
            console.error('Không thể load map:', error);
            console.error('Chi tiết lỗi:', error.message);
            throw error;
        }
    }

    async loadForegroundMap() {
        try {
            const texture = await PIXI.Assets.load({
                src: './MapFinish/forestOject.png',
                data: { resourceOptions: { autoLoad: true } }
            });

            const foregroundMap = new PIXI.Sprite(texture);
            this.foregroundMap.addChild(foregroundMap);
            foregroundMap.position.set(1780, 420);
            foregroundMap.scale.set(1, 1);
            foregroundMap.anchor.set(0.5, 0.5);

            console.log('Foreground map loaded successfully!');
            return this.foregroundMap;
        } catch (error) {
            console.error('Không thể load foreground map:', error);
            console.error('Chi tiết lỗi:', error.message);
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
                }
            }

            requestAnimationFrame(moveMap);
        };

        moveMap();
    }
}
