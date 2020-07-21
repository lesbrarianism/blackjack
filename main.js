/* Blackjack by R. M. Ray @ https://github.com/lesbrarianism

This is a grad student project for Advanced Web Applications.  Some code is original, some is modified or intermixed using source codes from:
- https://www.thatsoftwaredude.com/content/6417/how-to-code-blackjack-using-javascript
- https://code-boxx.com/javascript-blackjack/ */

"use strict";

var suits = ["spades", "hearts", "diamonds", "clubs"];
var values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
var deck = [];
var players = [];
var gameOver = false;
var player1Cards = document.getElementById("player1-cards");
var houseCards = document.getElementById("house-cards");

function Card(value, suit, weight) {
  this.value = value;
  this.suit = suit;
  this.weight = weight;
}

function Player(name, hand, points, stand) {
  this.name = name;
  this.hand = hand;
  this.points = points;
  this.stand = stand;
}

// PARAM target: 0 for house, 1 for player1
var house = new Player("House", [], 0, false);
var player1 = new Player("Player", [], 0, false);
players = [house, player1];
// important: players[0] will be house, and players[1] will be player1, to reflect the PARAM target

// Hide first House card
function hide(x) {
  if (x === true) {
    houseCards.firstElementChild.classList.add("card-back");
  } else {
    houseCards.firstElementChild.classList.remove("card-back");
  }
}

function start() {
  var startGame = document.getElementById("start-btn");
  startGame.innerHTML = "restart";
  reset();
  document.getElementById("hit-btn").classList.remove("hide-btn");
  document.getElementById("stand-btn").classList.remove("hide-btn");
  document.getElementById("hit-btn").disabled = false;
  document.getElementById("stand-btn").disabled = false;
  createDeck();
  shuffle();
  deal(0);
  hide(true);
  deal(1);
  deal(0);
  deal(1);
  check();
}

function createDeck() {
  deck = [];
  for (var v = values.length - 1; v >= 0; v--) {
    for (var s = suits.length - 1; s >= 0; s--) {
      var weight = parseInt(values[v]);
      if (values[v] == "J" || values[v] == "Q" || values[v] == "K") {
        weight = 10;
      }
      if (values[v] == "A") {
        weight = 0;
      } // we will come back to this in getPoints()
      deck.push(new Card(values[v], suits[s], weight));
    }
  }
}

// Random deck shuffle -- Fisher-Yates algorithm
// https://medium.com/@nitinpatel_20236/how-to-shuffle-correctly-shuffle-an-array-in-javascript-15ea3f84bfb
// Switch the values of two random cards
function shuffle() {
  for (var i = deck.length - 1; i >= 0; i--) {
    var j = Math.floor(Math.random() * i);
    var temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }
}

function deal(target) {
  var card = deck.pop();

  if (target == 1) {
    player1.hand.push(card);
    renderCard(card, 1);
    getPoints(1);
  } else {
    house.hand.push(card);
    renderCard(card, 0);
    getPoints(0);
  }
  updateDeck();
}

function renderCard(card, target) {
  if (target == 1) {
    player1Cards.appendChild(getCardUI(card));
  } else {
    houseCards.appendChild(getCardUI(card));
  }
}

function getCardUI(card) {
  var divCard = document.createElement("div");
  divCard.className = "card";
  var icon = "";

  if (card.suit == "hearts") {
    icon = "&#9829;";
    divCard.className += " hearts";
  } else if (card.suit == "spades") {
    icon = "&#9824;";
    divCard.className += " spades";
  } else if (card.suit == "diamonds") {
    icon = "&#9830;";
    divCard.className += " diamonds";
  } else {
    icon = "&#9827;";
    divCard.className += " clubs";
  }

  divCard.innerHTML =
    '<div class="top">' +
    card.value +
    "<br />" +
    icon +
    "</div>" +
    '<div class="middle">' +
    icon +
    "</div>" +
    '<div class="bottom">' +
    card.value +
    "<br />" +
    icon +
    "</div>";

  return divCard;
}

function hit(target) {
  deal(target);
  // Auto-stand
  if (player1.points == 21) {
    stand(1);
  }
  if (target == 0) {
    houseAI();
  }
  check();
}

function stand(target) {
  hide(false);
  if (target == 1) {
    player1.stand = true;
    houseAI();
    getPoints(1);
  } else {
    house.stand = true;
    gameOver = true;
    getPoints(0);
  }
  check();
}

function updateDeck() {
  document.getElementById("deck").innerHTML = deck.length;
}

