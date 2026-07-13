import { Rival } from '@/types/rival'
import { RivalStatus } from '@/types/rival-status'
import { Piece } from './Piece'
import { PieceData } from '@/types/piece-data'
import { useCallback } from 'react'

type RivalPiecesProps = {
    rival: Rival
    isHisTurn: boolean
    onPieceClick: (piece: PieceData) => void
    selectedPiece: PieceData | null
} & RivalStatus
export function RivalPieces({
    rival,
    isHisTurn,
    pieces,
    onPieceClick: _onPieceClick,
    selectedPiece,
}: RivalPiecesProps) {
    const onPieceClick = useCallback(
        (piece: PieceData) => {
            if (isHisTurn) {
                _onPieceClick(piece)
            }
        },
        [_onPieceClick, isHisTurn]
    )

    return pieces.map((piece) => {
        return (
            <Piece
                onPieceClick={onPieceClick}
                key={piece.id}
                rival={rival}
                isSelected={
                    piece.id === (selectedPiece?.id ?? '') && isHisTurn === true
                }
                {...piece}
            />
        )
    })
}
