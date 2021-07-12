let scoreLabel, score, snake, apple, xTiles, yTiles, xFillSize, yFillSize;
const left = 37;
const up = 38;
const right = 39;
const down = 40;

class Fragment {
   constructor(x, y) {
      this.x = x !== undefined && x !== null ? x : 10;
      this.y = y !== undefined && y !== null ? y : 10;
   }

   getPosition = () => {
      return { x: this.x, y: this.y };
   };
}

class SnakeFragment extends Fragment {
   moveLeft = () => this.x--;

   moveRight = () => this.x++;

   moveUp = () => this.y--;

   moveDown = () => this.y++;

   collides = ({ x, y }) => {
      return x === this.x && y === this.y;
   };
}

class Snake {
   constructor() {
      this.directions = {
         LEFT: 1,
         UP: 2,
         RIGHT: 3,
         DOWN: 4
      };
      const x = Math.floor(xTiles / 2);
      const y = Math.floor(yTiles / 2);
      this.head = new SnakeFragment(x, y - 2);
      this.body = [new SnakeFragment(x, y - 1), new SnakeFragment(x, y), new SnakeFragment(x, y + 1), new SnakeFragment(x, y + 2)];
      this.moveStack = [];
      this.currentDirection = this.directions.UP;
   }

   move = () => {
      let nextDirection = this.moveStack.pop();
      this.currentDirection = nextDirection || this.currentDirection;
      const tailPos = this.getTail().getPosition();
      const prevPos = this.head.getPosition();
      switch (this.currentDirection) {
         case this.directions.LEFT:
            this.head.moveLeft();
            break;

         case this.directions.UP:
            this.head.moveUp();
            break;

         case this.directions.RIGHT:
            this.head.moveRight();
            break;

         case this.directions.DOWN:
            this.head.moveDown();
            break;
      }
      this.moveTail(prevPos);
      if (this.checkDeath()) this.resetSnake();
      else if (this.head.collides(apple)) {
         this.appendFragment(tailPos);

         if (score === 60) score = 69;
         else if (score === 69) score = 80;
         else score += 10;

         scoreLabel.innerHTML = score;
         if (this.getLength() === xTiles * yTiles) alert("You win the game, nerd");
         else apple.getRandomCoordinates();
      }
   };

   moveTail = previousPosition => {
      this.body.forEach(fragment => {
         const tempPosition = fragment.getPosition();
         fragment.x = previousPosition.x;
         fragment.y = previousPosition.y;
         previousPosition = { x: tempPosition.x, y: tempPosition.y };
      });
   };

   getWholeSnake = () => {
      return [this.head, ...this.body];
   };

   getTail = () => {
      return this.body[this.body.length - 1];
   };

   appendFragment = coordinates => {
      this.body.push(new SnakeFragment(coordinates.x, coordinates.y));
   };

   checkDeath = () => {
      const offScreen = this.head.x < 0 || this.head.y < 0 || this.head.x >= xTiles || this.head.y >= yTiles;
      return (
         offScreen ||
         this.body.some(fragment => {
            return fragment.collides(this.head);
         })
      );
   };

   resetSnake = () => {
      const x = Math.floor(xTiles / 2);
      const y = Math.floor(yTiles / 2);
      this.head = new SnakeFragment(x, y - 2);
      this.body = [new SnakeFragment(x, y - 1), new SnakeFragment(x, y), new SnakeFragment(x, y + 1), new SnakeFragment(x, y + 2)];
      this.moveStack = [];
      this.currentDirection = this.directions.UP;
      score = 0;
      scoreLabel.innerHTML = score;
      apple.getRandomCoordinates();
   };

   getLength = () => {
      return this.body.length + 1;
   };
}

class Apple extends Fragment {
   getRandomCoordinates = () => {
      this.x = this.getRandomXCoordinate();
      this.y = this.getRandomYCoordinate();
      while (this.appleCollidesWithSnake()) {
         this.x = this.getRandomXCoordinate();
         this.y = this.getRandomYCoordinate();
      }
   };

   getRandomXCoordinate = () => {
      return Math.floor(Math.random() * xTiles);
   };
   getRandomYCoordinate = () => {
      return Math.floor(Math.random() * yTiles);
   };

   appleCollidesWithSnake = () => {
      if (this.x === undefined || this.y === undefined) return true;

      return snake.getWholeSnake().some(fragment => {
         return fragment.collides(this);
      });
   };
}

window.onload = function() {
   canvas = document.getElementById("canvas");
   context = canvas.getContext("2d");
   scoreLabel = document.getElementById("scoreLabel");
   document.addEventListener("keydown", handleKeyPress);
   score = parseInt(scoreLabel.innerHTML);
   xTiles = Math.floor(Math.sqrt(canvas.width));
   yTiles = Math.floor(Math.sqrt(canvas.height));
   xFillSize = xTiles - xTiles / 10;
   yFillSize = yTiles - yTiles / 10;
   snake = new Snake();
   apple = new Apple();
   apple.getRandomCoordinates();
   this.setInterval(game, 1000 / 10);
};

function game() {
   snake.move();

   context.fillStyle = "black";
   context.fillRect(0, 0, canvas.width, canvas.height);

   context.fillStyle = "white";
   context.fillRect(snake.head.x * xTiles, snake.head.y * yTiles, xFillSize, yFillSize);
   snake.body.forEach(fragment => context.fillRect(fragment.x * xTiles, fragment.y * yTiles, xTiles - xTiles / 10, yTiles - yTiles / 10));

   context.fillStyle = "red";
   context.fillRect(apple.x * xTiles, apple.y * yTiles, xFillSize, yFillSize);
}

function handleKeyPress(e) {
   e.preventDefault();
   directionPreceding = snake.moveStack[0] || snake.currentDirection;
   switch (e.keyCode) {
      case left:
         if (directionPreceding !== snake.directions.RIGHT && directionPreceding !== snake.directions.LEFT)
            snake.moveStack.unshift(snake.directions.LEFT);
         break;
      case up:
         if (directionPreceding !== snake.directions.DOWN && directionPreceding !== snake.directions.UP)
            snake.moveStack.unshift(snake.directions.UP);
         break;
      case right:
         if (directionPreceding !== snake.directions.LEFT && directionPreceding !== snake.directions.RIGHT)
            snake.moveStack.unshift(snake.directions.RIGHT);
         break;
      case down:
         if (directionPreceding !== snake.directions.UP && directionPreceding !== snake.directions.DOWN)
            snake.moveStack.unshift(snake.directions.DOWN);
         break;
   }
}
