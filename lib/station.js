var sys = require('sys'),
  events = require('events'),
  config = require('../conf/config'),
  crypto = require('crypto'),
  duplexEmitter = require('duplex-emitter'),
  socketio = require('socket.io'),
  vendors = require('../vendors'),
  async = require('async');

function Station(listener) {
  this.listener = listener;
  this.clients = [];
  this.io = socketio(listener);
}

sys.inherits(Station, events.EventEmitter);

Station.prototype.start = function () {
  var self = this;

  vendors.mongo(function(db) {
    self.loadWorkers();

    self.io.on('connection', function(socket) {
      self.clients.push(socket);
      self.emit('connected', socket);

      socket.on('disconnect', function(){
        self.removeClient(socket);
        self.emit('disconnected', socket);
        console.log("Client disconnected!");
      });

      self.sendServers();
    });
  });

};

Station.prototype.loadWorkers = function() {
  var self = this;

  this.serversInterval = setInterval(function() {
    self.sendServers();
  }, 15 * 1000);
};

Station.prototype.sendServers = function () {
  var self = this;
  vendors.mongo(function(db) {
    var collection = db.collection('servers');
    collection.find().toArray(function(err, servers) {
      var serversFinal = [];
      for (var i = 0; i < servers.length; i++) {
        var aux = {
          'id': servers[i].id,
          'status': servers[i].status,
          'connected': servers[i].connected
        };
        serversFinal.push(aux);
      }
      self.send('servers', serversFinal);
    });
  });
};

Station.prototype.send = function (event, data) {
  this.clients.forEach(function (client) {
    client.emit(event, data);
  });
};

Station.prototype.removeClient = function (rclient) {
  for (i = 0; i < this.clients.length; i++) {
    console.log(this.clients[i].id);
    if (this.clients[i].id === rclient.id) {
      this.clients.splice(i, 1);
      i = this.clients.length + 1;
    }
  }
};

module.exports = Station;