// returns the number of points that a player has in hand
// calculates if there are any aces
// depending on initial point count, if aces are present, a value of either 1 or 11 will be added to the player's total points
// if there are no aces, points will be calculated by their pre-assigned weights
function getPoints(target) {
  var initPoints = 0;
  var aces = 0;

  for (var i = 0; i < players[target].hand.length; i++) {
    initPoints += players[target].hand[i].weight;

    if (players[target].hand[i].value == "A") {
      aces++;
    }
    var totalPoints = initPoints;

    if (aces > 0 && initPoints <= 10) {
      totalPoints += 11;
    }
    if (aces > 0 && initPoints == 0) {
      totalPoints += 1;
    }
    if (aces > 0 && initPoints > 10) {
      totalPoints += aces;
    }
  }
  players[target].points = totalPoints;
  updateScore(target);
  check();
  return totalPoints;
}

function updateScore(target) {
  if (target == 1) {
    document.getElementById("player1-score").innerHTML = "score: " + player1.points;
  }

  if (target == 0 && gameOver === false) {
    let total = house.points;
		if (house.hand[0].value == "A") {
			total -= 11;
		} else {
			total -= house.hand[0].weight;
		}
    document.getElementById("house-score").innerHTML = "score: " + total;
  }

  if (target == 0 && gameOver === true) {
    document.getElementById("house-score").innerHTML = "score: " + house.points;
  }
}

function check() {
  var winner = null; // 0 for player, 1 for dealer, 2 for a tie
  var message = document.getElementById("status");
  // Get the modal
  var modal = document.getElementById("myModal");
  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];
  var modalBtn = document.getElementById("modal-btn");

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
  }

  // Restart game when the modal button is clicked; close modal
  modalBtn.onclick = function() {
    modal.style.display = "none";
    start();
  }

  // Slightly delay the modal from popping up
  function popup() {
    setTimeout(function() {
      modal.style.display = "block";
    }, 400);
  }

  // Tie
  if (house.hand.length == 2 && player1.hand.length == 2 && house.points == 21 && player1.points == 21) {
    winner = 2;
    popup();
    message.innerText = "It's a tie with Blackjacks!";
  }
  // House wins
  if (winner === null && player1.stand === true && house.hand.length == 2 && house.points == 21) {
    winner = 0;
    popup();
    message.innerText = "House wins with Blackjack!";
  }
  // Player wins
  if (winner === null && player1.hand.length == 2 && player1.points == 21) {
    winner = 1;
    popup();
    message.innerText = "You win with Blackjack!";
  }
  // House busts
  if (winner === null && player1.stand === true && house.points > 21) {
    winner = 1;
    popup();
    message.innerText = "House busts! You win!";
  }
  // Player busts
  if (winner === null && player1.points > 21) {
    winner = 0;
    popup();
    message.innerText = "You bust! House wins!";
  }
  // Who has more points?
  if (winner === null && player1.stand === true && house.stand === true) {
    if (house.points > player1.points) {
      winner = 0;
      popup();
      message.innerText = "House wins!";
    } else if (house.points < player1.points) {
      winner = 1;
      popup();
      message.innerText = "You win!";
    } else {
      winner = 2;
      popup();
      message.innerText = "It's a tie!";
    }
  }

  // Show House hand
  if (winner !== null) {
    gameOver = true;
    hide(false);
    document.getElementById("hit-btn").disabled = true;
    document.getElementById("stand-btn").disabled = true;
    updateScore(0);
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}

// Automated House moves
function houseAI() {
  while (house.points <= 17) {
    hit(0);
  }
  if (house.points > 17) {
    stand(0);
  }
  if (house.points == 21) {
    stand(0);
  }
}

// Check if the element has child nodes; remove them
// https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes
// https://www.w3schools.com/jsref/met_node_removechild.asp
function reset() {
  if (player1Cards.hasChildNodes()) {
    let children = player1Cards.childNodes;

    for (let i = children.length - 1; i >= 0; i--) {
      player1Cards.removeChild(children[i]);
    }
  }

  if (houseCards.hasChildNodes()) {
    let children = houseCards.childNodes;

    for (let i = children.length - 1; i >= 0; i--) {
      houseCards.removeChild(children[i]);
    }
  }
  document.getElementById("hit-btn").classList.add("hide-btn");
  document.getElementById("stand-btn").classList.add("hide-btn");
  document.getElementById("player1-score").innerText = "";
  document.getElementById("house-score").innerText = "";
  player1.hand = [];
  house.hand = [];
  player1.points = 0;
  house.points = 0;
  player1.stand = false;
  house.stand = false;
  deck = [];
  gameOver = false;
}

window.addEventListener("load", function() {
  createDeck();
  shuffle();
  updateDeck();
});
