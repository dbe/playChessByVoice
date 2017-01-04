//TODO: Abstract this out so it will work on the server
const STOCK_PATH = "/Users/dbe/Stockfish/src/stockfish";

var Q = require('q');
var UCI = require('uci');
var chessLib = require('chesslib');
var FEN = chessLib.FEN;

//initialPosition is a chessLib.Position
//desiredMove is a string in algebraic notation
//If the move is illegal, the function will throw an Error of the associated type //TODO: Describe the exact errors here in more detail
function playMove(initialPosition, desiredMove) {
  console.log("Postion before: ", FEN.stringify(initialPosition));

  //This throws errors if the move is illegal
  var pos = initialPosition.move(desiredMove);

  console.log("Position after playing desired move: ", FEN.stringify(pos));

  return pos;
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
    let alg = bestMoveToAlgebraic(bestmove);

    deferred.resolve(alg);

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

//Takes a UCI "bestmove" object and returns an algebraic notation string
function bestMoveToAlgebraic(move) {
  //TODO: Actually do this translateion
  return move;
}


module.exports.playMove = playMove;
module.exports.calcBestMove = calcBestMove;
