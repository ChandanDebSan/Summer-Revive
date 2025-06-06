var cols , rows;
var stack = [];
var w = 40;
var grid = [];
var current;

var player;
var start , end;

var bullets = [];
var bulletSpeed = 5; 
let lastShot = 0;
let cooldown = 300;

var enemies= [];

let mazeGenerated = false;
function setup(){
    createCanvas(400,400);
    cols =  floor(width/w);
    rows = floor(height / w);
    //frameRate(5);
    for(var j  = 0; j < rows; j++){
        for(var i = 0; i < cols; i++){
            var cell = new Cell(i,j);
            grid.push(cell);
        }
    }
    current = grid[0];
    player = grid[0];
    start = grid[0];
    end = grid[grid.length - 1];
    enemies.push(new Enemy(cols - 1, rows - 1));

    
}

function draw() {
    background(51);

    for (let i = 0; i < grid.length; i++) {
        grid[i].show();
    }

    if (!mazeGenerated) {
        // Maze generation
        current.visited = true;
        var next = current.checkNeighbours();
        if (next) {
            next.visited = true;
            stack.push(current);
            removeWalls(current, next);
            current = next;
        } else if (stack.length > 0) {
            current = stack.pop();
        } else {
            mazeGenerated = true;

            // ✅ Only after maze is ready, calculate neighbors
            for (let i = 0; i < grid.length; i++) {
                grid[i].addNeighbours();
            }
        }
    }else{
        //Draw Player
        fill(0, 255, 0);
        stroke(255);
        strokeWeight(2);
        ellipse(player.i * w + w / 2, player.j * w + w / 2, w * 0.5);


        //start and end points
        noStroke();
        fill(0,255,0,100);
        rect(start.i * w, start.j * w, w, w);

        fill(255,0,0,100);
        rect(end.i * w, end.j * w, w, w);

        //Win Condition
        if(player === end){
            noLoop();
            fill(255);
            textSize(32);
            textAlign(CENTER, CENTER);
            text("You Win!", width / 2, height / 2);
        }


        //Update and Drawing bullets
        for(var i = bullets.length - 1; i >= 0; i--){
            bullets[i].update();
            bullets[i].show();
            for(var j = enemies.length - 1; j >= 0; j--){
                if(enemies[j].isHit(bullets[i].x, bullets[i].y)){
                    enemies.splice(j, 1);
                    bullets.splice(i ,1);
                    break;
                }
            }
            if (i < bullets.length && bullets[i].offscreen()) {
                bullets.splice(i, 1);
            }
        }

        end = grid[grid.length - 1];
        

        for (let i = enemies.length - 1; i >= 0; i--) {
            enemies[i].update();
            enemies[i].show();

            // Check for player collision
            if (enemies[i].i === player.i && enemies[i].j === player.j) {
                noLoop();
                fill(255);
                textSize(32);
                textAlign(CENTER, CENTER);
                text("You Lose!", width / 2, height / 2);
            }
        }
        //This is for seeing if pathing is being drawn
        // for (let i = 0; i < enemies.length; i++) {
        //     if (enemies[i].path) {
        //         for (let p of enemies[i].path) {
        //             fill(0, 0, 255, 100);
        //             rect(p.i * w, p.j * w, w, w);
        //         }
        //     }
        // }
    }
    
}


function index(i , j ){
    if(i < 0 || j < 0 || i > cols - 1 || j > rows - 1){
       return -1; 
    }
    return i + j * cols;
}

