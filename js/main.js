"use strict";
const app = new PIXI.Application(600,400);
document.addEventListener("DOMContentLoaded", DOMLoaded, false);
function DOMLoaded() {
    document.querySelector("#game").appendChild(app.view);
    setup();
}
// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;	

let startOverlay = [];

// aliases
let stage;

let keys = {};

// game variables
let startScene;
let gameScene,player,scoreLabel,lifeLabel,shootSound,hitSound;
let gameOverScene;

let startStars = [];
let stars = [];
let bullets = [];
let starChunks = [];
let score = 0;
let life = 100;
let spawnCooldown = 0;
let paused = true;

let scoreText;

function setup() {
    stage = app.stage;
    app.renderer.backgroundColor = 0x595557;

	// #1 - Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    // #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

	// #3 - Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);
    
    // #4 - Create labels for all 3 scenes
    createLabelsAndButtons();
    createBorder();
	
	// #5 - Create ship
    player = new Player(sceneWidth/2, sceneHeight/2);
    gameScene.addChild(player);

	// #6 - Load Sounds
    
	// #7 - Load sprite sheet

	// #8 - Start update loop
    app.ticker.add(gameLoop);
    
	//Start listening for click events on the canvas
    app.view.onclick = fireBullet;

    //Set up keyboard listeners
    window.addEventListener("keydown", keysDown);
    window.addEventListener("keyup", keysUp);

    decreaseLifeBy(0);
    increaseScoreBy(0);
    
	// Now our `startScene` is visible
    // Clicking the button calls startGame()
}

function createLabelsAndButtons(){
    let buttonStyle = new PIXI.TextStyle({
        fill: 0x595557,
        fontSize: 48,
        fontFamily: 'Arial',
        fontStyle: "bold",
        stroke: 0xF2EAD2,
        strokeThickness: 6
    });

    let startLabel1 = new PIXI.Text("Astral Janitor");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xF2EAD2,
        fontSize: 72,
        fontFamily: 'Arial',
        fontStyle: 'bold',
        stroke: 0x595557,
        strokeThickness: 4
    });
    startLabel1.x = 65;
    startLabel1.y = 30;
    startScene.addChild(startLabel1);
    startOverlay.push(startLabel1);

    let startLabel2 = new PIXI.Text("Clean up the galaxy!");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xF2EAD2,
        fontSize: 32,
        fontFamily: 'Arial',
        fontStyle: 'italic',
        stroke: 0x595557,
        strokeThickness: 2.5
    });
    startLabel2.x = 140;
    startLabel2.y = 130;
    startScene.addChild(startLabel2);
    startOverlay.push(startLabel2);

    let startButton = new PIXI.Text("Start Game");
    startButton.style = buttonStyle;
    startButton.x = 160;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup",startGame);
    startButton.on("pointerover",e=>e.target.alpha = 0.7);
    startButton.on("pointerout",e=>e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton);
    startOverlay.push(startButton);

    lifeLabel = new PIXI.Text("");
    lifeLabel.style = new PIXI.TextStyle({
        fill: 0xF2EAD2,
        fontSize: 12,
        fontFamily: 'Arial',
        stroke: 0x595557,
        strokeThickness: 1
    });
    lifeLabel.x = 10;
    lifeLabel.y = 10;

    scoreLabel = new PIXI.Text("");
    scoreLabel.style = new PIXI.TextStyle({
        fill: 0xF2EAD2,
        fontSize: 12,
        fontFamily: 'Arial',
        stroke: 0x595557,
        strokeThickness: 1
    });
    scoreLabel.x = 10;
    scoreLabel.y = 30;

    gameScene.addChild(lifeLabel);
    gameScene.addChild(scoreLabel);
}

function createBorder() {
    let border = new PIXI.Graphics;
    border.beginFill(0xFFFFFF, 0);
    border.lineStyle(1,0xBEBBBB,1);
    border.drawRect(1,0,599,399);
    border.endFill();
    border.x = 0;
    border.y = 0;
    startScene.addChild(border);
    startOverlay.push(border);

    border = new PIXI.Graphics;
    border.beginFill(0xFFFFFF, 0);
    border.lineStyle(1,0xBEBBBB,1);
    border.drawRect(1,0,599,399);
    border.endFill();
    border.x = 0;
    border.y = 0;
    gameScene.addChild(border);

    border = new PIXI.Graphics;
    border.beginFill(0xFFFFFF, 0);
    border.lineStyle(1,0xBEBBBB,1);
    border.drawRect(1,0,599,399);
    border.endFill();
    border.x = 0;
    border.y = 0;
    gameOverScene.addChild(border);
}

