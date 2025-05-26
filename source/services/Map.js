// Map.js - Handles map-related functionality

export class MapService {
    constructor(app) {
        this.app = app;
        this.mapLayer = new PIXI.Container();
        this.mapContainer = new PIXI.Container();
        this.mapLayer.addChild(this.mapContainer);
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
            map1.position.set(1780, 470);
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

    setupControls() {
        const keys = {
            w: {
                pressed: false
            },
            a: {
                pressed: false
            },
            d: {
                pressed: false
            },
            s: {
                pressed: false
            }
        };

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
                    break;
                case 'a':
                case 'ArrowLeft':
                    keys.a.pressed = false;
                    break;
                case 'd':
                case 'ArrowRight':
                    keys.d.pressed = false;
                    break;
                case 's':
                case 'ArrowDown':
                    keys.s.pressed = false;
                    break;
            }
        });

        // Game loop for continuous movement
        const moveMap = () => {
            if (keys.w.pressed) {
                this.mapContainer.y += 4;
            } else if (keys.a.pressed) {
                this.mapContainer.x += 4;
            } else if (keys.d.pressed) {
                this.mapContainer.x -= 4;
            } else if (keys.s.pressed) {
                this.mapContainer.y -= 4;
            }
            requestAnimationFrame(moveMap);
        };

        moveMap();
    }
}
