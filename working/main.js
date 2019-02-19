'use strict'
let canvas;
let draw;
let loop = gameLoop;
let objects = [];
let delta = 0;
let deltaTime;
let running = true;
let mouseX;
let mouseY;
let tileset;
let currentGameMap;
let deltaEnd = 0;
let symTest;
let pew = new Audio('pew.mp3');
let pain = new Audio('pain.mp3');
let score = 0;
let scoreObject;
let mainPlayer;
let playerHealthObject;

window.onload = initializeCanvas;
//window.addEventListener('DOMContentLoaded', initializeCanvas);

function initializeCanvas(){
    document.getElementById('file-form').addEventListener('submit',formSubmit);
    score = 0;
    canvas = document.getElementById('gameArea');
    canvas.addEventListener('mousemove', onMouseMove);
    draw = canvas.getContext('2d');
    setBackground('#FF0000');
    tileset = document.getElementById('tileset');
    currentGameMap = new gameMap();
    currentGameMap.initialize();
    drawSquare(20,20, 20, 20, '#FFFFFF');
    scoreObject = document.getElementById('score');
    scoreObject.innerText = `Current Score: ${score}`;
    playerHealthObject = document.getElementById('player-health');
    checkColliders = new checkColliders();
    initGame();
    initInput();
    
    requestAnimationFrame(gameLoop);
    
}
function initInput()
{
    window.onkeydown = (e) =>{
        if (e.key === 'Escape')
        {           
            running = false;
        }
        if (e.key === 'a')
        {
            objects[0].velocity[0] = -1;
        }
        else if (e.key == 'd')
        {
            objects[0].velocity[0] = 1;
        }
        if (e.key === 'w')
        {
            objects[0].velocity[1] = 1;
        }
        else if (e.key == 's')
        {
            objects[0].velocity[1] = -1 ;
        }
        if (e.key === 'e')
        {
            
            //objects[0].draw.rotation += 10;
            //console.log(objects[0].draw.rotation);
            let g = new gameObject();
            g.draw = drawSquare(objects[0].draw.posx + 15, objects[0].draw.posy -15,
                10, 10, '#0000FF');
            g.update.push(destroyAfterTime(5));
            g.update.push(velocityToMovements);
            g.collider = new boxCollider(g);
            //g.collider.isTrigger = true;
            g.collider.ignore = objects[0].collider.identify;
            g.collider.isTrigger = true;
            g.triggerBehaviors.push(new decreaseHealth(50, true));
            g.triggerBehaviors.push(destroyOnTrigger(g));
            let vec = normalizedVectorBetween(objects[0].draw.posx + 15, 
                objects[0].draw.posy -15,
                mouseX, mouseY);
            g.velocity[0] = vec.posx;
            g.velocity[1] = vec.posy;
            pew.pause();
            pew.currentTime = 0;
            pew.play(); 
            //g.update.push(checkPosition(g));
        }
        if (!running)
        {
            if (e.key === ' ')
            {
                objects = [];
                running = true;
                initGame();
                deltaEnd = performance.now();
                delta = 0;
                requestAnimationFrame(gameLoop);
                document.getElementById('score').innerHTML = 'Current Score: 0';

            }
        }
        
    };
    window.onkeyup = (e) =>{
        
        if (e.key ==='w')
        {
            objects[0].velocity[1] = 0;
        }
        else if (e.key === 's')
        {
            objects[0].velocity[1] = 0;
        }
        if (e.key === 'a')
        {
            objects[0].velocity[0] = 0;
        }
        else if (e.key === 'd')
        {
            objects[0].velocity[0] = 0;
        }
    };
}
function initGame()
{
    score = 0;
    //console.log(checkColliders.emptyArray);
    checkColliders.setArrays();


    let player = new gameObject();
    player.draw = drawSquare(32, 32, 32, 32);
    //player.update.push(checkPosition);
    player.magnitude = 0.1;
    //player.update.push(gravity);
    player.update.push(velocityToMovements);
    player.collider = new boxCollider(player);
    //player.collisionBehaviors.push(new decreaseHealth(1,false));
    mainPlayer = player;
    
    let other = new gameObject();
    other.draw = drawSquare(300,300,32,32);
    other.collider = new boxCollider(other);
    other.update.push(velocityToMovements);
    other.update.push(new moveTowards(objects[0], 0.05));
    other.collisionBehaviors.push(new decreaseHealth(1,false, objects[0]));

    let spawn =  new gameObject();
    spawn.update.push(new spawner(other, 3));
    // symTest = other.collider.identify;

    //checkColliders.drawCollider(other.collider);
    //console.log(other.collider.identify == player.collider.identify);
    
}

