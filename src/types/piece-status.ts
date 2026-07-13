import { ChessFile } from './chess-file'
import { ChessRank } from './chess-rank'
import { Piece } from './piece'

export type PieceStatus = {
    type: Piece
    rank: ChessRank
    file: ChessFile
    isMoved: boolean
    id: string
}
