const url = require("url");
const http = require("http");
const Test = require("./test");
const RummyDatabase = require("./rummyDatabase");

var rd = new RummyDatabase();

// const test = new Test();
// test.testCreateAndJoinGame();

var args = process.argv.slice(2);
const DEBUG = args.length > 0 && args[0] === "debug";

const log = message => {
  DEBUG && console.log(message);
};

const getUrlArray = url => {
  var urlArray = url.split("/");
  urlArray.shift();
  urlArray = urlArray.map(el => {
    return el.split("?")[0];
  });
  return urlArray;
};

const createGameHandler = (res, userID) => {
  rd.createGame(userID).then(gameID => {
    res.write(gameID);
    res.end();
  });
};
const joinGameHandler = (res, userID, gameID) => {
  rd.joinGame(userID, gameID).then(message => {
    res.write(message);
    res.end();
  });
};
const pickupDeckHandler = (res, userID) => {
  res.write(`pickupDeck - userID: ${userID}`);
  res.end();
};
const pickupDiscardHandler = (res, userID, discardPickupIndex) => {
  res.write(
    `pickupDiscard - userID: ${userID}, discardPickupIndex: ${discardPickupIndex}`
  );
  res.end();
};
const playCardsHandler = (res, userID, cards, continuedSetID) => {
  res.write(
    `playCards - userID: ${userID}, cards: ${JSON.stringify(
      cards
    )}, continuedSetID: ${continuedSetID}`
  );
  res.end();
};
const discardHandler = (res, userID, discardCard) => {
  res.write(`discard - userID: ${userID}, discardCard: ${discardCard}`);
  res.end();
};
const rummyHandler = (res, userID) => {
  res.write(`rummy - userID: ${userID}`);
  res.end();
};

// Create a server object
const app = http.createServer(function(req, res) {
  log(req.url);
  var browserUrl = req.url;
  var urlArray = getUrlArray(browserUrl);
  log(urlArray);

  try {
    var query = url.parse(browserUrl, true).query;
    log(`query:`);
    log(query);

    var headers = req.headers;
    log(`headers:`);
    log(headers);

    var userID = headers["user_id"];
    log(`userID:`);
    log(userID);

    if (!userID) {
      throw new Error("No User ID");
    } else {
      //TODO: validate userID
    }

    res.writeHead(200, { "Content-Type": "text/html" });

    switch (urlArray[0]) {
      case "createGame":
        createGameHandler(res, userID);
        break;
      case "joinGame":
        // TODO: Grab gameID from url params not header
        var gameID = headers["game_id"];
        if (!gameID) {
          throw new Error("No game ID");
        }
        joinGameHandler(res, userID, gameID);
        break;
      case "pickupDeck":
        pickupDeckHandler(res, userID);
        break;
      case "pickupDiscard":
        var discardPickupIndex = headers["discard_pickup_index"];
        if (!discardPickupIndex) {
          throw new Error("No discard pickup index");
        }
        pickupDiscardHandler(res, userID, discardPickupIndex);
        break;
      case "playCards":
        var cards = headers["cards"];
        var continuedSetID = headers["continued_set_id"];
        if (!cards) {
          throw new Error("No cards to play");
        }
        playCardsHandler(res, userID, cards, continuedSetID);
        break;
      case "discard":
        var discardCard = headers["discard_card"];
        if (!discardCard) {
          throw new Error("No card to discard");
        }
        discardHandler(res, userID, discardCard);
        break;
      case "rummy":
        rummyHandler(res, userID);
        break;
      default:
        res.writeHead(404, { "Content-Type": "text/html" });
        res.write("Not found");
    }
  } catch (err) {
    log(err);
    res.writeHead(404, { "Content-Type": "text/html" });
    res.write(`Malformed Request: ${err.message}`);
    res.end();
  }
});

app.listen(3000, function() {
  // The server object listens on port 3000
  console.log("Server started at: https://localhost:3000");
});