function startGame(){
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    paused = false;
    score = 0;
    life = 100;
    increaseScoreBy(0);
    decreaseLifeBy(0);
}

function increaseScoreBy(value){
    score += value;
    score = parseInt(score);
    scoreLabel.text = `Score: ${score}`
}

function decreaseLifeBy(value){
    life -= value;
    life = parseInt(life);
    lifeLabel.text = `Life:  ${life}%`
}

function gameLoop(){
    // Calculate "delta time"
	let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;
    
    if (!gameScene.visible){ 
        if(startScene.visible){
            reorderStartScene();
            handleStartStars(dt);
            for(let s of startStars){
                s.move();
            }
        }
        return;
    }

    //Spawn stars
    if(spawnCooldown > 0){
        spawnCooldown -= dt;
    }
    else{
        spawnCooldown = 1
        spawnStar();
    }

    // Move PLayer
    let playerMove = {x:0, y:0}
    if(keys["87"]){
        playerMove.y-=1;
    }
    if(keys["83"]){
        playerMove.y+=1;
    }
    if(keys["68"]){
        playerMove.x+=1;
    }
    if(keys["65"]){
        playerMove.x-=1;
    }

    if(playerMove.x != 0 && playerMove.y != 0){
        let magnitude = Math.sqrt(playerMove.x*playerMove.x + playerMove.y*playerMove.y);
        playerMove.x /= magnitude;
        playerMove.y /= magnitude;
    }
    player.move(dt, playerMove)
	
	// #3 - Move stars
	for (let s of stars){
        if(s.endAngle == s.startAngle + Math.PI){
            s.isAlive = false;
            gameScene.removeChild(s);
            gameScene.removeChild(s.center);
            gameScene.removeChild(s.startArc);
            gameScene.removeChild(s.endArc);
            createExplosion(s.x,s.y,s.colorSet.centerColor);
        }
        s.move(dt);
        if(s.timeAlive > 2){
            if(s.x <= s.radius || s.x >= sceneWidth-s.radius){
                s.reflectX();
                s.move(dt);
            }
            if(s.y <= s.radius || s.y >= sceneHeight-s.radius){
                s.reflectY();
                s.move(dt);
            }
            if(s.x < 0 || s.x > sceneWidth || s.y < 0 || s.y > sceneHeight){
                s.isAlive = false;
            }
        }
    }

	// #4 - Move Bullets
    for (let b of bullets){
		b.move(dt);
    }
    for (let sc of starChunks){
		sc.move(dt);
	}
    
	// #5 - Check for Collisions
	for(let s of stars){
        for(let b of bullets){
            if(starColliding(s, s.startArc.rotation, s.endArc.rotation, b)){
                s.takeHit();
                gameScene.removeChild(b);
                b.isAlive = false;
            }else if(circlesIntersect(s.center, b)){
                gameScene.removeChild(s);
                gameScene.removeChild(s.center);
                gameScene.removeChild(s.startArc);
                gameScene.removeChild(s.endArc);
                s.isAlive = false;
                increaseScoreBy(5);
            }

            if(b.y < -10 || b.y > sceneHeight + 10 || b.x < -10 || b.x > sceneWidth + 10) b.isAlive = false;
            if(s.y < -50 || s.y > sceneHeight + 50 || s.x < -50 || s.x > sceneWidth + 50) s.isAlive = false;
        }

        if(s.isAlive && starColliding(s, s.startAngle, s.endAngle, player)){
            gameScene.removeChild(s);
            gameScene.removeChild(s.center);
            gameScene.removeChild(s.startArc);
            gameScene.removeChild(s.endArc);
            s.isAlive = false;
            decreaseLifeBy(20);
        }
    }
    for (let sc of starChunks){
		if(circlesIntersect(player, sc)){
            gameScene.removeChild(sc);
            sc.isAlive = false;
            decreaseLifeBy(5);
        }
	}
	
    // #6 - Now do some clean up
    bullets = bullets.filter(b=>b.isAlive);
        
    stars = stars.filter(c=>c.isAlive);
	
	// #7 - Is game over?
	if (life <= 0){
        end();
        return;
    }
	
    // #8 - Load next level
}

function spawnStar (){
    let s = new Star();
    stars.push(s);
    gameScene.addChild(s.center);
    gameScene.addChild(s.startArc);
    gameScene.addChild(s.endArc);
    gameScene.addChild(s);
}

function spawnStartStar(){
    let s = new Star();
    startStars.push(s);
    startScene.addChild(s.center);
    startScene.addChild(s.startArc);
    startScene.addChild(s.endArc);
    startScene.addChild(s);
}

