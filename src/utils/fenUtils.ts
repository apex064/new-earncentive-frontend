import { Chess } from 'chess.js'
import type { Square } from 'chess.js'
import { GameStatus } from '../types/game-status'
import { PieceStatus } from '../types/piece-status'
import { Rival } from '../types/rival'
import type { ChessFile } from '../types/chess-file'
import type { ChessRank } from '../types/chess-rank'
import type { GameSituation } from '../types/game-situation'

export const STANDARD_START_FEN =
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

const pieceMap: Record<string, PieceStatus['type']> = {
    p: 'pawn',
    r: 'rook',
    n: 'knight',
    b: 'bishop',
    q: 'queen',
    k: 'king',
}

function pieceId(piece: PieceStatus, rival: Rival): string {
    return `${rival}-${piece.type}-${piece.file}${piece.rank}`
}

function deriveSituation(chess: Chess): GameSituation {
    console.log('🔍 deriveSituation called, checking game state...')
    
    try {
        const isCheckmate = chess.isCheckmate?.() ?? chess.in_checkmate?.() ?? false
        const isStalemate = chess.isStalemate?.() ?? chess.in_stalemate?.() ?? false
        const isThreefoldRepetition = chess.isThreefoldRepetition?.() ?? chess.in_threefold_repetition?.() ?? false
        const isInsufficientMaterial = chess.isInsufficientMaterial?.() ?? chess.insufficient_material?.() ?? false
        const isDraw = chess.isDraw?.() ?? chess.in_draw?.() ?? false
        const isCheck = chess.isCheck?.() ?? chess.in_check?.() ?? false
        
        if (isCheckmate) {
            console.log('🏁 Game is in CHECKMATE')
            return 'checkmate'
        }
        if (isStalemate) {
            console.log('♟️ Game is in STALEMATE')
            return 'stalemate'
        }
        if (isThreefoldRepetition) {
            console.log('🔄 Game ended by threefold repetition')
            return 'draw'
        }
        if (isInsufficientMaterial) {
            console.log('🎲 Game ended by insufficient material')
            return 'draw'
        }
        if (isDraw) {
            console.log('🤝 Game ended in draw')
            return 'draw'
        }
        if (isCheck) {
            console.log('⚠️ King is in CHECK')
            return 'check'
        }
    } catch (error) {
        console.error('Error in deriveSituation:', error)
    }
    
    console.log('✅ Game is ACTIVE')
    return 'active'
}

/**
 * Ensures FEN strings always contain all 6 required segments 
 * to pass strict validation in modern chess.js versions.
 */
function cleanFenString(fen: string): string {
    if (!fen) return STANDARD_START_FEN
    
    let cleanFen = fen.trim()
    if (cleanFen === 'start') return STANDARD_START_FEN
    
    const parts = cleanFen.split(/\s+/)
    
    // Validate structural rows integrity
    const rows = parts[0].split('/')
    if (rows.length !== 8) {
        console.warn('Invalid board row layout, reverting to start position.')
        return STANDARD_START_FEN
    }

    // Progressively fill in missing tokens to satisfy 6-part validation
    const position = parts[0]
    const turn = (parts[1] === 'w' || parts[1] === 'b') ? parts[1] : 'w'
    const castling = parts[2] || '-'
    const enPassant = parts[3] || '-'
    const halfmove = parts[4] || '0'
    const fullmove = parts[5] || '1'
    
    return `${position} ${turn} ${castling} ${enPassant} ${halfmove} ${fullmove}`
}

export function getGameStatusFromFen(fen: string): GameStatus {
    console.log('📊 getGameStatusFromFen called with FEN:', fen?.substring(0, 50))
    
    if (!fen) {
        console.error('❌ No FEN provided to getGameStatusFromFen')
        return createDefaultStatus()
    }
    
    const cleanFen = cleanFenString(fen)
    console.log('🧹 Cleaned FEN:', cleanFen)
    
    let chess: Chess
    try {
        // FIX: Instantiate via constructor to avoid core .load validation quirks
        chess = new Chess(cleanFen)
    } catch (error) {
        console.error('❌ Exception initializing Chess context with FEN:', error)
        try {
            chess = new Chess(STANDARD_START_FEN)
            console.log('✅ Loaded starting position as fallback')
        } catch (fallbackError) {
            console.error('❌ Fallback instantiation collapsed!')
            return createDefaultStatus()
        }
    }

    const board = chess.board()
    const whitePieces: PieceStatus[] = []
    const blackPieces: PieceStatus[] = []

    for (let rank = 8; rank >= 1; rank -= 1) {
        const row = board[8 - rank]
        for (let fileIndex = 0; fileIndex < 8; fileIndex += 1) {
            const square = row[fileIndex]
            if (!square) continue

            const file = String.fromCharCode(65 + fileIndex) as ChessFile
            const rankNumber = rank as ChessRank
            const type = pieceMap[square.type]
            const rival: Rival = square.color === 'w' ? 'white' : 'black'
            const piece: PieceStatus = {
                id: pieceId({ type, rank: rankNumber, file, isMoved: false }, rival),
                type,
                rank: rankNumber,
                file,
                isMoved: true,
            }

            if (rival === 'white') {
                whitePieces.push(piece)
            } else {
                blackPieces.push(piece)
            }
        }
    }

    const initialCounts = {
        white: { king: 1, queen: 1, rook: 2, bishop: 2, knight: 2, pawn: 8 },
        black: { king: 1, queen: 1, rook: 2, bishop: 2, knight: 2, pawn: 8 }
    }

    const currentCounts = {
        white: { king: 0, queen: 0, rook: 0, bishop: 0, knight: 0, pawn: 0 },
        black: { king: 0, queen: 0, rook: 0, bishop: 0, knight: 0, pawn: 0 }
    }

    whitePieces.forEach(piece => currentCounts.white[piece.type]++)
    blackPieces.forEach(piece => currentCounts.black[piece.type]++)

    const capturedByWhite: PieceStatus[] = []
    const capturedByBlack: PieceStatus[] = []

    Object.keys(initialCounts.white).forEach(pieceType => {
        const captured = initialCounts.white[pieceType as keyof typeof initialCounts.white] - currentCounts.white[pieceType as keyof typeof currentCounts.white]
        for (let i = 0; i < captured; i++) {
            capturedByBlack.push({
                id: `captured-black-${pieceType}-${i}`,
                type: pieceType as PieceStatus['type'],
                rank: 1,
                file: 'A',
                isMoved: true,
            })
        }
    })

    Object.keys(initialCounts.black).forEach(pieceType => {
        const captured = initialCounts.black[pieceType as keyof typeof initialCounts.black] - currentCounts.black[pieceType as keyof typeof currentCounts.black]
        for (let i = 0; i < captured; i++) {
            capturedByWhite.push({
                id: `captured-white-${pieceType}-${i}`,
                type: pieceType as PieceStatus['type'],
                rank: 1,
                file: 'A',
                isMoved: true,
            })
        }
    })

    const outFen = chess.fen()
    const situation = deriveSituation(chess)
    
    const gameStatus: GameStatus = {
        turn: chess.turn() === 'w' ? 'white' : 'black',
        white: { pieces: whitePieces },
        black: { pieces: blackPieces },
        situation: situation,
        fen: outFen,
        capturedByWhite,
        capturedByBlack,
    }
    
    console.log('📊 Game status generated:', {
        situation: gameStatus.situation,
        turn: gameStatus.turn,
        whitePieces: whitePieces.length,
        blackPieces: blackPieces.length,
        fen: outFen.substring(0, 50)
    })
    
    return gameStatus
}

