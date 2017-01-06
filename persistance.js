let MongoClient = require('mongodb').MongoClient;
let Q = require('q');

const ENV = "dev";
const URL = "mongodb://localhost:27017/chessByVoice-" + ENV;
const GAMES_COLLECTION = 'games';


function persistGame(game, userId) {

  MongoClient.connect(URL, function(err, db) {
    var collection = db.collection(GAMES_COLLECTION);

    collection.update({user_id: userId}, {user_id: userId, fen: game.fen()}, {upsert: true}, function(err, result) {
      console.log("Updated the db");

      db.close();
    });
  });
}

function getGame(userId) {
  var deferred = Q.defer();

  MongoClient.connect(URL, function(err, db) {
    var collection = db.collection(GAMES_COLLECTION);

    collection.findOne({user_id: userId}, function(err, result) {
      if(err) {
        deferred.reject();
      } else {
        console.log("Just got the result of getGame: ", result);
        deferred.resolve(result);
      }
    });
  });

  return deferred.promise;
}

module.exports = {
  persistGame:  persistGame,
  getGame: getGame
}

