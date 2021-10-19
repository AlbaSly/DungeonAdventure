const canvas = document.querySelector('#canvas');
const canvasContext = canvas.getContext('2d');

const heal = document.querySelector('#heal');
const coords = document.querySelector('#choords');

const FPS = 30;

const tileMap = new Image();
tileMap.src = '/img/tilemap.png';
const tilePixels = 32;

let enemies = [];
let torchs = [];

const stage = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,2,2,0,0,0,2,2,2,2,0,0,2,2,0],
  [0,0,2,2,2,2,2,0,0,2,0,0,2,0,0],
  [0,0,2,0,0,0,2,2,0,2,2,2,2,0,0],
  [0,0,2,2,2,0,0,2,0,2,0,2,0,0,0],
  [0,2,2,0,2,0,0,2,0,2,0,2,0,0,0],
  [0,0,2,0,0,0,2,2,2,2,0,2,2,2,0],
  [0,2,2,2,0,0,2,0,0,0,0,0,0,2,0],
  [0,2,2,2,0,0,2,0,0,2,2,2,2,2,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];
const wall = 0;
const door = 1;
const road = 2;
const key = 3;

const square = {
    width: 50,
    height: 50
}

class Character {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.initX = this.x;
        this.initY = this.y;
        this.heal = 3;
        this.key = false;
    }
    draw() {
        //los 32, 32 son la ubicación en pixeles de la imagen del personae en tileMap
        canvasContext.drawImage(tileMap, 32, 32, tilePixels, tilePixels, this.x*square.width, this.y*square.height, square.width, square.height);
        heal.textContent = `Heal: ${this.heal}`;
        coords.textContent = `Coords: [${this.x}, ${this.y}]`;
    }
    reSpawn() {
        this.x = this.initX;
        this.y = this.initY;
        this.key = false;

        if (this.heal === 0) {
            alert('DEAD');
            this.heal = 3;
            respawnEnemies();
        }
        loadObjectives();
    }
    wallFound(posX, posY) {
        return stage[posY][posX] === wall;
    }
    keyFound() {
        if (stage[this.y][this.x] === key) {
            this.key = true;
            stage[this.y][this.x] = road;
        }
    }
    doorFound() {
        if (stage[this.y][this.x] === door) {
            if (this.key === true) {
                alert('YOU WIN');
                this.heal = 3;
                this.reSpawn();
            } else {
                alert('AND THE KEY?');
            }
        }
    }
    enemyFound(posX, posY) {
        if (this.x === posX && this.y === posY) {
            this.heal--;
            this.reSpawn();
        }
    }
    moveUp() {
        if(!this.wallFound(this.x, this.y-1)) {
            this.y--;
        }
    }
    moveDown() {
        if(!this.wallFound(this.x, this.y+1)) {
            this.y++;
        }
    }
    moveLeft() {
        if(!this.wallFound(this.x-1, this.y)) {
            this.x--;
        }
    }
    moveRight() {
        if(!this.wallFound(this.x+1., this.y)) {
            this.x++;
        }
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.initX = this.x;
        this.initY = this.y;
        this.delayCounter = 0;
    }
    wallFound(posX, posY) {
        return stage[posY][posX] === wall;
    }
    reSpawn() {
        this.x = this.initX;
        this.y = this.initY;
    }
    randMove() {
        mainCharacter.enemyFound(this.x, this.y);

        let randMov = Math.floor(Math.random() * 4);

        if (this.delayCounter < FPS/3) {
            this.delayCounter++;
        } else {
            switch(randMov) {
            case 0:
                this.moveUp();
                break;
            case 1:
                this.moveDown();
                break;
            case 2:
                this.moveLeft();
                break;
            case 3:
                this.moveRight();
                break;
            }
            this.delayCounter = 0;
        }

    }
    draw() {
        //los 32, 32 son la ubicación en pixeles de la imagen del personae en tileMap
        canvasContext.drawImage(tileMap, 0, 32, tilePixels, tilePixels, this.x*square.width, this.y*square.height, square.width, square.height);
    }
    moveUp() {
        if(!this.wallFound(this.x, this.y-1)) {
            this.y--;
        }
    }
    moveDown() {
        if(!this.wallFound(this.x, this.y+1)) {
            this.y++;
        }
    }
    moveLeft() {
        if(!this.wallFound(this.x-1, this.y)) {
            this.x--;
        }
    }
    moveRight() {
        if(!this.wallFound(this.x+1., this.y)) {
            this.x++;
        }
    }
}