function squareToPosition(square: Square): { file: ChessFile; rank: ChessRank } {
    const file = square[0].toUpperCase() as ChessFile
    const rank = Number(square[1]) as ChessRank
    return { file, rank }
}

export function getLegalMovesFromFen(fen: string, rival: Rival, square: Square) {
    console.log(`🔍 Getting legal moves for ${rival} at ${square}`)
    const cleanFen = cleanFenString(fen)
    
    let ch: Chess
    try {
        ch = new Chess(cleanFen)
    } catch (error) {
        console.error('❌ Failed to create chess instance from FEN:', error)
        return { available: [], captures: [] }
    }
    
    const piece = ch.get(square)
    if (!piece) {
        console.log('❌ No piece found at square:', square)
        return { available: [], captures: [] }
    }
    
    const side = ch.turn() === 'w' ? 'white' : 'black'
    if (side !== rival || piece.color !== (rival === 'white' ? 'w' : 'b')) {
        console.log('❌ Not your turn or wrong piece color')
        return { available: [], captures: [] }
    }

    const moves = ch.moves({ square, verbose: true })
    const available: { file: ChessFile; rank: ChessRank }[] = []
    const captures: { file: ChessFile; rank: ChessRank }[] = []
    const seen = new Set<string>()

    for (const m of moves) {
        const pos = squareToPosition(m.to)
        const key = `${pos.file}${pos.rank}`
        if (seen.has(key)) continue
        seen.add(key)
        if (m.captured) captures.push(pos)
        else available.push(pos)
    }
    
    console.log(`✅ Found ${available.length} available moves and ${captures.length} captures`)
    return { available, captures }
}

export function isValidFen(fen: string): boolean {
    try {
        const cleanFen = cleanFenString(fen)
        // FIX: modern validation is safely checked via constructor instantiation
        new Chess(cleanFen)
        return true
    } catch (error) {
        return false
    }
}

export function getTurnFromFen(fen: string): 'white' | 'black' {
    try {
        const cleanFen = cleanFenString(fen)
        const chess = new Chess(cleanFen)
        return chess.turn() === 'w' ? 'white' : 'black'
    } catch (error) {
        console.error('Error getting turn from FEN:', error)
        return 'white'
    }
}

export function isGameOverFromFen(fen: string): boolean {
    try {
        const cleanFen = cleanFenString(fen)
        const chess = new Chess(cleanFen)
        return chess.isGameOver?.() ?? chess.game_over?.() ?? false
    } catch (error) {
        console.error('Error checking game over from FEN:', error)
        return false
    }
}

export function getGameResultFromFen(fen: string): string | null {
    try {
        const cleanFen = cleanFenString(fen)
        const chess = new Chess(cleanFen)
        
        const isCheckmate = chess.isCheckmate?.() ?? chess.in_checkmate?.() ?? false
        const isStalemate = chess.isStalemate?.() ?? chess.in_stalemate?.() ?? false
        const isThreefoldRepetition = chess.isThreefoldRepetition?.() ?? chess.in_threefold_repetition?.() ?? false
        const isInsufficientMaterial = chess.isInsufficientMaterial?.() ?? chess.insufficient_material?.() ?? false
        
        if (isCheckmate) {
            const winner = chess.turn() === 'w' ? 'black' : 'white'
            return `${winner}_win`
        }
        if (isStalemate) return 'stalemate'
        if (isThreefoldRepetition) return 'draw'
        if (isInsufficientMaterial) return 'draw'
        return null
    } catch (error) {
        console.error('Error getting game result from FEN:', error)
        return null
    }
}

function createDefaultStatus(): GameStatus {
    return {
        turn: 'white',
        black: { pieces: [] },
        white: { pieces: [] },
        situation: 'inactive',
        fen: STANDARD_START_FEN,
        capturedByWhite: [],
        capturedByBlack: [],
    }
}