/*This is a Maze genaration Function*/
function Cell(i , j){
    this.i = i;
    this.j = j;
    this.walls = [true, true, true, true]; //Top, right, bottom ,left
    this.visited = false;
    
    /*Adding A* pathfinding*/
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.previous = undefined;

    this.neighbours = [];

    this.addNeighbours = function() {
        let top = grid[index(i, j - 1)];
        let right = grid[index(i+1, j )];
        let left = grid[index(i-1, j )];
        let bottom = grid[index(i, j+1 )];

        if(top && !this.walls[0]) this.neighbours.push(top);
        if(right && !this.walls[1]) this.neighbours.push(right);
        if(bottom && !this.walls[2]) this.neighbours.push(bottom);
        if(left && !this.walls[3]) this.neighbours.push(left);
    };

    // End of A*
    this.show = function(){
        var x = this.i*w;
        var y = this.j*w;
        stroke(255);
        if(this.walls[0]) line(x, y, x+w, y);
        if (this.walls[1]) line(x+w, y, x+w, y+w);
        if (this.walls[2]) line(x+w, y+w, x, y+w);
        if (this.walls[3]) line(x, y+w, x, y);
        
        if(this.visited){
            noStroke();
            fill(255,0,255,100);
            rect(x,y,w,w);
        }
    };
        
        this.checkNeighbours = function(){
            var neighbours = [];

            var top = grid[index(i, j - 1)];
            var right = grid[index(i+1,j)];
            var bottom = grid[index(i,j+1)];
            var left = grid[index(i-1,j)];

            if(top && !top.visited){
                neighbours.push(top);
            }
            if(right && !right.visited){
                neighbours.push(right);
            }
            if(bottom && !bottom.visited){
                neighbours.push(bottom);
            }
            if(left && !left.visited){
                neighbours.push(left);
            }

            if(neighbours.length > 0){
                var r  = floor(random(0, neighbours.length));
                return neighbours[r];
            }
            else return undefined;
        };
        

}

function removeWalls(a, b){
    var x = a.i -b.i;
    if(x === 1) {
        a.walls[3] = false;
        b.walls[1] = false;
    }
    else if(x === -1){
        a.walls[1] = false;
        b.walls[3] = false;
    }
    var y = a.j - b.j;
    if(y === 1) {
        a.walls[0] = false;
        b.walls[2] = false;
    }
    else if(y === -1){
        a.walls[2] = false;
        b.walls[0] = false;
    }
}

/*This is our Player movement script*/

function keyPressed(){
    if(keyCode === UP_ARROW){
        let next = grid[index(player.i, player.j - 1)];
        if(next && !player.walls[0]){
            player = next;
        }
        
    }else if(keyCode === DOWN_ARROW){
        let next = grid[index(player.i, player.j + 1)];
        if(next && !player.walls[2]){
            player = next;
        }
        
    }
    else if(keyCode === RIGHT_ARROW){
        let next = grid[index(player.i + 1, player.j)];
        if(next && !player.walls[1]){
            player = next;
        }
        
    }else if(keyCode === LEFT_ARROW){
        let next = grid[index(player.i - 1, player.j)];
        if(next && !player.walls[3]){
            player = next;
        }
        
    }

    //The following code is for mapping keybinds for bullets (WASD)

    let now = millis();
    if(now - lastShot > cooldown){
        lastShot = now;
        if(key === 'W' || key === 'w'){
            bullets.push(new Bullet(player.i * w + w / 2, player.j * w + w / 2, 'UP'));
        } else if(key === 'S' || key === 's'){
            bullets.push(new Bullet(player.i * w + w / 2, player.j * w + w / 2, 'DOWN'));
        } else if(key === 'A' || key === 'a'){
            bullets.push(new Bullet(player.i * w + w / 2, player.j * w + w / 2, 'LEFT'));
        } else if(key === 'D' || key === 'd'){
            bullets.push(new Bullet(player.i * w + w / 2, player.j * w + w / 2, 'RIGHT'));
        }
    }
}

