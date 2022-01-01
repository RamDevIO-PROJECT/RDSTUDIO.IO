/*
let canvas = document.getElementById('display'),
    ctx = canvas.getContext('2d'),
    w = canvas.width =  340;
    h = canvas.height = 200;

// consts
const t = 20,
    colors = ["red", "blue", "green", "yellow"],
    packageType = ["gun1", "gun2", "health"],
    gunType = ["default", "gun1", "gun2"],
    bulletType = {
        "default": "#fff",
        "gun1": "#832",
        "gun2": "#3f4"
    };

// data
let players = [],
    bullets = [],
    stats = [],
    packages = [],
    time = 0,
    loggedIn = false;


// consts
const map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,3,3,3,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,3,3,3,3,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,1],
  [1,3,3,3,0,0,0,0,0,0,0,0,0,3,3,3,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1]
];

function draw() {
    ctx.clearRect(0,0,w,h);
    // ctx.fillStyle = "#757575";
     ctx.fillStyle = "#19C0FF";
    // ctx.fillStyle = "#222034";
    ctx.fillRect(0,0,w,h);

    // drawing map
    ctx.fillStyle = "#353535";
    if (map !== undefined) {
      for (let i=0; i<map[0].length; i++) {
        for (let j=0; j<map.length; j++) {
          if (map[j][i] !== 0) {
            ctx.drawImage(imgTiles, (map[j][i]-1)*t, 0, t, t, i*t, j*t, t, t);
          }
        }
      }
    }
    
    // drawing objects
    let hp, ammo;
    
    //info bar
    ctx.font = "14px arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(`${time}`, 5, 15);
    ctx.fillText(`HP: ${hp}`, 5, 30);
    ctx.fillText(`ammo: ${ammo===-1?"unlimited":ammo}`, 5, 45);

    
    // functions
    function compareKD(a, b) {
        if (a.k <= b.k)
            return 1;
        else
            return -1;
    }

    function fade() {
        ctx.fillStyle = "rgba(53,53,53,0.6)";
        ctx.fillRect(0,0,w,h);
    }

    function drawRotatedImage(context, image, angle, x, y, imageX, imageY, width, height) {
        context.translate(x, y);
        context.rotate(angle);
        if (angle > Math.PI/2 || angle < -Math.PI/2)
            context.scale(1, -1);
        context.drawImage(image, imageX, imageY, width, height, 0, 0, width, height);
        if (angle > Math.PI/2 || angle < -Math.PI/2)
            context.scale(1, -1);
        context.rotate(-angle);
        context.translate(-x, -y);
    }

    function drawFlippedImage(context, image, turned, x, y, imageX, imageY, width, height) {
        context.translate(x,y);
        if (turned === "left")
            context.scale(-1, 1);
        context.drawImage(image, imageX, imageY, width, height, turned==="left"?-20:0, 0, width, height);
        if (turned === "left")
            context.scale(-1, 1);
        context.translate(-x, -y);
    }
}

let imgHero, imgGun, imgPackage, imgBullet, imgTiles;
function loadImages() {
    imgHero = new Image();
    imgHero.src = "./img/player.png";
    imgGun = new Image();
    imgGun.src = "./img/weapon.png";
    imgPackage = new Image();
    imgPackage.src = "./img/package.png"
    imgBullet = new Image();
    imgBullet.src = "./img/bullets.png"
    imgTiles = new Image();
    imgTiles.src = "./img/tiles.png";
}

function update() {
  draw();
  requestAnimationFrame(update);
}
loadImages();
update();*/





const socket = io.connect('http://localhost:3000');

let canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
    w = canvas.width =  340;
    h = canvas.height = 200;

let Input = {
	pressed: {},
	keys: {w: 87, s: 83, a: 65, d: 68, t: 84},
    mouse: {x: 0, y: 0, pressed: false},
	isDown: function (keyCode) { return this.pressed[this.keys[keyCode]]; },
	onKeyDown: function (event) { this.pressed[event.keyCode] = true; },
    onKeyUp: function (event) { delete this.pressed[event.keyCode]; }
};
window.addEventListener('keyup', (event) => { Input.onKeyUp(event); }, false);
window.addEventListener('keydown', (event) => { Input.onKeyDown(event); }, false);
window.addEventListener('mousemove', (event) => { getMouseCords(event); }, false);
window.addEventListener('mousedown', (event) => { Input.mouse.pressed = true; });
window.addEventListener('mouseup', (event) => { Input.mouse.pressed = false; });

