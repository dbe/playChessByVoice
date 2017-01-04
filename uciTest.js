let FEN = require('chesslib').FEN;
let moveUtil = require('./moveUtil');

pos = FEN.parse("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

moveUtil.playMove(pos, 'e4').then(function(bestmove) {
  console.log("In the resolution handler. bestmove: ", bestmove);
  console.log("movetype: ", typeof(bestmove));
  console.log("from: ", bestmove["from"]);
});
