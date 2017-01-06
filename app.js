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
let Persistance = require('./persistance');

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

//Constants
const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

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


  //TODO: Handle case where user already has a game started.
  function letsPlayIntent(assistant) {
    let side = assistant.getArgument(SIDE_ARGUMENT);
    let pos = initNewGame();
    let userId = extractUserId(assistant);

    if(side == 'white') {
      assistant.ask("Ok, you are white. What is your first move?");
    } else {
      let bestMove = moveUtil.calcBestMove(pos);
      pos = playMove(pos, bestMove);

      assistant.ask("Ok, you are black. My first move is " + bestMove);
    }

    //TODO: Careful here to make sure this happens even after the assisntant.ask
    console.log("Saving to DB");
    Persistance.persistPosition(pos, userId);
  }
  
  function resignIntent(assistant) {
    //TODO: Mark game as completed
    console.log("OREO: Inside Resign Intent");
  }

  function playMoveIntent(assistant) {
    console.log("OREO: Inside playMoveIntent");
    var userId = extractUserId(assistant);

    getGamePosition(userId).then(function(pos) {
      var desiredMove = extractDesiredMove(assistant);

      pos = pos.playMove(desiredMove);
    });
  }

  //TODO: Acutally get the user ID
  function extractUserId(assisant) {
    return 1;
  }

  function extractDesiredMove(assistant) {
    //TODO: Make this acutally parse the desired move
    return 'e4';
  }

  function getGamePosition(userId) {
    return Persistance.getGamePosition(userId);
  }

  function initNewGame(userId) {
    return FEN.parse(STARTING_FEN);
  }

});

// Start the server
let server = app.listen(app.get('port'), function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