function getMouseCords(event) {
    let rect = canvas.getBoundingClientRect();
    Input.mouse.x = event.clientX-rect.left;
    Input.mouse.y = event.clientY-rect.top;
}
// consts
const t = 20,
    colors = ["red", "blue", "green", "yellow"],
    packageType = ["gun1", "gun2", "health"],
    gunType = ["default", "gun1", "gun2"],
    bulletType = {
        "default": "#fff",
        "gun1": "#832",
        "gun2": "#3f4"
    };

// data
let players = [],
    bullets = [],
    stats = [],
    packages = [],
    map = undefined,
    time = 0,
    loggedIn = false;

// reacting on socket
socket.on('serverData', data => {
    if (data.players !== undefined)
        players = data.players;
    if (data.bullets !== undefined)
        bullets = data.bullets;
    if (data.stats !== undefined)
        stats = data.stats;
    if (data.packages !== undefined)
        packages = data.packages;
});

socket.on('time', data => {
    time = data.time;
});

socket.on('sendMap', data => {
    map = data.map;
});

// front functions
function getInput() {
    let playerData = {
        id: socket.id,
        down: [],
        mouse: {
            x: Input.mouse.x,
            y: Input.mouse.y,
            pressed: Input.mouse.pressed
        }
    };

    if (Input.isDown('w'))
        playerData.down.push('w');
    else if (Input.isDown('s'))
        playerData.down.push('s');
    if (Input.isDown('a'))
        playerData.down.push('a');
    else if (Input.isDown('d'))
        playerData.down.push('d');

    socket.emit('clientData', playerData);
}

function draw() {
    ctx.clearRect(0,0,w,h);
    // ctx.fillStyle = "#757575";
    // ctx.fillStyle = "#80C9C1";
    ctx.fillStyle = "#19C0FF";
    ctx.fillRect(0,0,w,h);

    // drawing map
    ctx.fillStyle = "#353535";
    if (map !== undefined) {
        for (let i=0; i<map[0].length; i++) {
            for (let j=0; j<map.length; j++) {
                if (map[j][i] !== 0) {
                    ctx.drawImage(imgTiles, (map[j][i]-1)*t, 0, t, t, i*t, j*t, t, t);
                }
            }
        }
    }

    // drawing objects
    let hp, ammo;

    players.forEach(player => {
        // function drawFlippedImage(context, image, turned, x, y, imageX, imageY, width, height)
        // imageX ~ frame

        if (player.sprite.frame === -1) {
            drawFlippedImage(ctx, imgHero, player.sprite.turned, player.x, player.y, 2*t, colors.indexOf(player.color)*t, t, t);
        }
        else if (player.sprite.frame === 0) {
            drawFlippedImage(ctx, imgHero, player.sprite.turned, player.x, player.y, 0, colors.indexOf(player.color)*t, t, t);
        }
        else {
            drawFlippedImage(ctx, imgHero, player.sprite.turned, player.x, player.y, player.sprite.frame*t, colors.indexOf(player.color)*t, t, t);
        }

        if (player.id == socket.id) {
            hp = player.hp;
            ammo = player.ammo;
        }

        // draw gun
        if (player.mouse !== undefined) {
            let dy = player.mouse.y - player.y-10,
                dx = player.mouse.x - player.x-10,
                angle = Math.atan2(dy, dx);
            drawRotatedImage(ctx, imgGun, angle%(Math.PI*2), player.x+10, player.y+5, gunType.indexOf(player.gun)*t, 0, t, 15);
        }
    });

    bullets.forEach(bullet => {
        let angle = Math.atan2(bullet.vy, bullet.vx);
        drawRotatedImage(ctx, imgBullet, angle%(Math.PI*2), bullet.x-5, bullet.y-5, gunType.indexOf(bullet.type)*10, 0, 10, 10);
    }) 

    packages.forEach(package => {
        ctx.drawImage(imgPackage, packageType.indexOf(package.type)*t, 0 ,t, t, package.x, package.y, t, t);
    });

    //info bar
    ctx.font = "14px arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(`${time}`, 5, 15);
    ctx.fillText(`HP: ${hp}`, 5, 30);
    ctx.fillText(`ammo: ${ammo===-1?"unlimited":ammo}`, 5, 45);

    //cursor
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.arc(Input.mouse.x,Input.mouse.y,5,0,Math.PI*2);
    ctx.stroke();

    let isFaded = false;

    if (Input.isDown('t')) {
        fade();
        isFaded = true;

        ctx.fillStyle = "#fff";
        let y = 0;
        ctx.fillText(`kills       deaths`,200,30);
        let statsToCompare = stats.map(k => k).sort(compareKD);

        statsToCompare.forEach(stat => {
            if (stat.id == socket.id) {
                ctx.fillStyle = "rgba(155,155,155,0.6)";
                ctx.fillRect(45, 35+y,250,22);
                ctx.fillStyle = "#fff";
            }
            ctx.fillText(`${stat.name}`,50,50+y);
            ctx.fillText(`${stat.k}`,200,50+y);
            ctx.fillText(`${stat.d}`,250,50+y);
            y+=20;
        });
    }

    let playersIDs = players.map(player => player.id);
    if (playersIDs.indexOf(socket.id) === -1 && !isFaded) {
        fade();

        ctx.fillStyle = "#fff";
        if (loggedIn) {
            ctx.fillText('You died!',w/2-40,h/2);
            ctx.fillText(`respawning in 5 seconds`,w/2-80,h/2+20);
        }
        else {
            ctx.fillText("please customize and hit play button!",w/2-120,h/2);
        }
    }
    
    // functions
    function compareKD(a, b) {
        if (a.k <= b.k)
            return 1;
        else
            return -1;
    }

    function fade() {
        ctx.fillStyle = "rgba(53,53,53,0.6)";
        ctx.fillRect(0,0,w,h);
    }

    function drawRotatedImage(context, image, angle, x, y, imageX, imageY, width, height) {
        context.translate(x, y);
        context.rotate(angle);
        if (angle > Math.PI/2 || angle < -Math.PI/2)
            context.scale(1, -1);
        context.drawImage(image, imageX, imageY, width, height, 0, 0, width, height);
        if (angle > Math.PI/2 || angle < -Math.PI/2)
            context.scale(1, -1);
        context.rotate(-angle);
        context.translate(-x, -y);
    }

    function drawFlippedImage(context, image, turned, x, y, imageX, imageY, width, height) {
        context.translate(x,y);
        if (turned === "left")
            context.scale(-1, 1);
        context.drawImage(image, imageX, imageY, width, height, turned==="left"?-20:0, 0, width, height);
        if (turned === "left")
            context.scale(-1, 1);
        context.translate(-x, -y);
    }
}

