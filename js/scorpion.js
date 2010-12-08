YUI.add("scorpion", function (Y) {

Y.namespace("scorpion");

var Solitaire = Y.Solitaire,
    Scorpion = Solitaire.Scorpion = instance(Solitaire, {
	fields: ["Foundation", "Deck", "Tableau"],

	deal: function () {
		var card,
		    stack,
		    row,
		    deck = this.deck,
		    stacks = this.tableau.stacks;

		for (row = 0; row < 7; row++) {
			for (stack = 0; stack < 7; stack++) {
				card = deck.pop();

				if (!(row < 3 && stack < 4)) { card.faceUp(); }

				stacks[stack].push(card);
			}
		}

		deck.createStack();
	},

	turnOver: function () {
		var deck = this.deck,
		    stacks = this.tableau.stacks,
		    i, len;

		for (i = 0; i < 3; i++) {
			deck.pop().faceUp().moveTo(stacks[i]);
		}
	},

	Stack: instance(Solitaire.Stack),

	Deck: instance(Solitaire.Deck, {
		stackConfig: {
			total: 1,
			layout: {
				top: 0,
				left: function () { return Solitaire.Card.width * 9; }
			},
		},
		field: "deck",

		createStack: function () {
			var i, len;

			for (i = this.cards.length - 1; i >= 0; i--) {
				this.stacks[0].push(this.cards[i]);
			}
		},
	}),

	Foundation: {
		stackConfig: {
			total: 1,
			layout: {
				top: function () { return Solitaire.Card.height * 1.25; },
				left: function () { return Solitaire.Card.width * 9; }
			}
		},
		field: "foundation"
	},

	Tableau: {
		stackConfig: {
			total: 7,
			layout: {
				hspacing: 1.25,
				top: 0,
				left: 0
			}
		},
		field: "tableau"
	},

	Card: instance(Solitaire.Card, {
		validTarget: function (stack) {
			var target = stack.last();

			if (stack.field !== "tableau") { return false; }

			if (!target) {
				return this.rank === 13;
			} else {
				return !target.isFaceDown && target.suit === this.suit && target.rank === this.rank + 1;
			}
		}
	})
});

Y.Array.each(Scorpion.fields, function (field) {
	Scorpion[field].Stack = instance(Scorpion.Stack);
});


Y.mix(Scorpion.Stack, {
	cssClass: "freestack",

	validTarget: function (stack) {
		return stack.field === "tableau" &&
		    this.first().validTarget(stack);
	},

	validProxy: function (card) {
		return true;
	},

	validTarget: function (stack) {
		var rank,
		    cards = this.cards,
		    i;

		switch (stack.field) {
		case "tableau":
			return this.first().validTarget(stack);
			break;
		case "foundation":
			rank = this.last.rank;
			if (cards.length !== 13) { return false; }

			for (i = 0; i < 13; i++) {
				if (cards[i].rank !== rank) { return false; }
			}

			return true;
			break;
		}
	}
}, true);

Y.mix(Scorpion.Tableau.Stack, {
	setCardPosition: function (card) {
		var last = this.cards.last(),
		    top = last ? last.top + last.rankHeight : this.top,
		    left = this.left;

		card.left = left;
		card.top = top;
	}
}, true);

Scorpion.Foundation.Stack.cssClass = "freefoundation";

}, {requires: ["solitaire"]});
