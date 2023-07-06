class CheckMove{
    piece;
    row;
    column;
    constructor(piece, row, column){
        this.piece = piece
        this.row = row
        this.column = column
    }
}

const piecePoints = 10
const kingPoints = 19
const forwardMovePoints = 1

class CheckHeuristic{
    pieces = 0;
    kings = 0;
    forwardMoves = 0;
    
    getScore(){
        return (this.pieces * piecePoints) + (this.kings * kingPoints) + (this.forwardMoves * forwardMovePoints)
    }
}

const CheckWorker = (function(){
    let copyBoard = null
    let multiMovePieceId = null
    let aiPieces = null
    let humanPieces = null
    let aiHeuristic = new CheckHeuristic()
    let humanHeuristic = new CheckHeuristic()
    let calls = 0
    let maxReachedDepth = 0
    const maxRecursionPoints = 5_000_000
    let pruneTable = []
    let difficulty = 0

    const init = () =>{
        copyBoard = null
        multiMovePieceId = null
        aiPieces = new Map()
        humanPieces = new Map()
        aiHeuristic = new CheckHeuristic()
        humanHeuristic = new CheckHeuristic()
        calls = 0
        maxReachedDepth = 0
        pruneTable = []
    }

    function useDynamicRecursion(){
        return difficulty == 2
    }

    function usePruning(){
        return difficulty == 2
    }

    function getRecursionDepth(){
        if (difficulty == 0){
            return 3
        }
        if (difficulty == 1){
            return 3
        }
        if (difficulty == 2)
            return 7
    }

    const isDark = (row, column) =>{
        return ((row % 2 == 0) != (column % 2 == 0)) && row >= 0 && row <= 7 && column >= 0 && column <= 7
    }

    const getAllPossibleMoves = (player) => {
        const moves = []
        const map = player == 2 ? aiPieces : humanPieces
        const iterater = map.values()
        let piece = iterater.next().value
        while (piece != null && piece.active){
            addMovesOfPiece(piece, moves)
            piece = iterater.next().value
        }
        return moves
    }

    const addMovesOfPiece = (piece, currentMoves) =>{
        const singleMoves = getSingleMoves(piece)
        const doubleMoves = getDoubleMoves(piece)
        currentMoves.push(...singleMoves)
        currentMoves.push(...doubleMoves)
    }

    const getSingleMoves = (piece) =>{
        const moves = []
        for(let horizontal = -1; horizontal <= 1; horizontal += 2){
            for (let y = -1; y <= 1; y += (piece.king ? 2 : 3)){
                const vertical = piece.player == 1 ? -y : y
                if (isAvailableSingle(piece, horizontal, vertical))
                    moves.push(new CheckMove(piece, piece.row + vertical, piece.column + horizontal))
            }
        }
        return moves
    }

    const getDoubleMoves = (piece) =>{
        const moves = []
        for (let horizontal = -2; horizontal <= 2; horizontal += 4){
            for (let y = -2; y <= 2; y += (piece.king ? 4 : 5)){
                const vertical = piece.player == 1 ? -y : y
                if (isAvailableDouble(piece, horizontal, vertical))
                    moves.push(new CheckMove(piece, piece.row + vertical, piece.column + horizontal))
            }
        }
        return moves
    }

    const isAvailableSingle = (piece, horizontal, vertical) =>{
        const c1 = piece.column + horizontal
        const r1 = piece.row + vertical
        return ((isDark(r1, c1) && copyBoard[r1][c1] == 0))
    }

    const isAvailableDouble = (piece, horizontal, vertical) =>{
        const c1 = piece.column + horizontal
        const r1 = piece.row + vertical
        const cm = piece.column + (horizontal / 2)
        const rm = piece.row + (vertical / 2)
        return isDark(r1, c1) && copyBoard[r1][c1] == 0 && copyBoard[rm][cm] != 0 && copyBoard[rm][cm].player != piece.player
    }

    const createMaps = () => {
        for (let row = 0; row < 8; row++){
            for (let column = 0; column < 8; column++){
                const piece = copyBoard[row][column]
                if (piece !== 0){
                    const map = piece.player == 1 ? humanPieces : aiPieces
                    const heuristic = piece.player == 1 ? humanHeuristic : aiHeuristic
                    map.set(piece.id, piece)
                    piece.active = true
                    if (piece.king){
                        heuristic.kings++
                    } else{
                        heuristic.pieces++
                    }

                    if (piece.player == 2){
                        heuristic.forwardMoves += piece.king ? piece.startingRow : Math.abs(piece.row - piece.startingRow)
                    }
                }
            }
        }
    }

    const minimax = function(maximizingPlayer, multiPiece, d, recursionPoints, alpha=Number.MIN_SAFE_INTEGER, beta=Number.MAX_SAFE_INTEGER){
        maxReachedDepth = Math.max(d, maxReachedDepth)
        const allMoves = multiPiece == null ? getAllPossibleMoves(maximizingPlayer ? 2 : 1) : getDoubleMoves(multiPiece)
        if (d == 0 && allMoves.length == 1)
            return allMoves[0]
        if (allMoves.length == 0){
            return maximizingPlayer ? Number.MIN_SAFE_INTEGER + d : Number.MAX_SAFE_INTEGER - d
        }
        if (d > 30 || (recursionPoints > maxRecursionPoints && useDynamicRecursion()) || (!useDynamicRecursion() && d == getRecursionDepth())){
            return aiHeuristic.getScore() - humanHeuristic.getScore()
        }
            
        if (maximizingPlayer){
            let value = Number.MIN_SAFE_INTEGER
            let maxMove = allMoves[0]
            const moveArray = []
            for (let i = 0; i < allMoves.length; i++){
                const move = allMoves[i]
                const isDouble = Math.abs(move.row - move.piece.row) == 2
                const undoArray = applyMove(move.piece, move.row, move.column)
                const mp = (isDouble && canContinueMove(move.piece)) ? move.piece : null
                const next = minimax(mp != null, mp, d + 1, recursionPoints * allMoves.length, alpha, beta)
                if (d == 0)
                    moveArray.push({move, score: next})
                undoMove(undoArray)
                if (next > value){
                    value = next
                    maxMove = move
                    alpha = value
                }
                if (usePruning() && alpha >= beta)
                    break
            }
            if (d == 0){
                moveArray.sort((a, b) =>{
                    return b.score - a.score
                })
                if (difficulty == 0){
                    const chosenIndex = Math.floor(Math.random() * allMoves.length * 0.5)
                    return moveArray[chosenIndex].move
                }
                if (difficulty == 1){
                    let numLosingMoves = null
                    for (let i = 0; i < moveArray.length; i++){
                        const move = moveArray[i]
                        if (move.score > 10_000_000){
                            const depth = Number.MAX_SAFE_INTEGER - move.score
                            if (Math.random() < 0.8)
                                return move.move
                        }
                        if (move.score < -10_000_000){
                            numLosingMoves = numLosingMoves = null ? moveArray.length - i : numLosingMoves
                            const prob = Math.pow(0.8, 1 / numLosingMoves)
                            if (Math.random() > prob){
                                return move.move
                            }
                        }
                        
                        const chosenIndex = Math.floor(Math.random() * allMoves.length / 3)
                        return moveArray[chosenIndex].move
                    }
                }
                
            }
            return d == 0 ? maxMove : value
        } else{
            
            let value = Number.MAX_SAFE_INTEGER
            let minMove = allMoves[0]
            for (let i = 0; i < allMoves.length; i++){
                const move = allMoves[i]
                const isDouble = Math.abs(move.row - move.piece.row) == 2
                const undoArray = applyMove(move.piece, move.row, move.column)
                const mp = (isDouble && canContinueMove(move.piece)) ? move.piece : null
                const next = minimax(mp == null, mp, d + 1, recursionPoints * allMoves.length, alpha, beta)
                undoMove(undoArray)
                if (next < value){
                    value = next
                    minMove = move
                    beta = value
                }
                if (usePruning() && alpha >= beta)
                    break
            }
            return d == 0 ? minMove : value
        }
    }

    const getHeuristic = function(player){
        return player == 1 ? humanHeuristic : aiHeuristic
    }

    const applyMove = function(piece, row, column)
    {
        const pieceHeuristic = getHeuristic(piece.player)
        const undoArray = []
        const becameKing = !piece.king && ((row == 7 && piece.player == 1) || (row == 0 && piece.player == 2))
        undoArray.push({
            piece,
            oldRow: piece.row,
            oldColumn: piece.column,
            becameKing
        })
        if (becameKing){
            pieceHeuristic.kings++
            pieceHeuristic.pieces--
            piece.king = true
        }

        copyBoard[piece.row][piece.column] = 0
        if (Math.abs(piece.row - row) == 2){
            const cm = (piece.column + column) / 2
            const rm = (piece.row + row) / 2
            const removePiece = copyBoard[rm][cm]
            removePiece.active = false
            undoArray.push({
                piece: removePiece,
                oldRow: removePiece.row,
                oldColumn: removePiece.column
            })
            copyBoard[rm][cm] = 0
            const map = removePiece.player == 1 ? humanPieces : aiPieces
            const heuristic = removePiece.player == 1 ? humanHeuristic : aiHeuristic
            map.delete(removePiece.id)
            if (removePiece.king)
                heuristic.kings--
            else
                heuristic.pieces--
        }
        if (piece.player == 2 && (!piece.king || becameKing)){
            pieceHeuristic.forwardMoves += (Math.abs(piece.row - row) == 2 ? 2 : 1)
        }
        piece.row = row
        piece.column = column
        copyBoard[row][column] = piece
        return undoArray
    }

    const undoMove = function(undoArray){
        for (let i = 0; i < undoArray.length; i++){
            const undo = undoArray[i]
            const piece = undo.piece
            const heuristic = getHeuristic(piece.player)
            piece.active = true
            copyBoard[piece.row][piece.column] = 0
            const wasRemoved = piece.row == undo.oldRow && piece.column == undo.oldColumn
            if (piece.player == 2 && !wasRemoved && (!undo.piece.king || undo.becameKing)){
                heuristic.forwardMoves -= ((Math.abs(piece.row - undo.oldRow) == 2) ? 2 : 1)
            }
            piece.row = undo.oldRow
            piece.column = undo.oldColumn
            if (undo.becameKing){
                piece.king = false
                heuristic.kings--
                heuristic.pieces++
            }
            copyBoard[piece.row][piece.column] = piece
            const map = piece.player == 1 ? humanPieces : aiPieces
            map.set(piece.id, piece)
            if (wasRemoved){
                if (piece.king) heuristic.kings++
                else heuristic.pieces++
            }
        }
    }

    const canRemoveOpposition = function(piece, horizontal, vertical){
        const c1 = piece.column + horizontal
        const r1 = piece.row + vertical
        const c2 = c1 + horizontal
        const r2 = r1 + vertical

        return isDark(r2, c2) && copyBoard[r2][c2] == 0 && copyBoard[r1][c1] != 0 && copyBoard[r1][c1].player != piece.player
    }

    const canContinueMove = function(piece){
        const vertical = piece.player == 1 ? 1 : -1
        return canRemoveOpposition(piece, -1, vertical) || canRemoveOpposition(piece, 1, vertical) ||
            (piece.king && (canRemoveOpposition(piece, -1, -vertical) || canRemoveOpposition(piece, 1, -vertical)))
    }

    const onmessage = function(message){
        init()
        copyBoard = message.data.board
        multiMovePieceId = message.data.multiMovePieceId
        difficulty = message.data.difficulty
        createMaps()
        const multiPiece = multiMovePieceId == null ? null : aiPieces.get(multiMovePieceId)
        const chosen = minimax(true, multiPiece, 0, 1)
        postMessage({chosen: {pieceId: chosen.piece.id, row: chosen.row, column: chosen.column}, startTime: message.data.startTime, lastKnownId: message.data.lastKnownId})
    }
    return {onmessage}
})()

onmessage = CheckWorker.onmessage
