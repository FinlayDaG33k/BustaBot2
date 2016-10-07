/*
FinlayDaG33k's Script v2016.10.07.20.41
Do not sell script! (it's against my rules :C) 
Build upon Procon's Script.
 
Simple rules apply:
	- Do not sell my script, sharing it is okay though.
	- Give me drink a when see me, I prefer Mountain Dew Citrus Blast.
	- Give me a hug when see me.
	- If make profit, donate some bits. This way I can try to increase the bot's power.
	- Don't claim script as if it where your own.
	- If you improve script, make a commit to the Github.
	- I can NOT be held liable for any problems that occur, so no refunds on loss of bits :) (though you can open a ticket!)

Algorithm:
	- Onwin: return to baseBet
	- Onloss:
		- Wait a few games
		- Multiply last bet by 4, make multiplier so that bet does not have to be very high.
		- Hope we win again
*/

// User Settings
var baseBet = 1;
var baseMultiplier = 1.10;
var variableBase = false; // Enable variable mode (very experimental)
var maximumBet = 1000000; // Maximum bet the bot will do (in bits).
var streakSecurity = 4; // Number of loss-streak you wanna be safe for. (Reccommended is 4)
var maxBalance = 10000; //The bot will stop when your total balance is higher that this value (in bits).

// Bot Variables - Do not touch! (seriously, dont, it might break the poor bot :C)
var baseSatoshi = baseBet * 100; // Calculated
var currentBet = baseSatoshi;
var currentMultiplier = baseMultiplier;
var currentGameID = -1;
var firstGame = true;
var lossStreak = 0;
var coolingDown = false;
var startBalance = engine.getBalance();

engine.on('game_starting', function(info) {
    console.log('[Bot] Game Starting!');
});

engine.on('game_started', function(data) {
    console.log('[Bot] Game Started', data);
});

engine.on('game_crash', function(data) {
    console.log('[Bot] Game crashed at ', data.game_crash);
});

engine.on('game_starting', function(info) {
    console.log('====== New Game ======');
    console.log('[Bot] Game #' + info.game_id);
    currentGameID = info.game_id;

    if (coolingDown) {     
		if (lossStreak == 0) {
			coolingDown = false;
		}else {
			lossStreak--;
			console.log('[Bot] Cooling down! Games remaining: ' + lossStreak);
			return;
		}
    }
	
    if (engine.lastGamePlay() == 'LOST' && !firstGame) { // If last game loss:
		lossStreak++;
		var totalLosses = 0; // Total satoshi lost.
		var lastLoss = currentBet; // Store our last bet.
		while (lastLoss >= baseSatoshi) { // Until we get down to base bet, add the previous losses.
			totalLosses += lastLoss;
			lastLoss /= 4;
		}
		
	
		if (lossStreak > streakSecurity) { // If we're on a loss streak, wait a few more games!
			coolingDown = true;
			return;
		}else{
			coolingDown = true;
		}
		
		currentBet *= 4; // Then multiply base bet by 4!
		currentMultiplier = 1 + (totalLosses / currentBet);
    }else { // Otherwise if win or first game:
		lossStreak = 0; // If it was a win, we reset the lossStreak.
		if (variableBase) { // If variable bet enabled.
			// Variable mode resists (currently) 1 loss, by making sure you have enough to cover the base and the 4x base bet.
			var divider = 100;
			for (i = 0; i < streakSecurity; i++) {
				divider += (100 * Math.pow(4, (i + 1)));
			}
				
			newBaseBet = Math.min(Math.max(1, Math.floor(engine.getBalance() / divider)), maximumBet * 100); // In bits
			newBaseSatoshi = newBaseBet * 100;

			if ((newBaseBet != baseBet) || (newBaseBet == 1)) {
				console.log('[Bot] Variable mode has changed base bet to: ' + newBaseBet + ' bits');
				baseBet = newBaseBet;
				baseSatoshi = newBaseSatoshi;
			}
		}
		// Update bet.
		currentBet = baseSatoshi; // in Satoshi
		currentMultiplier = baseMultiplier;
    }

    // Message and set first game to false to be sure.
    console.log('[Bot] Betting ' + (currentBet / 100) + ' bits, cashing out at ' + currentMultiplier + 'x');
    firstGame = false;

    if (currentBet <= engine.getBalance()){ // Ensure we have enough to bet
		if (currentBet > (maximumBet * 100)) { // Ensure you only bet the maximum.
			console.warn('[Warn] Bet size exceeds maximum bet, lowering bet to ' + (maximumBet * 100) + ' bits');
			currentBet = maximumBet;
		}
		engine.placeBet(currentBet, Math.round(currentMultiplier * 100), false); // Place the bet
    }else{ // Otherwise insufficent funds...
		if (engine.getBalance() < 100) {
			console.error('[Bot] Insufficent funds to do anything... stopping');
			engine.stop();
		}else{
			console.warn('[Bot] Insufficent funds to bet ' + (currentBet / 100) + ' bits.');
			console.warn('[Bot] Resetting to 1 bit basebet');
			baseBet = 1;
			baseSatoshi = 100;
		}
    }
});
