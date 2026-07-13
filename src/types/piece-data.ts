import { PieceStatus } from './piece-status'
import { Rival } from './rival'

export type PieceData = {
    rival: Rival
} & PieceStatus
