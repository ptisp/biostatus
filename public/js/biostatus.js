/*
var sys = arbor.ParticleSystem(1000, 400,1);
sys.parameters({gravity:true});
sys.renderer = Renderer("#viewport");

var animals = sys.addNode('Animals',{'color':'red','shape':'dot','label':'Animals'});

var dog = sys.addNode('dog',{'color':'green','shape':'dot','label':'dog'});
var cat = sys.addNode('cat',{'color':'blue','shape':'dot','label':'cat'});

sys.addEdge(animals, dog);
sys.addEdge(animals, cat);
*/

var Biostatus = function () {
  var self = this;

  var N = 300;

  /*
  for (i = 0; i < N; i++) {
    self.graph.nodes.push({
      id: 'n' + i,
      label: 'Node' + i,
      x: Math.cos(2 * i * Math.PI / N),
      y: Math.sin(2 * i * Math.PI / N),
      size: Math.random(),
      color: '#FF0000'
    });
  }
  */

  this.sigma = new sigma({
    container: 'graph-container',
    settings: {
      drawEdges: false,
      enableHovering: false,
      mouseEnabled: false
    }
  });

  self.started = false;

  this.connection = io();

  this.connection.on('disconnect', function () {
    console.log('Disconnected');
  });

  this.connection.on('connect', function() {

    self.connection.on('servers', function (servers) {
      for (var i = 0; i < servers.length; i++) {
        var node = self.findNode(servers[i].id);
        var size = 1;
        var color = '#00FF00';

        if(servers[i].status == 'alarmed' || servers[i].status == 'fired') {
          color = '#FF0000';
          size = 3;
        } else if(servers[i].status == 'warned') {
          color = '#FFA500';
          size = 2;
        }

        if(servers[i].connected == false) {
          color = '#000000';
        }

        if(!node) {
          self.sigma.graph.addNode({
            id: servers[i].id,
            label: '',
            x: Math.cos(2 * i * Math.PI / servers.length),
            y: Math.sin(2 * i * Math.PI / servers.length),
            size: size,
            color: color
          });
        } else {
          node.size = size;
          node.color = color;
        }
      }

      self.sigma.refresh();
      if(self.started === false) {
        self.started = true;
        self.sigma.startForceAtlas2();

        setTimeout(function() {
          self.sigma.stopForceAtlas2();
          self.started = false;
        }, 15000);
      }
    });

    console.log('Connected');
  });
};

Biostatus.prototype.findNode = function (id) {
  return this.sigma.graph.nodes(id);
};


var biostatus = new Biostatus();
