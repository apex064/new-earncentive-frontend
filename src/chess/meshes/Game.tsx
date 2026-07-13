import { RivalPieces } from './RivalPieces'
import { GameStatus } from '@/types/game-status'
import { PieceData } from '@/types/piece-data'
import { useCameraPosition } from '@/hooks/useCameraPositon'

type GameProps = {
    status: GameStatus
    onPieceClick: (piece: PieceData) => void
    selectedPiece: PieceData | null
}

export function Game({ status, onPieceClick, selectedPiece }: GameProps) {
    useCameraPosition(status)
    return (
        <>
            <RivalPieces
                onPieceClick={onPieceClick}
                pieces={status.black.pieces}
                rival="black"
                isHisTurn={status.turn === 'black'}
                selectedPiece={selectedPiece}
            />
            <RivalPieces
                onPieceClick={onPieceClick}
                pieces={status.white.pieces}
                rival="white"
                isHisTurn={status.turn === 'white'}
                selectedPiece={selectedPiece}
            />
        </>
    )
}
