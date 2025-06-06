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

function draw(){
    background(51);
    for(var i = 0; i < grid.length; i++){
        grid[i].show();
    }
    //step 1
    current.visited = true;
    var next = current.checkNeighbours();
    if(next){
        next.visited = true;

        //step 2
        stack.push(current);
        //step 3
        removeWalls(current, next);
        current = next;
    }else if(stack.length > 0){
        current = stack.pop();
    }

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
        }
        
    }
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

    //The following code is for mapping keybinds for bullets (Spacebar + Direction)

    if(keyCode === 32){
        let now = millis();
        if(now - lastShot > cooldown){
            lastShot = now;
            if(keyIsDown(UP_ARROW)){
            bullets.push(new Bullet(player.i * w + w / 2, player.j * w + w / 2, 'UP'));
            }else if(keyIsDown(DOWN_ARROW)){
                bullets.push(new Bullet(player.i * w + w / 2, player.j * w + w / 2, 'DOWN'));
            }else if(keyIsDown(LEFT_ARROW)){
                bullets.push(new Bullet(player.i * w + w / 2, player.j * w + w / 2, 'LEFT'));
            }else if(keyIsDown(RIGHT_ARROW)){
                bullets.push(new Bullet(player.i * w + w / 2, player.j * w + w / 2, 'RIGHT'));
            }
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

    this.show = function() {
        fill(255, 0 , 0);
        noStroke();
        ellipse(this.i * w + w / 2, this.j * w + w / 2, w * 0.5);
    };

    this.update = function(){
        //Chase function
        let di = player.i - this.i;
        let dj = player.j - this.j;

        if(abs(dj) > abs(di)){
            if(dj > 0 && !grid[index(this.i, this.j)].walls[2]){
                this.j++;
            }else if(dj < 0 && !grid[index(this.i, this.j)].walls[0]){
                this.j--;
            }
        }else{
            if(di > 0 && !grid[index(this.i, this.j)].walls[1]){
                this.i++;
            }else if(di < 0 && !grid[index(this.i, this.j)].walls[3]){
                this.i--;
            }
        }
    };
    
    this.isHit = function(x ,y){
        let cx = this.i * w + w / 2;
        let cy = this.j * w + w / 2;
        return dist(cx, cy, x, y) < w/2;
    };
}