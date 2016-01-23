function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game) {
    Entity.call(this, game, 0, 400);
    this.radius = 200;
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
    ctx.fillStyle = "SaddleBrown";
    ctx.fillRect(0,500,800,300);
    Entity.prototype.draw.call(this);
}

function Player(game) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./hgun_move.png"), 0, 0, 258, 220, 0.02, 1, true, true);
    this.walkRight = new Animation(ASSET_MANAGER.getAsset("./hgun_move.png"), 0, 0, 258, 220, 0.05, 12, false, true);
    this.reloadAnimation = new Animation(ASSET_MANAGER.getAsset("./hgun_reload.png"), 0, 0, 258, 220, .1, 11, false, true);
    this.right = false;
    this.reload = false;
    this.radius = 100;
    this.ground = 400;
    Entity.call(this, game, 0, 400);
}

Player.prototype = new Entity();
Player.prototype.constructor = Player;

Player.prototype.update = function () {
    if (this.game.d) this.right = true;
    if (this.right) {
        if (this.walkRight.isDone()) {
            this.walkRight.elapsedTime = 0;
            this.right = false;
        }
        this.x = this.x += 10;
     
    }
    if (this.game.r) this.reload = true;
    if (this.reload) {
        if (this.reloadAnimation.isDone()) {
            this.reloadAnimation.elapsedTime = 0;
            this.reload = false;
        }
        this.x = this.x;

    }
    Entity.prototype.update.call(this);
}



Player.prototype.draw = function (ctx) {

    if (this.right) {
        this.walkRight.drawFrame(this.game.clockTick, ctx, this.x+10, this.y);
    }
    else if (this.reload) {
        this.reloadAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    else {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    Entity.prototype.draw.call(this);
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./hgun_reload.png");
ASSET_MANAGER.queueDownload("./hgun_move.png");


ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var bg = new Background(gameEngine);
    var unicorn = new Player(gameEngine);

    gameEngine.addEntity(bg);
    gameEngine.addEntity(unicorn);
 
    gameEngine.init(ctx);
    gameEngine.start();
});
