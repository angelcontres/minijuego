export class Enemy {
    constructor(x, y, board) {
        this.x = x;
        this.y = y;
        this.board = board;
        this.element = document.createElement('div');
        this.element.className = 'enemy';
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.board.appendChild(this.element);
    }

    move() {
        this.y += 5; // Mueve al enemigo hacia abajo
        this.element.style.top = `${this.y}px`;
        // Implementa lógica adicional si es necesario, como colisiones
    }
}
