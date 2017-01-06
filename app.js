// [START app]
'use strict';

process.env.DEBUG = 'actions-on-google:*';

var Assistant = require('actions-on-google').ApiAiAssistant;
var express = require('express');
var bodyParser = require('body-parser');
var Chess = require('chess.js').Chess;

var moveUtil = require('./moveUtil');
var Persistance = require('./persistance');

var app = express();
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

const EXTRACTABLE_ARGS = [DISAMBIGUATION_FILE_ARGUMENT, DISAMBIGUATION_RANK_ARGUMENT, PIECE_ARGUMENT, FILE_ARGUMENT, RANK_ARGUMENT];

//TODO: Extract this another file
const PIECE_TO_ALGEBRAIC = {
  'Rook': 'R',
  'Knight': 'N',
  'Bishop': 'B',
  'King': 'K',
  'Queen': 'Q',
  'Pawn': ''
};

//Constants
const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

app.get('/', function(request, response) {
  response.send("Homepage of the Play Chess By Voice program.");
});

app.post('/', function (request, response) {
  const assistant = new Assistant({request: request, response: response});

  var actionMap = new Map();
  actionMap.set(LETS_PLAY_INTENT, letsPlayIntent);
  actionMap.set(RESIGN_INTENT, resignIntent);
  actionMap.set(PLAY_MOVE_INTENT, playMoveIntent);

  assistant.handleRequest(actionMap);


  //TODO: Handle case where user already has a game started.
  function letsPlayIntent(assistant) {
    var side = assistant.getArgument(SIDE_ARGUMENT);
    var game = new Chess();
    var userId = extractUserId(assistant);

    if(side == 'white') {
      Persistance.persistGame(game, userId);
      assistant.ask("Ok, you are white. What is your first move?");
    } else {
      moveUtil.calcBestMove(game).then(function(bestMove) {
        var move = game.move(bestMove);
        Persistance.persistGame(game, userId);

        assistant.ask("Ok, you are black. My first move is " + moveUtil.moveToSpeech(move));
      });
    }
  }
  
  function resignIntent(assistant) {
    //TODO: Mark game as completed
  }

  function playMoveIntent(assistant) {
    var userId = extractUserId(assistant);

    Persistance.getGame(userId).then(function(gameData) {
      var desiredMove = extractDesiredMove(assistant);
      var game = new Chess(gameData.fen);
      var humanMove = game.move(desiredMove);

      //TODO: Improve this UX
      if(humanMove == null) {
        assistant.ask("That move is illegal. Try again");
      }

      moveUtil.calcBestMove(game).then(function(bestMove) {
        var computerMove = game.move(bestMove);
        Persistance.persistGame(game, userId);

        assistant.ask("Ok, you moved: " + moveUtil.moveToSpeech(humanMove) + ". My move is: " + moveUtil.moveToSpeech(computerMove));
      });
    });
  }

  //TODO: Acutally get the user ID
  function extractUserId(assisant) {
    return 1;
  }

  function extractDesiredMove(assistant) {

    return extractAndAppendArgs(EXTRACTABLE_ARGS);

    // --- Private functions just for this method ---//
    function extractAndAppendArgs(args) {
      var move = '';

      for(var i in args) {
        move += extractArg(args[i]);
      }

      return move;
    }
    
    function extractArg(arg) {
      var value = assistant.getArgument(arg);

      if(arg == PIECE_ARGUMENT && value != undefined) {
        value = PIECE_TO_ALGEBRAIC[value];
      }

      return value ? value : '';
    }
  }
  //--- End Private functions ---//
});

// Start the server
var server = app.listen(app.get('port'), function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
