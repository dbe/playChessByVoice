//TODO: Abstract this out so it will work on the server
const STOCK_PATH = "/Users/dbe/Stockfish/src/stockfish";

var Q = require('q');
var UCI = require('uci');
var chessLib = require('chesslib');
var FEN = chessLib.FEN;

//Takes a current board state and a desired move.
//If the move is illegal, the function will throw an Error of the associated type //TODO: Describe the exact errors here in more detail
//If the move is legal, the move will be played, and Stockfish will be consulted about its next move. The new FEN notation will be returned
function playMove(initialPosition, desiredMove) {
  console.log("Postion before: ", FEN.stringify(initialPosition));

  //This throws errors if the move is illegal
  var pos = initialPosition.move(desiredMove);

  console.log("Position after playing desired move: ", FEN.stringify(pos));

  bestMove = calcBestMove(pos);

  return bestMove;
}

//Given a position, calculate the best move using Stockfish
//Returns a deffered variable
function calcBestMove(initialPos) {
  console.log("In calcBestMove");

  var engine = new UCI(STOCK_PATH);
  var deferred = Q.defer();

  engine.runProcess().then(function () {
    console.log('Started');
    return engine.uciCommand();

  }).then(function (idAndOptions) {
    console.log('Engine name - ' + idAndOptions.id.name);
    return engine.isReadyCommand();

  }).then(function () {
    console.log('Ready');
    return engine.uciNewGameCommand();

  }).then(function () {
    console.log('New game started');
    return engine.positionCommand(FEN.stringify(initialPos));

  }).then(function () {
    console.log('Starting position set');
    console.log('Starting analysis');
    return engine.goInfiniteCommand(console.log);

  }).delay(500).then(function () {
    console.log('Stopping analysis');
    return engine.stopCommand();

  }).then(function (bestmove) {
    console.log('Bestmove: ');
    deferred.resolve(bestmove)
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


module.exports = playMove;
