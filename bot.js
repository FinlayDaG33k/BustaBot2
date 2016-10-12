/*
FinlayDaG33k's Script v2016.10.12.18.28
Do not sell script! (it's against my rules :C) 
 
Simple rules apply:
	- Do not sell my script, sharing it is okay though.
	- Give me drink a when see me, I prefer Mountain Dew Citrus Blast.
	- Give me a hug when see me.
	- If make profit, donate some bits. This way I can try to increase the bot's power.
	- Don't claim script as if it where your own.
	- If you improve script, make a commit to the Github.
*/

// User Settings
var baseBet = 1;    // Set the base bet here. (integer)
var basecashOut = 1.05; // Set the base cashout multiplier here. (float)

// Change stuff below at risk of breaking bot :D 
var skip1 = 6; // Skip games after first loss
var skip2 = 0; // Skip games after second loss
var skip3 = 6; // Skip games after third loss
var skip4 = 0; // Skip games after fourth loss
var skip5 = 6; // Skip games after fifth loss
var skip6 = 2; // Skip games after every next loss
var bet = baseBet * 100;
var currentBet = bet;
var startBalance = engine.getBalance();
var currentBalance = startBalance;
var losses = 0;
var skip = 0;
var lostGames = 0;
var waitXgames = 0;
var CO = 0;


engine.on('game_starting', function(info){
    if(currentBet && engine.lastGamePlay() == 'LOST'){
        lostGames++;
        currentBalance = engine.getBalance();
        losses = startBalance - currentBalance;
		
        currentBet *= 2;
        cashOut = (losses / currentBet) + 1.01;

        if (lostGames >= 3) {

            waitXgames = 0;

            if(lostGames == 3){ // If we lost 3 games in a row.
                skip = skip1;
            }
            if(lostGames == 4){ // If we lost 4 games in a row.
                skip = skip2;
            }
            if(lostGames == 5){ // If we lost 5 games in a row.
                skip = skip3;
            }
            if(lostGames == 6){ // If we lost 6 games in a row.
                skip = skip4;
            }
            if(lostGames == 7){ // If we lost 7 games in a row.
                skip = skip5;
            }
            if(lostGames >= 8){ // If we lost 8 games in a row.
                skip = skip6;
            }
        }
    }else{
        currentBalance = engine.getBalance();
        if (currentBalance > startBalance) {

            currentBet = bet;
            cashOut = basecashOut;

            startBalance = engine.getBalance();
            lostGames = 0;
            skip = 0;
        }
    }
    if (waitXgames >= skip) {
        console.log('Placing bet of', Math.floor(currentBet / 100), 'at', Math.round(cashOut * 100) / 100, 'Cash out.');
        engine.placeBet(Math.floor(currentBet / 100) * 100, Math.floor(cashOut * 100), false);
    }

});
engine.on('game_crash', function(data){
    if(data.game_crash / 100 >= CO){
        waitXgames++;
    }else{
        waitXgames++;
    }
});
