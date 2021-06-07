class Player extends PIXI.Graphics{
    constructor(x=0,y=0){
        super();
        this.beginFill(0xFFFFFF);
        this.drawCircle(0,0,10);
        this.endFill();
        this.speed = 150;
        this.x = x;
        this.y = y;
    }

    move(dt=1/60, fwd={x: 0, y: 0}){
        this.x += fwd.x * this.speed * dt;
        this.y += fwd.y * this.speed * dt;
    }
}

class Star extends PIXI.Graphics{
    constructor(x=0, y=0, color=0x738E99, radius=(Math.floor(Math.random() * (40 - 30)) + 30)){
        super();

        this.radius = radius;
        this.colorSets = [];
        this.colorSets.push({color: 0x738E99, centerColor: 0xA2C9D8});
        this.colorSets.push({color: 0x739980, centerColor: 0xA3D9B7});
        this.colorSets.push({color: 0x997273, centerColor: 0xD8A2A4});
        this.colorSets.push({color: 0x897399, centerColor: 0xC1A3D9});
        this.colorSet = this.colorSets[Math.floor(Math.random() * 4)];
        this.timeLeft = 15;
        this.timeScale = 3;
        this.flashTimer = 0.1;
        this.decayRate = (Math.PI*5/6)/5;
        this.startAngle = 0;
        this.endAngle = this.startAngle;
        this.center = new PIXI.Graphics;
        this.center.beginFill(this.colorSet.centerColor);
        this.center.drawCircle(0,0,radius/3);
        this.center.endFill();
        this.startArc = new PIXI.Graphics;
        this.startArc.beginFill(this.colorSet.color);
        this.startArc.arc(0,0,radius,0,Math.PI,false);
        this.startArc.endFill();
        this.startArc.rotation = this.startAngle;
        this.endArc = new PIXI.Graphics;
        this.endArc.beginFill(this.colorSet.color);
        this.endArc.arc(0,0,radius,0,Math.PI,false);
        this.endArc.endFill();
        this.endArc.rotation = this.endAngle;
        this.beginFill(0xFFFFFF, 0);
        this.drawCircle(0,0,radius);
        this.endFill();

        this.rotationSpeed = -1 * Math.random() * ((4*Math.PI)/360 - (2*Math.PI)/360) + (2*Math.PI)/360;

        if(Math.random() > 0.5){
            this.x = Math.floor(Math.random() * ((sceneWidth + radius) - (0 - radius) + 1)) + (0 - radius);
            if(Math.random() > 0.5){
                this.y = sceneHeight + radius;
            }
            else{
                this.y = 0 - radius;
            }
        }
        else{
            this.y = Math.floor(Math.random() * ((sceneHeight + radius) - (0 - radius) + 1)) + (0 - radius);
            if(Math.random() > 0.5){
                this.x = sceneWidth + radius;
            }
            else{
                this.x = 0 - radius;
            }
        }

        let forward = getRandomUnitVector();
        let ahead = {x: 0, y: 0};
        ahead.x = forward.x * radius * 3;
        ahead.y = forward.y * radius * 3;
        
        while(this.x + ahead.x < radius || this.x + ahead.x > sceneWidth - radius || this.y + ahead.y < radius || this.y + ahead.y > sceneHeight - radius){
            forward = getRandomUnitVector();
            ahead.x = forward.x * radius * 3;
            ahead.y = forward.y * radius * 3;
        }

        this.fwd = forward;
        this.speed = 50;
        this.isAlive = true;
    }

    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
        this.startArc.x = this.x;
        this.startArc.y = this.y;
        this.endArc.x = this.x;
        this.endArc.y = this.y;
        this.center.x = this.x;
        this.center.y = this.y;
        this.startArc.rotation = this.startAngle;
        this.endArc.rotation = this.endAngle;
        this.timeLeft -= dt;
        this.decay(dt);
        this.rotate();
    }

    rotate(){
        this.startAngle += this.rotationSpeed;
        this.endAngle += this.rotationSpeed;
    }

    flash(dt){
        this.beginFill(0xFFFFFF);
        this.drawCircle(0,0,this.radius/3);
        this.endFill();
    }

    takeHit(){
        let newEndAngle = this.endAngle - this.decayRate * 2;
        if(newEndAngle < this.startAngle){
            newEndAngle = this.startAngle;
        }
        this.endAngle = newEndAngle;
    }

    decay(dt){
        let newEndAngle = this.endAngle + this.decayRate * dt;
        if(newEndAngle >= this.startAngle + Math.PI){
            newEndAngle = this.startAngle + Math.PI;
        }
        this.endAngle = newEndAngle;
    }

    reflectX(){
        this.fwd.x *= -1;
    }

    reflectY(){
        this.fwd.y *= -1;
    }
}

class Bullet extends PIXI.Graphics{
    constructor(x=0, y=0, fwd={x: 1, y: 0}){
        super();
        this.beginFill(0xFFFFFF);
        this.drawCircle(0,0,1);
        this.endFill();
        this.x = x;
        this.y = y;
        this.fwd = fwd;
        this.speed = 400;
        this.isAlive = true;
        Object.seal(this);
    }

    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}

class StarChunk extends PIXI.Graphics{
    constructor(x=0, y=0, fwd={x: 1, y: 0}, color=0x738E99){
        super();
        this.beginFill(color);
        this.drawCircle(0,0,1);
        this.endFill();
        this.x = x;
        this.y = y;
        this.fwd = fwd;
        this.speed = 250;
        this.isAlive = true;
        Object.seal(this);
    }

    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}