/**
 * Iniciando el juego con el evento DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', runGame);



let mainCharacter; //Character object

function runGame() {
    mainCharacter = new Character(2, 8);

    loadControls(mainCharacter);
    loadObjectives();
    loadEnemies();
    loadDecorations();

    setInterval( () => {
        updateFrames();
    }, 1000/FPS);
}

function loadEnemies() {
    enemies.push(new Enemy(3, 4));
    enemies.push(new Enemy(5, 6));
    enemies.push(new Enemy(12, 2));
    enemies.push(new Enemy(12, 6));
}

function respawnEnemies() {
    enemies.forEach( enemy => {
        enemy.reSpawn();
    });
}

function loadDecorations() {
    torchs.push(new Torch(0, 0));
    torchs.push(new Torch(3, 8));
}

function updateFrames() {
    clearCanvas();
    drawStage();
    
    mainCharacter.draw();
    enemies.forEach( enemy => {
        enemy.draw();
        enemy.randMove();
    });
    torchs.forEach( torch => {
        torch.draw();
        torch.animate();
    })
}

function drawStage() {
    let tile;
    for (let y = 0; y < stage.length; y++) {
        for (let x = 0; x < stage[0].length; x++) {
            tile = stage[y][x]; //0 = wall, 1 = door, 2
            //el cero es la primera fila de la imagen (altura 0)
            canvasContext.drawImage(tileMap, tile*tilePixels, 0, tilePixels, tilePixels, square.width*x, square.height*y, square.width, square.height);
        }
    }
}

class Torch {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.delayCounter = 0;
    }
    draw() {
        canvasContext.drawImage(tileMap, 0*tilePixels, 2*tilePixels, tilePixels, tilePixels, this.x*square.width, this.y*square.height, square.width, square.height);
    }
    animate() {
        const frames = FPS/6;
        this.delayCounter++;
        switch (this.delayCounter) {
            case frames/4:
                canvasContext.drawImage(tileMap, 0*tilePixels, 2*tilePixels, tilePixels, tilePixels, this.x*square.width, this.y*square.height, square.width, square.height);
                break;
            case (frames/4)*2:
                canvasContext.drawImage(tileMap, 1*tilePixels, 2*tilePixels, tilePixels, tilePixels, this.x*square.width, this.y*square.height, square.width, square.height);
                break;
            case (frames/4)*3:
                canvasContext.drawImage(tileMap, 2*tilePixels, 2*tilePixels, tilePixels, tilePixels, this.x*square.width, this.y*square.height, square.width, square.height);
                break;
            case frames:
                canvasContext.drawImage(tileMap, 3*tilePixels, 2*tilePixels, tilePixels, tilePixels, this.x*square.width, this.y*square.height, square.width, square.height);
                this.delayCounter = 0;
                break;
        }
    }
}

function clearCanvas() {
    canvas.width = 750;
    canvas.height = 500;
}

function loadControls(character) {
    document.addEventListener('keydown', (event) => {
        switch(event.key) {
            case 'ArrowUp':
                character.moveUp();
                break;
            case 'ArrowDown':
                character.moveDown();
                break;
            case 'ArrowLeft':
                character.moveLeft();
                break;
            case 'ArrowRight':
                character.moveRight();
                break;
        }
        character.keyFound();
        character.doorFound();
    })
}

function loadObjectives() {
    stage[7][6] = key;
    stage[7][10] = door;
}