function setBackground(color)
{
    canvas.backgroundColor = color;
    draw.beginPath();
    draw.rect(0, 0, canvas.width, canvas.height);
    draw.fillStyle = canvas.backgroundColor;
    draw.fill();
    draw.closePath();
    
}
function reDrawBackground()
{
    setBackground(canvas.backgroundColor);
}
function resize(width, height)
{
    canvas.width = width;
    canvas.height = height;
    setBackground(canvas.backgroundColor);
}

function drawSquare(posx = 0, posy = 0, width = 10, height = 10, color = '#FFFFFF',
    rotation = 0)
{
    
    draw.beginPath();
    //draw.rotate(rotation);
    draw.rect(posx, posy, width, height);
    draw.fillStyle = color;
    draw.fill();
    draw.closePath();
    let dimensions = [];
    dimensions.posx = posx;
    dimensions.posy = posy;
    dimensions.width = width;
    dimensions.height = height;
    //dimensions.rotation = rotation;
    dimensions.color = color;
    return dimensions; 
      
}
function gameObject()
{
    this.draw = null;
    this.hidden = false;
    this.update = [];
    this.layer = 7;
    this.velocity = [0,0];
    this.remove = false;
    this.health = 100;
    this.magnitude = 1;
    this.checkCollision = true;
    this.collider;
    this.triggerBehaviors = [];
    this.collisionBehaviors = [];
    //console.log(this);
    objects.push(this);
}
function gameLoop()
{
    let waitTime = performance.now() - deltaEnd;
    let deltaStart = performance.now() - waitTime;
    update();
    drawScene();
    checkColliders.clearHistory();
    deltaEnd = performance.now();
    delta = deltaEnd - deltaStart;
    deltaTime = delta/1000;
    //console.log(delta);
    if(running){
    requestAnimationFrame(gameLoop);
    }
    else{
        gameOver();
    }
    
}
function gameOver()
{
    //drawSquare(0, 0, canvas.width, canvas.height, '#FF0000');
    draw.font = '30px Arial';
    draw.fillText(`Game Over`,0,30);
    draw.fillText(`Score: ${score}`,0, 60);
    draw.fillText(`Press Space to Reset`,0,90);
}
function update()
{
    //console.log(deltaTime);
    for (let obj of objects)
    {
        for (let functions of obj.update)
        {
            functions(obj);
            //console.log(obj);
        }
    }
    for (let x = 0; x < objects.length; x++)
    {
        if(!objects[x].remove)
        {
            continue;
        }
        else{
            objects = objects.slice(0, x).concat(objects.slice(x+1, objects.length));
            console.log(objects);
        }
    }
    if (mainPlayer===null)
    {
        running = false;
        playerHealthObject.innerText = `Player Health: ${0}`;
    }
    else if(mainPlayer.health <= 0){
        running = false;
        playerHealthObject.innerText = `Player Health: ${0}`;
    }
    else{
        playerHealthObject.innerText = `Player Health: ${mainPlayer.health}`;
    }
    
    

}
function drawScene(){
    draw.clearRect(0,0,canvas.width,canvas.height);
    currentGameMap.draw();
    //reDrawBackground();
    // draw image (image, grab image start, grab image start, grab how many, grab how many
    // position on screen, position on screen, how big to draw, how big to draw)
    //draw.drawImage(tileset,32,32, 32, 32, 256, 256 ,32 ,32);
    for(let i of objects)
    {
        //console.log(i);
        if(i.draw != null)
        drawSquare(i.draw.posx, 
            screenSpaceToWorldSpace(i.draw.posy), i.draw.width, i.draw.height,
             i.draw.color, i.rotation);
        
    }
}
function checkPosition(o)
{
    if( o.draw.posx < -100 || o.draw.posx > canvas.width)
    {
        o.remove = true;
        o = null;
        console.log(o);

    }
    else if (o.draw.posy < -100 || o.draw.posy > canvas.height)
    {
        o.remove = true;
        o = null;
    }
    //console.log(o);
}
function velocityToMovements(object)
{
    if (object.collider && inBounds(object.collider)){
    let colliderHold = new boxCollider(object);
     colliderHold.identify = object.collider.identify;
     colliderHold.position[0] = object.collider.position[0];
     colliderHold.position[1] = object.collider.position[1];
     colliderHold.size[0] = object.collider.size[0];
     colliderHold.size[1] = object.collider.size[1];
     colliderHold.isTrigger = object.collider.isTrigger;
     colliderHold.ignore = object.collider.ignore;

    colliderHold.position[0] += (object.velocity[0] * delta * object.magnitude);
    colliderHold.position[1] += (object.velocity[1] * delta * object.magnitude);
        
        let result = checkColliders.check(colliderHold);
        //console.log(result);
        if (!result)
        {
            //console.log('test');
            
            object.collider = colliderHold;
            object.draw.posx = object.collider.position[0];
            object.draw.posy = object.collider.position[1];
        }
        else if (object.collider.isTrigger)
        {
            let triggeringObject = objectLookup(result[2]);
            //console.log('hit');
            for (let x of object.triggerBehaviors)
            {
                try {
                x(triggeringObject);
                }
                catch(e)
                {
                    console.log(e);
                }
            }
            object.collider = colliderHold;
            object.draw.posx = object.collider.position[0];
            object.draw.posy = object.collider.position[1];
        }
        else{
            let collidingObject = objectLookup(result[2]);

            for (let x of object.collisionBehaviors)
            {
                try{
                x(collidingObject);
                }
                catch(e)
                {

                }
            }
        }
    }
    else
    {
    object.draw.posx += (object.velocity[0] * delta * object.magnitude);
    object.draw.posy += (object.velocity[1] * delta * object.magnitude);
    
    }
    //console.log(deltaTime);
    //console.log(object.magnitude);
    

    if(object.draw.posy < 5)
    {
        object.draw.posy = 5;
        //object.velocity[1] = 0;
    }
   // console.log(object.velocity[1]);
}
function kinematicObject(object)
{
    //console.log('here');
    
    checkColliders.drawCollider(object.collider);
}
function screenSpaceToWorldSpace(posy)
{
    
    return canvas.height - posy;
}
function onMouseMove(event)
{
    if(event.offsetX)
    {
        mouseX = event.offsetX;
        mouseY = canvas.height - event.offsetY;
    }
    else if(event.layerX)
    {
        mouseX = event.layerX;
        mouseY = event.layerY;
    }
    //console.log(mouseY);
}
function normalizedVectorBetween(posx1, posy1, posx2, posy2)
{
    let vector = {};
    vector.posx = posx2 -posx1;
    vector.posy = posy2 - posy1;
    vector.magnitude = Math.sqrt((vector.posx * vector.posx)
     + (vector.posy * vector.posy));
     
     vector.posx = vector.posx/vector.magnitude;
     vector.posy = vector.posy/vector.magnitude;
     //console.log(vector.posy);
     vector.magnitude = 1;

    return vector;
}
function destroyAfterTime(time)
{
    let t = time;
    return (obj) => {
        t = t - deltaTime;
        if (t <= 0)
        {
            obj.remove = true;
            //console.log('removing');
        }
    };
}
function gameMap(){
    this.gMap = [];
    this.draw = () =>
    {
        for (let x = 0; x < 12; x++)
        {
            
            for(let y = 0; y < 12; y++)
            {
                draw.drawImage(tileset,
                    this.getXLocation(this.gMap[x][y])*32,this.getYLocation(this.gMap[x][y])*32, 
                    32, 32, x*32, y*32, 32, 32);
            }
        }
    }
    this.initialize = (file = null) =>
    {
        //console.log(this.gMap);
        if (file)
        {
            let row = file.split(':');
            let newMap = [];
            row.shift();
            for (let c of row)
            {
                newMap.push(c.split(','));
            }
            this.gMap = newMap;
            
        }
        else{
            for (let x = 0; x < 12; x++)
            {
                let hold = [];
                //console.log(this.gMap);
                for (let y = 0; y < 12; y++)
                {
                 hold.push(0);
                }
                this.gMap.push(hold);
            }
        }
    }
    this.getXLocation = (tileNumber) =>
    {
        return (tileNumber - (12 * Math.floor(tileNumber/12))); 
    };
    this.getYLocation = (tileNumber) =>
    {
        return (Math.floor(tileNumber/12));
    }
}
function formSubmit(e)
{
    let f = new FileReader();
    let r;
    f.readAsText(document.getElementById('level-file').files[0]);

    f.onload = (result) =>{
        currentGameMap.initialize(f.result);
    }
    //f.readAsText(document.getElementById('level-file').files[0], r);
    //currentGameMap.initialize(e.fil)
    //console.log(r);
    e.preventDefault();
}
function boxCollider(obj = null){
    this.identify = Symbol(obj);
    this.position = [obj.draw.posx, obj.draw.posy];
    this.size = [obj.draw.width, obj.draw.height];
    this.obj = obj;
    this.isTrigger = false;
    this.ignore = null;
    this.COLLISION_UP = false;
    this.COLLISION_DOWN = false;
    this.COLLISION_LEFT = false;
    this.COLLISION_RIGHT = false;
    
}
function inBounds(collider)
{
    if (collider.position[0] > canvas.width || collider.position < canvas.width || collider.position[1] > canvas.height
        || collider.position[1] < canvas.height)
        {
            return true;
        }
        return false;
}