function loginPlayer() {
    let name = document.getElementById("playerName").value,
        color = document.getElementById("color").value;
    let player = {name: name, color: color};

    let names = players.map(player => player.name);
    if (names.indexOf(name) !== -1)
        return;

    loggedIn = true;
    socket.emit('createPlayer', player);
    document.getElementById('login').style = "display:none";
}

let imgHero, imgGun, imgPackage, imgBullet, imgTiles;
function loadImages() {
    imgHero = new Image();
    imgHero.src = "./img/player.png";
    imgGun = new Image();
    imgGun.src = "./img/weapon.png";
    imgPackage = new Image();
    imgPackage.src = "./img/package.png"
    imgBullet = new Image();
    imgBullet.src = "./img/bullets.png"
    imgTiles = new Image();
    imgTiles.src = "./img/tiles.png";
}

function update() {
    draw();
    if (loggedIn)
        getInput();
    
    requestAnimationFrame(update);
}
loadImages();
update();






class JoystickElement {
  constructor(selector) {
    this.element = document.querySelector(selector);
    this.rect = this.calculateRect();
    this.current = this.original;

    // Recalculate the rect on resizing
    window.onresize = () => {
      this.rect = this.calculateRect();
    };
  }

  get original() {
    return {
      vector: {
        x: 0,
        y: 0 },

      angle: 0,
      percentage: 0 };

  }

  calculateRect() {
    let rect = this.element.getBoundingClientRect();

    return Object.assign(
    rect,
    {
      center: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2 },

      radius: rect.width / 2 // Improve this
    });

  }}


class JoystickShaft extends JoystickElement {
  clamp(x, y, boundary) {
    // Trigonometry time!
    // - Who says what you learn in school won't become useful :D
    let diff = {
      x: x - this.rect.center.x,
      y: y - this.rect.center.y };


    // Get the distance between the cursor and the center
    let distance = Math.sqrt(
    Math.pow(diff.x, 2) + Math.pow(diff.y, 2));


    // Get the angle of the line
    let angle = Math.atan2(diff.x, diff.y);
    // Convert into degrees!
    this.current.angle = 180 - angle * 180 / Math.PI;

    // If the cursor is distance from the center is
    // less than the boundary, then return the diff
    //
    // Note: Boundary = radius
    if (distance < boundary) {
      this.current.percentage = distance / boundary * 100;
      return this.current.vector = diff;
    }

    // If it's a longer distance, clamp it!
    this.current.percentage = 100;

    return this.current.vector = {
      x: Math.sin(angle) * boundary,
      y: Math.cos(angle) * boundary };

  }

