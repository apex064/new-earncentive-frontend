import { Piece } from '../types/piece'
import { PieceData } from '../types/piece-data'
import { GameStatus } from '../types/game-status'
import { Moves } from '../types/moves'
import { getLegalMovesFromFen } from './fenUtils'
import type { Square } from 'chess.js'

const stats = {
    rook: {
        positionY: -0.42,
        scale: 0.25,
    },
    knight: {
        positionY: -0.3,
        scale: 0.28,
    },
    bishop: {
        positionY: -0.4,
        scale: 0.35,
    },
    queen: {
        positionY: -0.25,
        scale: 0.4,
    },
    king: {
        positionY: 0.2,
        scale: 0.8,
    },
    pawn: {
        positionY: -0.7,
        scale: 0.2,
    },
}

function getPieceStats(piece: Piece) {
    return stats[piece]
}

function getMoves(piece: PieceData, game: GameStatus): Moves {
    const from = `${piece.file.toLowerCase()}${piece.rank}` as Square
    const { available, captures } = getLegalMovesFromFen(
        game.fen,
        piece.rival,
        from
    )
    return { available, captures }
}

export const pieceUtils = {
    getPieceStats,
    getMoves,
}
