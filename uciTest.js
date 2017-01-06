let FEN = require('chesslib').FEN;
let moveUtil = require('./moveUtil');
let MongoClient = require('mongodb').MongoClient;

let env = "dev"
let url = "mongodb://localhost:27017/chessByVoice-" + env;

let pos = FEN.parse("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

MongoClient.connect(url, function(err, db) {
  var collection = db.collection('games');

  collection.insert({fen: FEN.stringify(pos)}, function(err, result) {
    console.log("result: ", result);

    db.close();
  });

});


//pos = moveUtil.playMove(pos, 'e4')


