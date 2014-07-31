var Biostatus = function () {
  var self = this;

  this.width = window.innerWidth;
  this.height = window.innerHeight;

  this.particles = [];
  this.canvas1 = document.querySelector('#layer1');
  this.ctx1 = this.canvas1.getContext('2d');
  this.canvas2 = document.querySelector('#layer2');
  this.ctx2 = this.canvas2.getContext('2d');
  this.canvas3 = document.querySelector('#layer3');
  this.ctx3 = this.canvas3.getContext('2d');

  this.canvas1.width = this.width;
  this.canvas1.height = this.height;
  this.canvas2.width = this.width;
  this.canvas2.height = this.height;
  this.canvas3.width = this.width;
  this.canvas3.height = this.height;
  this.canvas1.style.left = (window.innerWidth - this.canvas1.width)/2+'px';
  this.canvas2.style.left = (window.innerWidth - this.canvas2.width)/2+'px';
  this.canvas3.style.left = (window.innerWidth - this.canvas2.width)/2+'px';

  //if(window.innerHeight>500)
  //this.canvas.style.top = (window.innerHeight - this.canvas.height)/2+'px';

  this.connection = io();

  this.connection.on('disconnect', function () {
    console.log('Disconnected');
  });

  this.connection.on('connect', function() {

    self.connection.on('servers', function (servers) {
      for (var i = 0; i < servers.length; i++) {
        if(servers[i].connected === true) {
          var node = self.findNode(servers[i].id);
          var size = 10;
          var color = '#00FF00';

          if(servers[i].status == 'alarmed' || servers[i].status == 'fired') {
            color = '#FF0000';
            size = 20;
          } else if(servers[i].status == 'warned') {
            color = '#FFA500';
            size = 15;
          }

          if(!node) {
            self.particles.push({
              x: Math.round( Math.random() * self.width),
              y:  Math.round( Math.random() * self.height),
              rgba: color,
              vx: Math.round( Math.random() * 3) - 1.5,
              vy: Math.round( Math.random() * 3) - 1.5,
              id: servers[i].id,
              status: servers[i].status,
              size : size
            });
          } else {
            node.size = size;
            node.rgba = color;
            node.status = servers[i].status;
          }
        }
      }
    });

    console.log('Connected');
  });
};


Biostatus.prototype.start = function() {
  var self = this;
  window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
              window.setTimeout(callback, 50);
            };
  })();

  (function loop(){
    self.draw();
    setTimeout(function() {
      requestAnimFrame(loop);
    }, 50);
  })();
};


Biostatus.prototype.findDistance = function(p1,p2) {
  return Math.sqrt( Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) );
};


Biostatus.prototype.draw = function() {
  this.ctx1.clearRect(0, 0, this.width, this.height);
  this.ctx1.globalCompositeOperation = 'lighter';
  this.ctx2.clearRect(0, 0, this.width, this.height);
  this.ctx2.globalCompositeOperation = 'lighter';
  this.ctx3.clearRect(0, 0, this.width, this.height);
  this.ctx3.globalCompositeOperation = 'lighter';

  for(var i = 0;i < this.particles.length; i++){
    var temp = this.particles[i];

    for(var j = 0; j<this.particles.length; j++){
       var temp2 = this.particles[j];
       this.ctx1.linewidth = 0.5;

      if(temp.rgba == temp2.rgba) {
        var distance = this.findDistance(temp, temp2);

        if(distance <= (temp.size + temp2.size)) {
          temp.vx *= -1;
          temp.vy *= -1;
          temp2.vx *= -1;
          temp2.vy *= -1;
        } else if(distance < 50) {
          this.ctx1.strokeStyle = "#FFFFFF";
          this.ctx1.beginPath();
          this.ctx1.moveTo(temp.x, temp.y);
          this.ctx1.lineTo(temp2.x, temp2.y);
          this.ctx1.stroke();
        }
      }
    }


    this.ctx1.fillStyle = temp.rgba;
    this.ctx1.strokeStyle = temp.rgba;
    this.ctx2.fillStyle = temp.rgba;
    this.ctx2.strokeStyle = temp.rgba;
    this.ctx3.fillStyle = temp.rgba;
    this.ctx3.strokeStyle = temp.rgba;

    var ctx = this.ctx2;

    if(temp.status != 'normal') {
      ctx = this.ctx3;
    }
    ctx.beginPath();
    ctx.arc(temp.x, temp.y, temp.size, 0, Math.PI*2, true);
    ctx.fill();
    ctx.closePath();

    temp.x += temp.vx;
    temp.y += temp.vy;

    if(temp.x > this.width) temp.x = 0;
    if(temp.x < 0) temp.x = this.width;
    if(temp.y > this.height) temp.y = 0;
    if(temp.y < 0) temp.y = this.height;
  }
};


Biostatus.prototype.findNode = function (id) {
  for (var i = 0; i < this.particles.length; i++) {
    if(this.particles[i].id == id) {
      return this.particles[i];
    }
  }
};


var biostatus = new Biostatus();
biostatus.start();
