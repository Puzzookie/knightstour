export default class KnightsTour 
{    
    getInitBoard() { return this.initBoard; }
    getRows() { return this.rows; }
    getCols() { return this.cols; }
    getNumOfPlayers() { return this.numOfPlayers; }
    getGameBoard() { return this.gameBoard; }
    getValidMoveIndices() { return this.validMoveIndices; }
    getAllIndices() { return this.allIndices; }
    getNumEnabled() { return this.numEnabled; }
    getGameStatus() { return this.gameStatus; }
    getTurn() { return (this.allIndices.length % this.numOfPlayers); }
    indexToCoordinates(index) { return {  x: (index % this.cols), y: Math.floor(index / this.cols) }; }
    coordinatesToIndex(x, y) { return x + y * this.cols; }

    constructor(initBoard, rows, cols, numOfPlayers = 1) 
    {
        this.initBoard = initBoard;
        this.rows = rows;
        this.cols = cols;
        this.numOfPlayers = numOfPlayers;
        this.colors = ["red", "blue", "green", "yellow", "orange"]

        this.reset();
    }

    reset()
    {
        this.gameBoard = this.initBoard.split('').map(char => char === '1' ? '' : '');
        this.validMoveIndices = [];
        this.allIndices = [];
        this.numEnabled = 0;
        this.gameStatus = "";

        for(let i = 0; i < this.initBoard.length; i++)
        {
            if(this.initBoard[i] !== '0')
            {
                this.numEnabled++;
            }
        }
    }

    move(index)
    {
        if(this.allIndices.length < this.numOfPlayers || this.validMoveIndices.includes(index))
        {
            this.gameBoard[index] = Math.floor(this.allIndices.length / this.numOfPlayers) + 1;
            this.allIndices.push(index);
            this.updateValidMoveIndices();
            this.checkGameOver();
        }
    }

    undo()
    {
        if(this.allIndices.length > 0)
        {
            const lastIndex = this.allIndices.pop();
            if(!this.allIndices.includes(lastIndex))
            {
                this.gameBoard[lastIndex] = '';
            }
            this.updateValidMoveIndices();
            if(this.validMoveIndices.length === 0 && this.allIndices.length > this.numOfPlayers)
            {
                this.undo();
            }
        }
    }
  
    updateValidMoveIndices()
    {
        this.validMoveIndices = [];

        if(Math.floor(this.allIndices.length / this.numOfPlayers) > 0)
        {        
            const possibleIndices = this.possibleMovesAtIndex(this.allIndices[(this.allIndices.length - this.numOfPlayers)]);
            
            for(let i = 0; i < possibleIndices.length; i++)
            {
                this.validMoveIndices.push(possibleIndices[i]);
            }
        }
    }

    possibleMovesAtIndex(index, boardContextEnabled = true) {

        let allPossible = [];
      
        let moves = [
          [-2, -1], [-2, 1], [2, -1], [2, 1],
          [-1, -2], [-1, 2], [1, -2], [1, 2]
        ];
      
        let coordinates = this.indexToCoordinates(index);

        for (let i = 0; i < moves.length; i++) {
          let newX = coordinates.x + moves[i][0];
          let newY = coordinates.y + moves[i][1];
          let piece = { x: newX, y: newY };
      
          if(piece.x >= 0 && piece.x < this.cols && piece.y >= 0 && piece.y < this.rows)
          {
            let pieceIndex = this.coordinatesToIndex(piece.x, piece.y);
            if(boardContextEnabled)
            {
                if(!this.allIndices.includes(pieceIndex) && this.initBoard[pieceIndex] !== '0')
                {
                    allPossible.push(pieceIndex);
                }
            }
            else
            {
                allPossible.push(pieceIndex);
            }
          }
        }
        return allPossible;
    }

    checkGameOver()
    {
        if(this.validMoveIndices.length === 0 && (Math.floor(this.allIndices.length / this.numOfPlayers) > 0))
        {   
            this.allIndices.push(this.allIndices[this.allIndices.length - this.numOfPlayers]);

            let allSame = true;
            for(let i = 0; i < this.numOfPlayers; i++)
            {
                if(this.allIndices[this.allIndices.length - this.numOfPlayers + i] !== this.allIndices[this.allIndices.length - (this.numOfPlayers * 2) + i])
                {
                    allSame = false;
                }
            }
           
            if(allSame)
            {
                this.updateGameStatus("versus");
            }
            else
            {
                this.updateValidMoveIndices();
                if(this.validMoveIndices.length === 0)
                {
                    this.checkGameOver();
                }
            }
        }
    }

    getPlayerMovesLength()
    {
        let playerMovesLength = [];

        for(let i = 0; i < this.numOfPlayers; i++)
        {
            let playerLength = [];
            playerMovesLength.push(playerLength);
        }

        for(let i = 0; i < this.allIndices.length; i++)
        {
            let index = i % this.numOfPlayers;
            if(!playerMovesLength[index].includes(this.allIndices[i]))
            {
                playerMovesLength[index].push(this.allIndices[i]);
            }
        }

        return playerMovesLength;
    }

    updateGameStatus(type)
    {
        if(this.numOfPlayers > 1)
        {
            let playerMovesLength = this.getPlayerMovesLength();
            if(type === "co-op")
            {
                let total = 0;
                for(let i = 0; i < playerMovesLength.length; i++)
                {
                    total += playerMovesLength[i].length;
                }

                if(total === (this.numEnabled))
                {
                    //co-op complete
                    this.gameStatus = "closed";
                }
                else
                {
                    //co-op incomplete
                    this.gameStatus = "closed incomplete"
                }
            }
            else if(type === "versus")
            {

                let maxLength = -1;
                for(let i = 0; i < playerMovesLength.length; i++)
                {
                    if(playerMovesLength[i].length > maxLength)
                    {
                        maxLength = playerMovesLength[i].length;
                    }
                }

                let winners = [];

                for(let i = 0; i < playerMovesLength.length; i++)
                {
                    if(playerMovesLength[i].length === maxLength)
                    {
                        winners.push(i);
                    }
                }

                this.gameStatus = "";

                for(let i = 0; i < winners.length; i++)
                {
                    this.gameStatus += this.colors[winners[i]] + " wins";
                    //console.log(this.colors[winners[i]] + " wins");
                }
            }
        }
        else
        {
            const possible = this.possibleMovesAtIndex(this.allIndices[0], false);
            let closed = false;

            if(possible.includes(this.allIndices[this.allIndices.length - 1]))
            {
                closed = true;
            }

            if(this.allIndices.length >= (this.numEnabled))
            {
                if(closed)
                {
                    this.gameStatus = "closed";
                }
                else
                {
                    this.gameStatus = "open";
                }
            }
            else
            {
                this.gameStatus = "incomplete";
            }
        }

        console.log(this.gameStatus);
    }

    getKey()
    {
        let key = "";
        for(let i = 0; i < this.gameBoard.length; i++)
        {
            if(this.gameBoard[i] === "")
            {
                key += "0";
            }
            else
            {
                key += "1";
            }
        }
        return key;
    }
    generateBoard(attempts = 1, threshold = (1000))
    {        
        if(attempts >= threshold)
        {
            this.reset();
            console.log("Unable to generate a solution given " + attempts + " attempts");
            return;
        }

        for(let i = this.allIndices.length; i < this.numEnabled; i++)
        {
           this.generateNext();
        }

        if(!this.gameStatus.startsWith("closed") || this.allIndices.length < this.numEnabled / 2)
        {
            this.reset();
            this.generateBoard(attempts + 1);
        }
        else
        {
            let newInitBoard = "";
            for(let i = 0; i < this.initBoard.length; i++)
            {
                if(this.allIndices.includes(i))
                {
                    newInitBoard += "1";
                }
                else
                {
                    newInitBoard += "0";
                }
            }
            console.log("Took " + attempts + " attempts. New board: " + newInitBoard);
            this.newPuzzle = newInitBoard;
        }
    }

    generateNext()
    {
        if(this.allIndices.length < this.numOfPlayers)
        {
            let allPossibleStartingPositions = [];
            for(let i = 0; i < this.initBoard.length; i++)
            {
                if(this.initBoard[i] === '1')
                {
                    allPossibleStartingPositions.push(i);
                }
            }
            const randomIndex = Math.floor(Math.random() * allPossibleStartingPositions.length);
            this.move(allPossibleStartingPositions[randomIndex]);
        }
        else
        {
            const possibleIndices = this.possibleMovesAtIndex(this.allIndices[(this.allIndices.length - this.numOfPlayers)]);
            let selection = possibleIndices[Math.floor(Math.random() * possibleIndices.length)];
            this.move(selection);
        }        
    }

    solveNext()
    {
        if(this.allIndices.length < this.numOfPlayers)
        {
            let allPossibleStartingPositions = [];
            for(let i = 0; i < this.initBoard.length; i++)
            {
                if(this.initBoard[i] === '1' && !this.allIndices.includes(i))
                {
                    allPossibleStartingPositions.push(i);
                }
            }
            const randomIndex = Math.floor(Math.random() * allPossibleStartingPositions.length);
            this.move(allPossibleStartingPositions[randomIndex]);
        }
        else
        {
            const possibleIndices = this.possibleMovesAtIndex(this.allIndices[(this.allIndices.length - this.numOfPlayers)]);
            const allNextPossible = possibleIndices.map(index => this.possibleMovesAtIndex(index));
            const minLength = Math.min(...allNextPossible.map(arr => arr.length));

            let smallestIndices = [];

            for(let i = 0; i < allNextPossible.length; i++)
            {
                if(allNextPossible[i].length === minLength)
                {
                    smallestIndices.push(possibleIndices[i]);
                }
            }

            if (this.allIndices.length > 1) 
            {
                const possibleFirstIndices = this.possibleMovesAtIndex(this.allIndices[0], false);
                let newSmallestIndices = [];
                for (let i = 0; i < smallestIndices.length; i++) 
                {
                    if (!possibleFirstIndices.includes(smallestIndices[i])) 
                    {
                        newSmallestIndices.push(smallestIndices[i]);
                    }
                }
                if(newSmallestIndices.length > 0)
                {
                    smallestIndices = newSmallestIndices;
                }
            }            
            
            let selection = smallestIndices[Math.floor(Math.random() * smallestIndices.length)];
            this.move(selection);
        }        
    }

    solveBoard(attempts = 1, threshold = (1000))
    {        
        if(attempts >= threshold)
        {
            this.reset();
            console.log("Unable to generate a solution given " + attempts + " attempts");
            return;
        }

        for(let i = this.allIndices.length; i < this.numEnabled; i++)
        {
            this.solveNext();
        }

        if(!this.gameStatus.startsWith("closed"))
        {
            this.reset();
            this.solveBoard(attempts + 1);
        }
        else
        {
            console.log("Took " + attempts + " attempts");
        }
    }
  }