function loadLevel(){
	createCircles(levelNum * 5);
	paused = false;
}

function end(){
    paused = true;

    for(let s of stars){
        gameScene.removeChild(s);
        gameScene.removeChild(s.center);
        gameScene.removeChild(s.startArc);
        gameScene.removeChild(s.endArc);
    }
    stars = [];

    bullets.forEach(b=>gameScene.removeChild(b));
    bullets = [];

    starChunks.forEach(e=>gameScene.removeChild(e));
    starChunks = [];

    if(scoreText != null){
        gameOverScene.removeChild(scoreText);
    }

    let startLabel1 = new PIXI.Text("You Failed :(");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xF2EAD2,
        fontSize: 72,
        fontFamily: 'Arial',
        fontStyle: 'bold',
        stroke: 0x595557,
        strokeThickness: 4
    });
    startLabel1.x = 80;
    startLabel1.y = 30;
    gameOverScene.addChild(startLabel1);

    let startButton = new PIXI.Text("Play Again!");
    startButton.style = new PIXI.TextStyle({
        fill: 0x595557,
        fontSize: 48,
        fontFamily: 'Arial',
        fontStyle: "bold",
        stroke: 0xF2EAD2,
        strokeThickness: 6
    });
    startButton.x = 160;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup",startGame);
    startButton.on("pointerover",e=>e.target.alpha = 0.7);
    startButton.on("pointerout",e=>e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(startButton);

    scoreText  = new PIXI.Text("Score: " + score);
    scoreText.style = new PIXI.TextStyle({
	    fill: 0xF2EAD2,
        fontSize: 24,
        fontFamily: 'Arial',
        stroke: 0x595557,
        strokeThickness: 1
    });

    scoreText.x = 250;
    scoreText.y = sceneHeight/2 + 50;
    gameOverScene.addChild(scoreText);

    gameOverScene.visible = true;
    gameScene.visible = false;
}

function fireBullet(e){
    if(paused) return;

    let mousePosition = app.renderer.plugins.interaction.mouse.global;
    let unitVectToMouse = {
        x: mousePosition.x - player.x,
        y: mousePosition.y - player.y
    };
    let magnitude = Math.sqrt(unitVectToMouse.x * unitVectToMouse.x + unitVectToMouse.y * unitVectToMouse.y);
    unitVectToMouse.x /= magnitude;
    unitVectToMouse.y /= magnitude;

    let b = new Bullet(player.x, player.y, unitVectToMouse);
    bullets.push(b);
    gameScene.addChild(b);
}

function handleStartStars(dt){
    spawnCooldown -= dt;
    if(spawnCooldown <= 0){
        spawnStartStar();
        spawnCooldown = 0.5;
    }
}

function reorderStartScene(){
    for(let i = 0; i < startScene.children.length; i++){
        startScene.removeChildAt(0);
    }

    for(let s of startStars){
        startScene.addChild(s.center);
        startScene.addChild(s.startArc);
        startScene.addChild(s.endArc);
        startScene.addChild(s);
    }
    for(let o of startOverlay){
        startScene.addChild(o);
    }
}

function createExplosion(x, y, color=0xA2C9D8){
    let sc = new StarChunk(x,y,{x:1, y:0},color);
    starChunks.push(sc);
    gameScene.addChild(sc);
    sc = new StarChunk(x,y,{x:Math.sqrt(2)/2, y:Math.sqrt(2)/2},color);
    starChunks.push(sc);
    gameScene.addChild(sc);
    sc = new StarChunk(x,y,{x:0, y:1},color);
    starChunks.push(sc);
    gameScene.addChild(sc);
    sc = new StarChunk(x,y,{x:-1 * Math.sqrt(2)/2, y:Math.sqrt(2)/2},color);
    starChunks.push(sc);
    gameScene.addChild(sc);
    sc = new StarChunk(x,y,{x:-1, y:0},color);
    starChunks.push(sc);
    gameScene.addChild(sc);
    sc = new StarChunk(x,y,{x:-1 * Math.sqrt(2)/2, y:-1 * Math.sqrt(2)/2},color);
    starChunks.push(sc);
    gameScene.addChild(sc);
    sc = new StarChunk(x,y,{x:0, y:-1},color);
    starChunks.push(sc);
    gameScene.addChild(sc);
    sc = new StarChunk(x,y,{x:Math.sqrt(2)/2, y:-1 * Math.sqrt(2)/2},color);
    starChunks.push(sc);
    gameScene.addChild(sc);
}

function keysDown(e){
    keys[e.keyCode] = true;
}

function keysUp(e){
    keys[e.keyCode] = false;
}