  move(from, to, duration, callback) {
    Velocity(
    this.element,
    {
      translateX: [to.x, from.x],
      translateY: [to.y, from.y],
      translateZ: 0 },

    {
      duration: duration,
      queue: false,
      complete() {
        if (typeof callback === 'function') {
          callback();
        }
      } });


  }}


class Joystick {
  constructor(base, shaft) {
    this.state = 'inactive';
    this.base = new JoystickElement(base);
    this.shaft = new JoystickShaft(shaft);
    this.boundary = this.base.rect.radius * 0.75;

    this.onactivate = function () {};
    this.ondeactivate = function () {};
    this.ondrag = function () {};

    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
    this.drag = this.drag.bind(this);
  }

  static get ANIMATION_TIME() {
    return 100;
  }

  attachEvents() {
    this.base.element.addEventListener('pointerdown', this.activate, false);
    document.addEventListener('pointerup', this.deactivate, false);
    document.addEventListener('pointermove', this.drag, false);

    return this;
  }

  detachEvents() {
    this.base.element.removeEventListener('pointerdown', this.activate, false);
    document.removeEventListener('pointerup', this.deactivate, false);
    document.removeEventListener('pointermove', this.drag, false);

    this.deactivate();

    return this;
  }

  activate() {
    this.state = 'active';
    this.base.element.classList.add('active');

    if (typeof this.onactivate === 'function') {
      this.onactivate();
    }

    return this;
  }

  deactivate() {
    this.state = 'inactive';
    this.base.element.classList.remove('active');

    this.shaft.move(
    this.shaft.current.vector,
    this.shaft.original.vector,
    this.constructor.ANIMATION_TIME,
    () => {
      this.shaft.element.removeAttribute('style');
      this.shaft.current = this.shaft.original;

      if (typeof this.ondeactivate === 'function') {
        this.ondeactivate();
      }
    });


    return this;
  }

  drag(e) {
    if (this.state !== 'active') {
      return this;
    }

    this.shaft.move(
    this.shaft.original.vector,
    this.shaft.clamp(e.clientX, e.clientY, this.boundary),
    0,
    () => {
      if (typeof this.ondrag === 'function') {
        this.ondrag();
      }
    });


    return this;
  }}


// Setup the Joystick
const joystick = new Joystick('.joystick-base', '.joystick-shaft');

// Attach the events for the joystick
// Can also detach events with the detachEvents function
joystick.attachEvents();

// Lets animate the background colour around using hsl to show the degree of control this has!
// Puns are funny.
joystick.ondeactivate = function () {
  document.body.removeAttribute('style');
};

joystick.ondrag = function () {
  //.console.log(this.shaft.current.angle)
  //.console.log(this.shaft.current.percentage)
  document.body.style.background = `hsl(${this.shaft.current.angle}, ${this.shaft.current.percentage}%, 50%)`;
};
/*
//KEYBOARD
var key = {
  pressed: [],
  frame: function () { 
        if (key.pressed['left'] || key.pressed[37] || key.pressed[65]) {
          console.log('left')
        }
      
      
        if (key.pressed['right'] || key.pressed[39] || key.pressed[68]) {
          console.log('right')
        }
      
      if (key.pressed['up'] || key.pressed[38] || key.pressed[87]) {
        console.log('up')
      }
      
      if (key.pressed['bottom'] || key.pressed[38] || key.pressed[87]) {
        console.log('up')
      }
  }
};
window.addEventListener('keydown', function (event) { 
  key.pressed[event.keyCode] = true;
});
window.addEventListener('keyup', function (event) {
  key.pressed[event.keyCode] = false;
});

// BUTTONS
var buttons = ['left', 'up', 'right'];
buttons.forEach(function (id) {
  var button = document.getElementById(id);
  var press = function (event) { 
    key.pressed[id] = true;
  };
  var release = function (event) {
    key.pressed[id] = false;
  };
  button.addEventListener('mousedown', press);
  button.addEventListener('mouseup', release);
  button.addEventListener('touchstart', press);
  button.addEventListener('touchend', release);
});

var frame = function () {
    key.frame();
    requestAnimationFrame(frame);
  
};
frame()*/