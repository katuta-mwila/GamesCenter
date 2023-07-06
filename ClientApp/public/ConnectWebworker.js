const CenterColumnPoints = 70
const Connect2Points = 30
const Connect3Points = 90
const Connect4Points = 1_000_000

class SlotInfo{
    row;
    column;
    symbol;
    index;
    constructor(_row, _column, _symbol, _index){
        this.row = _row
        this.column = _column
        this.symbol = _symbol
        this.index = _index
    }

    getKey(){
        return 7 * this.row + this.column
    }
}

class ConnectScore{
    aiScore = new ScoreTally()
    humanScore = new ScoreTally()
    constructor(){

    }

    getScore(){
        return this.aiScore.getTotalScore() - this.humanScore.getTotalScore()
    }

    fromSymbol(sym){
        return sym == 1 ? this.humanScore : this.aiScore
    }

    clone(){
        const copy = new ConnectScore()
        copy.aiScore.centerColumn = this.aiScore.centerColumn
        copy.aiScore.connect2 = this.aiScore.connect2
        copy.aiScore.connect3 = this.aiScore.connect3
        copy.aiScore.connect4 = this.aiScore.connect4
        copy.aiScore.bonusPoints = this.aiScore.bonusPoints

        copy.humanScore.centerColumn = this.humanScore.centerColumn
        copy.humanScore.connect2 = this.humanScore.connect2
        copy.humanScore.connect3 = this.humanScore.connect3
        copy.humanScore.connect4 = this.humanScore.connect4
        copy.humanScore.bonusPoints = this.humanScore.bonusPoints

        return copy
    }
}

class ScoreTally{
    centerColumn = 0;
    connect2 = 0;
    connect3 = 0;
    connect4 = 0;
    bonusPoints = 0;

    constructor(){

    }

    getTotalScore(){
        return (this.centerColumn * CenterColumnPoints) + (this.connect2 * Connect2Points) + 
        (this.connect3 * Connect3Points) + (this.connect4 * Connect4Points) + this.bonusPoints
    }

    subtract(tally){
        this.centerColumn -= tally.centerColumn
        this.connect2 -= tally.connect2
        this.connect3 -= tally.connect3
        this.connect4 -= tally.connect4
        this.bonusPoints -= tally.bonusPoints
    }

    add(tally){
        this.centerColumn += tally.centerColumn
        this.connect2 += tally.connect2
        this.connect3 += tally.connect3
        this.connect4 += tally.connect4
        this.bonusPoints += tally.bonusPoints
    }
}

