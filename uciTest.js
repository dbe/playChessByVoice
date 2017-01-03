let FEN = require('chesslib').FEN;
let playMove = require('./playMove');

pos = FEN.parse("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
playMove(pos, 'e4').then(function(bestmove) {
  console.log("In the resolution handler. bestmove: ", bestmove);
});
