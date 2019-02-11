'use strict'
let canvas;
let draw;
let loop = gameLoop;
let objects = [];
let delta = 0;
let deltaTime;
let running = true;
window.onload = initializeCanvas;
//window.addEventListener('DOMContentLoaded', initializeCanvas);

function initializeCanvas(){
    canvas = document.getElementById('gameArea');
    draw = canvas.getContext('2d');
    setBackground('#FF0000');
    
    
    drawSquare(20,20, 20, 20, '#FFFFFF');
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
            objects[0].draw.posx -= (100 * deltaTime);
        }
        else if (e.key == 'd')
        {
            objects[0].draw.posx += (100 * deltaTime);
        }
        if (e.key === 'w')
        {
            objects[0].draw.posy += (100 * deltaTime);
        }
        else if (e.key == 's')
        {
            objects[0].draw.posy += (-100 * deltaTime);
        }
        if (e.key === 'e')
        {
            
            //objects[0].draw.rotation += 10;
            //console.log(objects[0].draw.rotation);
            let g = new gameObject();
            g.draw = drawSquare(objects[0].draw.posx, objects[0].draw.posy,
                10, 10, '#0000FF');
            g.update.push(velocityToMovements);
            g.velocity[0] = 1;
            //g.update.push(checkPosition(g));
        }
        
    }
}
function initGame()
{
    let player = new gameObject();
    player.draw = drawSquare(20, 20);
    player.update.push(checkPosition);
    //player.update.push(gravity);
    //player.update.push(velocityToMovement);
    
    
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
    console.log(this);
    objects.push(this);
}
let deltaEnd = 0;
function gameLoop()
{
    let waitTime = performance.now() - deltaEnd;
    let deltaStart = performance.now() - waitTime;
    update();
    drawScene();
    deltaEnd = performance.now();
    delta = deltaEnd - deltaStart;
    deltaTime = delta/1000;
    //console.log(delta);
    if(running);
    requestAnimationFrame(gameLoop);
    
}
function update()
{
    for (let obj of objects)
    {
        for (let functions of obj.update)
        {
            functions(obj);
            
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
        }
    }
}
function drawScene(){
    draw.clearRect(0,0,canvas.width,canvas.height);
    reDrawBackground();
    for(let i of objects)
    {
        //console.log(i);
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
function gravity(object)
{
    // if (object.draw.posy > 5 && object.velocity[1] > (-120))
    // object.velocity[1] = object.velocity[1] - ((2 * (9.8 * 9.8))* (delta/100));
    // else if (object.velocity[1] < 0)
    // {
    //     object.velocity[1] = 0;
    // }
        
    
}
function velocityToMovements(object)
{
    object.draw.posx += object.velocity[0] * delta;
    object.draw.posy += object.velocity[1] * delta;

    if(object.draw.posy < 5)
    {
        object.draw.posy = 5;
        //object.velocity[1] = 0;
    }
    console.log(object.velocity[1]);
}
function screenSpaceToWorldSpace(posy)
{
    
    return canvas.height - posy;
}