const ConnectWorker = (function(){

    let connectScore = null
    let copyBoard = null
    let difficulty = null
    let maxDepthReached = 0
    const maxRecursionPoints = 3_000_000

    function init(){
        maxDepthReached = 0
    }

    function getAvailableColumns(){
        let x = 0
        for (let col = 0; col < 7; col++){
            if (copyBoard[5][col] == 0)
                x++
        }
        return x
    }

    function usePruning(){
        return difficulty == 2
    }

    function useDynamicRecursion(){
        return difficulty == 2
    }

    function getRecursionDepth(){
        if (difficulty == 0){
            return 4
        }
        if (difficulty == 1){
            return 4
        }
        if (difficulty == 2)
            return 7
    }

    function lowestFreeSlot(column, board){
        for (let i = 0; i < 6; i++){
            if (board[i][column] == 0)
                return i
        }
        return 6
    }
    
    function boardHasSpace(board){
        for (let i = 0; i < 7; i++){
            if (board[5][i] == 0)
                return true
        }
        return false
    }

    const pointsFromLine = function(gradiant, row, column){
        const aiTally = new ScoreTally()
        const humanTally = new ScoreTally()

        const aiEmptyCount = new Map()
        const humanEmptyCount = new Map()
        const emptySlots = []
        const allSlots = []
        const counter = [0, 0, 0]

        let totalCount = 0
        let nextIndex = 0
        let lastPlayerSlot = null // most recent non empty slot
        let str = `Gradiant: ${gradiant} [`
        let done = false
        const computeSlot = (slotInfo) =>{
            if (done) return
            str += `(${slotInfo.row}, ${slotInfo.column}), `
            allSlots.push(slotInfo)
            counter[slotInfo.symbol]++
            totalCount++

            if (slotInfo.symbol == 0){
                emptySlots.push(slotInfo)
                aiEmptyCount.set(slotInfo.getKey(), 0)
                humanEmptyCount.set(slotInfo.getKey(), 0)
            }

            if (lastPlayerSlot != null && slotInfo.symbol != 0 && slotInfo.symbol != lastPlayerSlot.symbol)
                nextIndex = lastPlayerSlot.index + 4
            if (slotInfo.index >= nextIndex && totalCount == 4 && (counter[1] == 0 ^ counter[2] == 0)){
                const currentSymbol = lastPlayerSlot == null ? slotInfo.symbol : lastPlayerSlot.symbol
                const connectEmptyCount = currentSymbol == 1 ? humanEmptyCount : aiEmptyCount
                const connectTally = currentSymbol === 1 ? humanTally : aiTally
                if (counter[0] == 0){
                    connectTally.connect4++
                    done = true
                } else if (counter[0] == 1){
                    const lastEmpty = emptySlots.at(-1)
                    if (connectEmptyCount.get(lastEmpty.getKey()) == 2)
                        connectTally.connect2--
                    connectTally.connect3++
                    connectEmptyCount.set(lastEmpty.getKey(), 3)
                    nextIndex = lastEmpty.index + 4
                } else if (counter[0] == 2){
                   const empty1 = emptySlots.at(-2)
                   const empty2 = emptySlots.at(-1)
                   const empty1Count = connectEmptyCount.get(empty1.getKey())
                   const empty2Count = connectEmptyCount.get(empty2.getKey())
                   if ((empty1Count == 0 && empty2Count == 0) || (allSlots.at(-5).symbol == currentSymbol
                    && (empty1Count == 0 || empty2Count == 0))){
                        connectEmptyCount.set(empty1.getKey(), 2)
                        connectEmptyCount.set(empty2.getKey(), 2)
                        connectTally.connect2++
                    }
                }
            }
            if (totalCount == 4){
                counter[allSlots.at(-4).symbol]--
                totalCount--
            }
            lastPlayerSlot = slotInfo.symbol == 0 ? lastPlayerSlot : slotInfo   
        }

        if (gradiant === 0){
            for (let c = 0; c < 7; c++){
                computeSlot(new SlotInfo(row, c, copyBoard[row][c], c))
            }
        } else if (gradiant === null){
            for (let r = 0; r < 6; r++){
                computeSlot(new SlotInfo(r, column, copyBoard[r][column], r))
            }
        } else if (gradiant === 1){
            let startX, startY
            if (column <= row){
                startX = 0
                startY = row - column
            } else{
                startY = 0
                startX = column - row 
            }
            let x = startX, y = startY, index = 0
            while (x < 7 && y < 6){
                computeSlot(new SlotInfo(y, x, copyBoard[y][x], index))
                x++
                y++
                index++
            }
        } else if (gradiant === -1){
            let startX, startY
            if (column <= (5 - row)){
                startX = 0
                startY = row + column
            } else{
                startY = 5
                startX = column - (5 - row)
            }
            let x = startX, y = startY, index = 0
            while (x < 7 && y >= 0){
                computeSlot(new SlotInfo(y, x, copyBoard[y][x], index))
                x++
                y--
                index++
            }
        }
        str += "]"
        return [aiTally, humanTally]
    }

    const updateScore = function(gradiant, row, column){
        const sym = copyBoard[row][column]
        copyBoard[row][column] = 0
        const beforeTallys = pointsFromLine(gradiant, row, column)
        copyBoard[row][column] = sym
        const afterTallys = pointsFromLine(gradiant, row, column)

        afterTallys[0].subtract(beforeTallys[0])
        afterTallys[1].subtract(beforeTallys[1])


        connectScore.aiScore.add(afterTallys[0])
        connectScore.humanScore.add(afterTallys[1])
        if (gradiant == -1 && row == 2 && column == 4 && connectScore.humanScore.connect4 > 0){
            const a = JSON.stringify(connectScore)
            const b = JSON.stringify(copyBoard)
        }
            
    }


    const updateDirections = function(row, column){
        updateScore(0, row, column)
        updateScore(null, row, column)
        updateScore(1, row, column)
        updateScore(-1, row, column)
        if (column == 3){
            connectScore.fromSymbol(copyBoard[row][column]).centerColumn++
        }
    }

    const minimax = function(maximizingPlayer, d, recursionPoints, alpha, beta){
        maxDepthReached = Math.max(maxDepthReached, d)
        if (d == 0 && (copyBoard[0][3] == 0 || copyBoard[1][3] == 0)){
            //return [3, 69]
        }
        const sym1 = 2
        const sym2 = 1
        if (connectScore.aiScore.connect4 > 0)
            return [null, Number.MAX_SAFE_INTEGER - d]
        if (connectScore.humanScore.connect4 > 0){
            return [null, Number.MIN_SAFE_INTEGER + d]
        }
        if (!boardHasSpace(copyBoard))
            return [null, 0]
        if ((useDynamicRecursion() && recursionPoints >= maxRecursionPoints) || (!useDynamicRecursion() && d === getRecursionDepth())){
            return [null, connectScore.getScore()]
        }
        
        if (maximizingPlayer){
            const allScores = [null, null, null, null, null, null, null]
            let value = Number.MIN_SAFE_INTEGER
            let maxColumn = null
            const availableColumns = getAvailableColumns()
            for (let i = 0; i < 7; i++){
                if (copyBoard[5][i] != 0) continue
                const [row, column] = [lowestFreeSlot(i, copyBoard), i]
                maxColumn = maxColumn == null ? column : maxColumn
                copyBoard[row][column] = sym1
                const oldScore = connectScore.clone()
                updateDirections(row, column)
                const next = minimax(false, d + 1, recursionPoints * availableColumns, alpha, beta)
                if (d == 0)
                    allScores[i] = {column, score: next[1]}
                copyBoard[row][column] = 0
                connectScore = oldScore
                if (next[1] > value){
                    value = next[1]
                    maxColumn = column
                    alpha = value
                }
                if (usePruning() && alpha >= beta)
                    break
            }
            if (d == 0 && difficulty <= 1){

                const depthWinTable = { // chance of not recognising winning move
                    1: [0.15, 0],
                    3: [0.25, 0.05],
                }
            
                const depthLossTable = {
                    2: [0.1, 0], 
                    4: [0.30, 0.10]
                }
                
                allScores.sort((a, b) =>{
                    return (a != null && (b == null || a.score > b.score)) ? -1 : 1
                })
                
                const lossesPerDepth = new Map()
                allScores.forEach(score =>{
                    if (score == null || score.score > -10_000_000) return
                    const depth = score.score - Number.MIN_SAFE_INTEGER
                    if (!lossesPerDepth.has(depth))
                        lossesPerDepth.set(depth, 0)
                    lossesPerDepth.set(depth, lossesPerDepth.get(depth) + 1)
                })

                let options = []
                const maxOptions = difficulty == 0 ? 5 : 3
                
                for (let i = 0; i < 7; i++){
                    const option = allScores[i]
                    if (option == null || options.length >= maxOptions) continue
                    const isWin = option.score > 10_000_000
                    const isLoss = option.score < -10_000_000
                    if (isWin){
                        const depth = Number.MAX_SAFE_INTEGER - option.score
                        if (Math.random() < (1 - depthWinTable[depth][difficulty])){
                            options = [option]
                            break;
                        }
                    } else if (isLoss){
                        const depth = option.score - Number.MIN_SAFE_INTEGER
                        const numEqualLosses = lossesPerDepth.get(depth)
                        let prob = depthLossTable[depth][difficulty]
                        if (depth == 2 && lossesPerDepth.has(4))
                            prob = prob / depthLossTable[4][difficulty]
                        prob = 1 - prob
                        const x = Math.pow(prob, (1 / numEqualLosses))
                        if (Math.random() < x)
                            continue
                        options = [option]
                        break
                    }
                    options.push(option)
                }

                if (options.length == 0)
                    options.push(allScores[0])

                const chosen = options[(Math.floor(Math.random() * options.length))]
                return [chosen.column, chosen.score]
            }
                
            return [maxColumn, value]
        } else{
            let value = Number.MAX_SAFE_INTEGER
            let minColumn = null
            const availableColumns = getAvailableColumns()
            for (let i = 0; i < 7; i++){
                if (copyBoard[5][i] != 0) continue
                const [row, column] = [lowestFreeSlot(i, copyBoard), i]
                minColumn = minColumn == null ? column : minColumn
                copyBoard[row][column] = sym2
                const oldScore = connectScore.clone()
                updateDirections(row, column)
                const next = minimax(true, d + 1, recursionPoints * availableColumns, alpha, beta)
                copyBoard[row][column] = 0
                connectScore = oldScore
                if (next[1] < value){
                    value = next[1]
                    minColumn = column
                    beta = value
                }
                if (usePruning() && alpha >= beta)
                    break
            }
            return [minColumn, value]
        }
    }

    const onmessage = function(message){
        if (message.data.newGame){
            connectScore = new ConnectScore()
        }
        init()
        copyBoard = message.data.copyBoard
        difficulty = message.data.difficulty
        updateDirections(message.data.row, message.data.column)
        const [chosen, score] = minimax(true, 0, getAvailableColumns(), Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
        const row = lowestFreeSlot(chosen, copyBoard)
        copyBoard[row][chosen] = 2
        updateDirections(row, chosen)
        postMessage({chosen, startTime: message.data.startTime, totalExpectedDelay: message.data.totalExpectedDelay, placementDelay: message.data.placementDelay, lastKnownId: message.data.lastKnownId})
    }
    return {onmessage}
})()

onmessage = ConnectWorker.onmessage

//323233332022241005455

//2233024055

//32333222353200505006051111651215666644

//2 3 2 2 5 2 0 0 0 6 5 1 1 5 2 5 6 6 4

/*
{"aiScore":{"centerColumn":4,"connect2":0,"connect3":2,"connect4":0,"bonusPoints":0},
"humanScore":{"centerColumn":2,"connect2":0,"connect3":1,"connect4":2,"bonusPoints":0}}


[1,2,1,2,1,1,2],
[1,2,1,2,2,1,0],
[2,1,2,2,1,1,0],
[0,2,2,1,0,0,0],
[0,2,1,2,0,0,0],
[0,1,2,1,0,0,0]


[1,2,1,2,1,1,2], (1, 4), (2, 3), (3, 2), (4, 1)
[1,2,1,2,2,1,0],
[2,1,2,2,1,1,0],
[0,2,2,1,0,0,0],
[0,2,1,2,0,0,0],
[0,1,2,1,0,0,0]
*/