var checkColliders = function(){
    this.accuracy = 1; // numbers that will work for this include 1, 2, 4, 8, 16 ,32
    this.collisionArea;
    this.colliders = [];
    this.check = (collider) =>
    {
        // check for collisions, if none draw
        let posX = Math.ceil(collider.position[0]/this.accuracy); let posY = Math.ceil(collider.position[1]/this.accuracy);
        let sizeX = Math.ceil(collider.size[0]/this.accuracy); let sizeY = Math.ceil(collider.size[1]/this.accuracy);
        //console.log(collider);
        if (posX + sizeX >= (canvas.width / this.accuracy) || posY + sizeY >= (canvas.height / this.accuracy) || posX < 0 || posY < 0)
        {
            return null;
        }
            for (let x = posX; x < (posX + sizeX); x++)
            {
                for (let y = posY; y < (posY + sizeY); y++)
                {
                    if (this.collisionArea[x][y] === 0 || collider.identify === this.collisionArea[x][y] 
                        || this.collisionArea[x][y] === collider.ignore)
                    {
                        //console.log('yay');
                        
                    }
                    else { // there was a collision so return the location and symbol, and let the object handle it.
                        
                        //console.log(this.collisionArea);
                        return [x,y, this.collisionArea[x][y]];
                    }
                }
            }
            // nothing returned yet means no collision, so draw the collider
            if(!collider.isTrigger){
            this.drawCollider(collider);
            }
            //console.log(this.collisionArea);
            return null;
        
    };
    this.drawCollider = (collider) =>
    {
        let posX = Math.ceil(collider.position[0]/this.accuracy); let posY = Math.ceil(collider.position[1]/this.accuracy);
        let sizeX = Math.ceil(collider.size[0]/this.accuracy); let sizeY = Math.ceil(collider.size[1]/this.accuracy);
        debugger;
        for (let x = posX; x < (posX + sizeX); x++)
            {
                for (let y = posY; y < (posY + sizeY); y++)
                {
                    //console.log(`modifying ${x} and ${y}: ${this.collisionArea[x,y] === symTest}`);
                    this.collisionArea[x][y] = collider.identify;
                    this.clearColliderArea[x][y] = collider.identify;
                }
            }
    };
    this.clearHistory = () =>
    {
        // The clearColliderArea variable is from the current frame drawing only
        // since it doesn't contain last frames collisions, it cannot be used to detect collision
        // but since it only has this frames collisions, it can be used to clear last frames collisions.
        for(let x = 0; x < this.collisionArea.length; x++)
        {
            for (let y = 0; y < this.collisionArea[x].length; y++)
            {
                if (this.collisionArea[x][y] != this.clearColliderArea[x][y])
                {
                    this.collisionArea[x][y] = 0;
                }
            }
        }
        // after we get rid of last frames collisions, we must now get rid of this frames collisions to get ready for the
        // next frame.
        this.clearColliderArea = JSON.parse(JSON.stringify(this.emptyArray));
    };
    this.setArrays = () =>
    {
        this.collisionArea = Array(canvas.width/this.accuracy).fill(Array(canvas.height/this.accuracy).fill(0));
        this.clearColliderArea = JSON.parse(JSON.stringify(this.collisionArea));
        this.emptyArray = JSON.parse(JSON.stringify(this.collisionArea));
        this.collisionArea = JSON.parse(JSON.stringify(this.collisionArea));
        
    };
    this.clearColliderArea;
    this.emptyArray;
};
function zeroArray(arr)
{
    

    for (let x = 0; x < arr.length; x++)
    {
        for (let y = 0; y < arr[x].length; y++)
        {
            arr[x][y] = 0;
        }
    }
    return arr;
}
function decreaseHealth(amount = 20, addToScore = true, target = null)
{
    this.amount = amount;
    this.target = target;
    if (this.target)
    {
        return (obj) =>{
            if (obj.collider.identify === target.collider.identify){
            obj.health -= this.amount;
        if (obj.health <= 0)
        {
            obj.remove = true;
            if(addToScore){
            score += 20;
            scoreObject.innerText = `Current Score: ${score}`;
            }
        }
        pain.pause();
        pain.currentTime = 0;
        pain.play();
        }
    }
    }
    else{
    return (obj) => {
    obj.health -= this.amount;
    if (obj.health <= 0)
    {
        obj.remove = true;
        if(addToScore){
        score += 20;
        scoreObject.innerText = `Current Score: ${score}`;
        }
    }
    pain.pause();
    pain.currentTime = 0;
    pain.play();
}
}
}
function objectLookup(symbol)
{
    for (let x of objects)
    {
        if(x.collider != null)
        if (x.collider.identify === symbol)
        {
            return x;
        }
    }
    return null;
}
function destroyOnTrigger(obj)
{
    let object = obj;
    return () =>
    {
        object.remove = true;
    }
}
function spawner(obj, q = 3)
{
    this.mainObject = obj;
    this.quantity = q;
    this.createObject = (posX, posY) =>
    {
        let x = new gameObject();
        x.update = this.mainObject.update;
        x.draw = drawSquare(posX, posY, obj.draw.width, obj.draw.height, '#00FFFF');
        console.log(posX);
        x.collider = new boxCollider(x);
        x.collisionBehaviors = this.mainObject.collisionBehaviors;
        return x;
    };
    this.controlledObjects = [];
    for (let x = 0; x < this.quantity; x++)
    {
        this.controlledObjects[x] = this.createObject(x*100,100 + (Math.random() * 200));
    }
    return () => {
        
        for (let x = 0; x < this.quantity; x++)
    {
        if (this.controlledObjects[x].remove)
        {
        this.controlledObjects[x] = this.createObject(x*100, 100 + (Math.random() * 200));
        //console.log(x);
        }
        console.log(this.controlledObjects[x]);
    }
    };
}
function moveTowards( target, speed)
{
    this.target = target;
    this.speed = speed;
    return (obj) => {
        let vec = normalizedVectorBetween(obj.draw.posx, obj.draw.posy, 
            this.target.draw.posx, this.target.draw.posy);
            obj.velocity[0] = vec.posx * speed;
            obj.velocity[1] = vec.posy * speed;
    }
}



