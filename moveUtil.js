//TODO: Abstract this out so it will work on the server
const STOCK_PATH = "/Users/dbe/Stockfish/src/stockfish";

var Q = require('q');
var UCI = require('uci');

//Given a position, calculate the best move using Stockfish
//Returns a deffered variable
function calcBestMove(game) {
  var engine = new UCI(STOCK_PATH);
  var deferred = Q.defer();

  engine.runProcess().then(function () {
    return engine.uciCommand();

  }).then(function (idAndOptions) {
    return engine.isReadyCommand();

  }).then(function () {
    return engine.uciNewGameCommand();

  }).then(function () {
    return engine.positionCommand(game.fen());

  }).then(function () {
    return engine.goInfiniteCommand(console.log);

  }).delay(500).then(function () {
    return engine.stopCommand();

  }).then(function (bestMove) {
    //TODO: Maybe need to translate this to a correct {to, from} dictionary. Maybe not
    deferred.resolve(bestMove);

    return engine.quitCommand();

  }).then(function () {
    console.log('Stopped');
  }).fail(function (error) {
    console.log(error);
    deferred.reject(error);
    process.exit();
  }).done();

  return deferred.promise;
}


const PIECE_TO_SPEECH = {
  'p' : 'pawn',
  'r' : 'rook',
  'n' : 'knight',
  'b' : 'bishop',
  'q' : 'queen',
  'k' : 'king'
}

function moveToSpeech(move) {
  return `${PIECE_TO_SPEECH[move.piece]} from ${move.from} to ${move.to}`;
}


module.exports.calcBestMove = calcBestMove;
module.exports.moveToSpeech = moveToSpeech;
