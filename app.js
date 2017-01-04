// [START app]
'use strict';

process.env.DEBUG = 'actions-on-google:*';

let Assistant = require('actions-on-google').ApiAiAssistant;
let express = require('express');
let bodyParser = require('body-parser');

let chessLib = require('chesslib');
let FEN = chessLib.FEN;
let Position = chessLib.Position

let moveUtil = require('./moveUtil');

let app = express();
app.set('port', (process.env.PORT || 8080));
app.use(bodyParser.json({type: 'application/json'}));


// API.AI Intents
const LETS_PLAY_INTENT = 'lets_play';
const RESIGN_INTENT = 'resign';
const PLAY_MOVE_INTENT = 'play_move';

// API.AI Arguments
const SIDE_ARGUMENT = 'side';
const PIECE_ARGUMENT = 'piece';
const FILE_ARGUMENT = 'file';
const RANK_ARGUMENT = 'rank';
const DISAMBIGUATION_FILE_ARGUMENT = 'disambiguation_file';
const DISAMBIGUATION_RANK_ARGUMENT = 'disambiguation_rank';

app.get('/', function(request, response) {
  response.send("Homepage of the Play Chess By Voice program.");
});

app.post('/', function (request, response) {
  const assistant = new Assistant({request: request, response: response});

  let actionMap = new Map();
  actionMap.set(LETS_PLAY_INTENT, letsPlayIntent);
  actionMap.set(RESIGN_INTENT, resignIntent);
  actionMap.set(PLAY_MOVE_INTENT, playMoveIntent);

  assistant.handleRequest(actionMap);


  function letsPlayIntent(assistant) {
    console.log("OREO: Inside LetsPlayIntent. TODO: Game started and id's saved");

    let side = assistant.getArgument(SIDE_ARGUMENT);

    //TODO: Handle case where user already has a game started.
    //TODO: Pass in userId
    let pos = initNewGame();

    if(side == 'white') {
      assistant.ask("Ok, you are white. What is your first move?");
    } else {
      let bestMove = moveUtil.calcBestMove(pos);
      pos = playMove(pos, bestMove);

      //TODO: Save new board state to db

      assistant.ask("Ok, you are black. My first move is " + bestMove);
    }
  }
  
  function resignIntent(assistant) {
    //TODO: Mark game as completed
    console.log("OREO: Inside Resign Intent");
  }

  function playMoveIntent(assistant) {
    console.log("OREO: Inside playMoveIntent");

    var pos = FEN.parse("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

    var bestMove = moveUtil.playMove(pos, "e4");

    bestMove.then(function(bestmove) {
      console.log("In the resolution of bestMove. Best move: ", bestmove);
      assistant.ask("Ok I play " + bestMove);
    });
  }

  function initNewGame(userId) {
    var pos = new Position();

    //TODO: Store position in db
    
    return pos;
  }
});

// Start the server
let server = app.listen(app.get('port'), function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