/*Bullets that will be shot by the Player to kill enemies */
function Bullet(x, y , dir){
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.dead = false;
    this.update = function(){
        //Bullet Movement
        if(this.dir === 'UP') this.y -= bulletSpeed;
        else if (this.dir === 'DOWN') this.y += bulletSpeed;
        else if(this.dir === 'LEFT') this.x -= bulletSpeed;
        else if(this.dir === 'RIGHT') this.x += bulletSpeed;

        //Figureing out the position of bullet
        let col = floor(this.x / w);
        let row = floor(this.y/ w);
        let cell = grid[index(col,row)];

        if(!cell){
            this.dead = true;
            return;
        }
        //check for wall collision
        if(
            (this.dir === 'UP' && cell.walls[0]) ||
            (this.dir === 'RIGHT' && cell.walls[1]) ||
            (this.dir === 'DOWN' && cell.walls[2]) ||
            (this.dir === 'LEFT' && cell.walls[3])
        ){
            this.dead = true;
            return;
        }
        
    }

    this.show =  function() {
        fill(255,255,0);
        noStroke();
        ellipse(this.x,this.y, 8);
    }

    this.offscreen = function() {
        return (this.x < 0 || this.x > width || this.y < 0 || this.y > height);
    }
}

/*Enemy Class*/
function Enemy(i, j){
    this.i = i;
    this.j = j;

    this.moveCooldown = 500; // ms between moves
    this.lastMoveTime = 0;
    
    this.spawnTime = millis();  // time enemy was created

    this.show = function() {
        fill(255, 0 , 0);
        noStroke();
        ellipse(this.i * w + w / 2, this.j * w + w / 2, w * 0.5);
    };

    this.update = function(){
        // Wait 2 seconds after spawn before moving
        if(millis() - this.spawnTime < 2000) return;

        let now = millis();
        if(now - this.lastMoveTime < this.moveCooldown) return; // wait for cooldown

        let startCell = grid[index(this.i, this.j)];
        let endCell = grid[index(player.i, player.j)];

        this.path = astar(startCell, endCell);

        if (this.path && this.path.length > 0) {
            let nextStep = this.path[0];
            // Don't move onto the player's cell to avoid instant kill
            //if (!(nextStep.i === player.i && nextStep.j === player.j)) {
                this.i = nextStep.i;
                this.j = nextStep.j;
            //}
        }

        this.lastMoveTime = now;
    };

    this.isHit = function(x ,y){
        let cx = this.i * w + w / 2;
        let cy = this.j * w + w / 2;
        return dist(cx, cy, x, y) < w/2;
    };
}

/*This is a Astar function which i will be defining for enemy*/
function astar(start, end){
    let openSet = [];
    let closedSet = [];
    openSet.push(start);

    for(let i = 0; i < grid.length; i++){
        grid[i].f = 0;
        grid[i].g = 0;
        grid[i].h = 0;
        grid[i].previous = undefined;
    }

    while(openSet.length > 0){
        let winner = 0;
        for(let i = 0; i < openSet.length; i++){
            if(openSet[i].f < openSet[winner].f){
                winner = i;
            }
        }

        let current = openSet[winner];

        if(current === end){
            let path = [];
            let temp = current;
            while(temp.previous){
                path.push(temp);
                temp = temp.previous;
            }
            return path.reverse();
        }
    

        openSet.splice(winner, 1);
        closedSet.push(current);

        let neighbours = current.neighbours;
        for(let i = 0; i < neighbours.length; i++){
            let neighbour = neighbours[i];
            if(!closedSet.includes(neighbour)){
                let tempG = current.g + 1;
                let newPath = false;

                if(openSet.includes(neighbour)){
                    if(tempG < neighbour.g){
                        neighbour.g = tempG;
                        newPath = true;
                    }
                }else{
                    neighbour.g = tempG;
                    newPath = true;
                    openSet.push(neighbour);
                }

                if(newPath){
                    neighbour.h = dist(neighbour.i, neighbour.j, end.i, end.j);
                    neighbour.f = neighbour.g + neighbour.h;
                    neighbour.previous = current;
                }
            }
        }
    }

    return [];
}
