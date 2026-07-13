import { GameStatus } from '../types/game-status'
import { Rival } from '../types/rival'
import { getGameStatusFromFen, STANDARD_START_FEN } from './fenUtils'
import { pieceMovesUtils } from './pieceMovesUtils'

export const gameUtils = {
    newGame,
    checkIsChecked,
    checkCheckedIsCheckmate,
}

function newGame(): GameStatus {
    return getGameStatusFromFen(STANDARD_START_FEN)
}

function checkIsChecked(gameStatus: GameStatus, rival: Rival): boolean {
    const secondRival = rival === 'white' ? 'black' : 'white'
    const king = gameStatus[rival].pieces.find((piece) => piece.type === 'king')
    if (!king) return false
    const kingPosition = {
        file: king.file,
        rank: king.rank,
    }

    return gameStatus[secondRival].pieces.some((piece) => {
        const pieceData = {
            ...piece,
            rival: secondRival as Rival,
        }
        const pieceMoves = pieceMovesUtils.getPieceMovesWithUnValid(
            pieceData,
            gameStatus
        )
        return pieceMoves.captures.some(
            (move) =>
                move.file === kingPosition.file &&
                move.rank === kingPosition.rank
        )
    })
}

function checkCheckedIsCheckmate(
    gameStatus: GameStatus,
    rival: Rival
): boolean {
    if (!checkIsChecked(gameStatus, rival)) return false

    return gameStatus[rival].pieces.every((piece) => {
        const pieceData = {
            ...piece,
            rival: rival as Rival,
        }
        const pieceMoves = pieceMovesUtils.getPieceMoves(pieceData, gameStatus)
        return !pieceMoves.available.length && !pieceMoves.captures.length
    })
}
