export function rectangularCollision({ rectangle1, rectangle2 }) {
    return (
        rectangle1.x + rectangle1.width >= rectangle2.x &&
        rectangle1.x <= rectangle2.x + rectangle2.width &&
        rectangle1.y <= rectangle2.y + rectangle2.height &&
        rectangle1.y + rectangle1.height >= rectangle2.y
    );
}
