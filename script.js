
/*
<div>
    <
*/
let players = new Array;
let turn = 1;
let gamestate = 0;
let scoreboard = new Array;

class Player {
    constructor (idx) {
        this.idx = idx;
        this.name = "Player " + idx;
        this.id = this.name + "_" + this.idx;
        this.bet = 0;
        this.actual = 0;
        this.total = 0;
        this.pointsPR = new Array;
        for(let i = 0; i < 10; i++)
        {
            this.pointsPR.push(0);
        }
    }

    setName(name) {
        this.name = name;
        this.id = this.name + "_" + this.idx;
    }

    getDiv() {
        let ret = "<div id=\"" + this.id + "\">";
        ret += this.name;
        if(gamestate == 0){
            ret += "<h6> bet: " + this.bet + "</h6>";
        } else if (gamestate == 1){
            ret += "<h6> Actual: " + this.actual + "</h6>";
            ret += "<h7> (bet: " + this.bet + ")</h7>";
        } else if (gamestate == 2){
            let place = 0;
            scoreboard.forEach((score, idx, array) => {
                if(score.id == this.id)
                {
                    place = idx + 1;
                }
            })
            ret += "<h6> Place " + place + " on the scoreboard </h6>";
        }
        ret += "<button type=\"button\" onclick=\"playerIncrement(this)\">+</button>";
        ret += "<button type=\"button\" onclick=\"playerDecrement(this)\">-</button>";
        ret += "</div>"
        return ret;
    }

    getTr() {
        let ret = "<tr>";
        ret += "<th scope=\"col\">" + this.name + "</th>";
        ret += "<td>" + this.total + "</td>";
        //ret += "<td>" + this.pointsPR[0] == 0 ? "-" : this.pointsPR[0] + "</td>";
        this.pointsPR.forEach((points, idx, array) => {
            let x = "-";
            if(points != 0) {
                x = points
            }
            ret += "<td>" + x + "</td>";
        })
        
        ret += "</tr>";
        
        return ret;
    }

    calculatePoints()
    {
        let points = 0;
        if(this.bet == 0)
        {
            if(this.actual == 0)
            {
                points = turn * 10;
            } else
            {
                points = turn * -10;
            }
        }else {
            let diff = Math.abs(this.bet - this.actual);
            if(diff == 0)
            {
                points = this.bet * 20;
            }else {
                points = diff * -10;
            }
        }

        this.total += points;
        this.pointsPR[turn - 1] = points;
    }

}

function betBoundries(player)
{
    if(player.bet < 0)
    {
        player.bet = 0;
    }else if(player.bet > turn)
    {
        player.bet = turn;
    }
}

function actualBoundries(player)
{
    if(player.actual < 0)
    {
        player.actual = 0;
    } else {
        let available = turn;
        players.forEach((player, idx, array) => {
            available -= player.actual;
        })

        available += 1;


        if(player.actual > available)
        {
            player.actual -= 1;
        }
    }
    
}

function getAvailabel()
{
    let ret = turn;
    players.forEach((player, idx, array) => {
        ret -= player.actual;
    })

    console.log(ret);
    return ret;
}

function playerIncrement(button)
{
    //console.log(button);
    let id = button.parentNode.id;
    players.forEach((player, idx, array) => {
        if(player.id == id){
            if(gamestate == 0){
                player.bet += 1;
                betBoundries(player);
            } else if (gamestate == 1) {
                let available = getAvailabel();
                if(available > 0)
                {
                    player.actual += 1;
                }
                
            }
            
        } 
    })

    updatePlayerGrid();
}

function playerDecrement(button)
{
    let id = button.parentNode.id;
    players.forEach((player, idx, array) => {
        if(player.id == id){
            if(gamestate == 0){
                player.bet -= 1;
                betBoundries(player);
            } else if (gamestate == 1) {
                player.actual -= 1;
                if(player.actual <= 0)
                {
                    player.actual = 0;
                }
            }
            
        } 
    })

    updatePlayerGrid();
}

function generateScoreboard()
{
    scoreboard.slice(0, scoreboard.length);
    players.forEach((player, idx, array) => {
        scoreboard.push({score: player.total, id: player.id});
    })
    console.log(scoreboard);
    scoreboard.sort((a, b) => b.score - a.score);
    console.log(scoreboard);
}

function turnButtonCb(button)
{
    if(gamestate == 0)
    {
        gamestate = 1;
        button.innerText = "Next Turn";
    }else if(gamestate == 1)
    {
        if(getAvailabel() != 0)
        {
            //return;
        }
        players.forEach((player, idx, array) => {
            player.calculatePoints();
        })
        if(turn == 10)
        {
            gamestate = 2
            generateScoreboard();
            button.innerText = "Reset";
        } else {
            turn += 1;
            gamestate = 0;
            button.innerText = "Fix Bets";
        }
        
        players.forEach((player, idx, array) => {
            player.bet = 0;
            player.actual = 0;
        })
        
    }else if(gamestate == 2)
    {
        turn = 1;
        gamestate = 0;
        button.innerText = "Fix Bets";
        players.forEach((player, idx, array) => {
            player.bet = 0;
            player.actual = 0;
            player.total = 0;
            player.pointsPR.forEach((points, i, a) => {
                points = 0;
            })
        })
    }

    updateTurnLabel();
    updatePlayerGrid();
    updateScoreTable();
}

function updateScoreTable()
{
    let scoreTableBody = document.getElementById("scoreTableBody");
    scoreTableBody.innerHTML = "";
    players.forEach((player, idx, array) => {
        scoreTableBody.innerHTML += player.getTr();
    })

    
}

function updateTurnLabel()
{
    let turnNumberL = document.getElementById("turnNumberL");
    turnNumberL.innerText = "Turn " + turn;
}

function updatePlayerGrid()
{
    let playerGrid = document.getElementById("playerGrid");
    playerGrid.innerHTML = "";
    players.forEach((player, idx, array) => {
        playerGrid.innerHTML += player.getDiv(0);
        
    })

}

function playerNameChanged(input)
{
    //console.log(input);
    players.forEach((player, idx, array) => {
        if(player.id == input.name)
        {
            player.setName(input.value);
        }
    })

    updatePlayerGrid();
    updateScoreTable();
    
}

function updatePlayerNamesDiv()
{
    let playerNamesDiv = document.getElementById("playerNamesDiv");
    playerNamesDiv.innerHTML = "";
    players.forEach((player, idx, array) => {
        playerNamesDiv.innerHTML += "<input type=\"text\" name=\"" + player.id + "\" onchange=\"playerNameChanged(this)\" value=\"" + player.name + "\">";
    })
}

function nPlayersSCb(selector)
{
    console.log(selector.value)
    //updatePlayerControls(selector.value)
    if(turn <= 1){
        players.splice(0, players.length);
        for(let i = 0; i < selector.value; i++)
        {
            players.push(new Player(i));
        }
        updatePlayerGrid();
        updateScoreTable();
        updatePlayerNamesDiv();
    }

}

//Init

let nPlayersS = document.getElementById("nPlayersS");
nPlayersS.selectedIndex = 2;

gamestate = 0;
turn = 1;

for(let i = 0; i < 4; i++)
{
    players.push(new Player(i));
}

updatePlayerGrid()
updateTurnLabel();
updateScoreTable();
updatePlayerNamesDiv();

