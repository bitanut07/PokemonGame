class Boundary extends PIXI.Graphics {
    static width = 48;
    static height = 48;

    /**
     * @param {{ position: { x: number, y: number } }} options
     */

    constructor({ position }) {
        super();
        // Vẽ hình chữ nhật đỏ kích thước 48×48
        this.beginFill(0xff0000);
        this.drawRect(0, 0, Boundary.width, Boundary.height);
        this.endFill();

        this.x = position.x;
        this.y = position.y;
    }
}
