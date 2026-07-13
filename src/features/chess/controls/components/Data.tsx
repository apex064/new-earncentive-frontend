import { GameStatus } from '../types/game-status'

type DataProps = {
    game: GameStatus
    myColor?: 'white' | 'black'
    isVsBot?: boolean
    wsConnected?: boolean
    gameId?: string
}

export function Data({ game, myColor, isVsBot, wsConnected, gameId }: DataProps) {
    return (
        <div className={`data ${game.turn}`}>
            <div className="game-info-card">
                <div className="card-header">
                    <h3>Chess Match</h3>
                    <span className="game-id">#{gameId}</span>
                </div>
                
                <div className="player-info">
                    <div className="your-color">
                        <span className="label">Your pieces</span>
                        <span className={`color-badge ${myColor}`}>
                            {myColor === 'white' ? 'White' : 'Black'}
                        </span>
                    </div>
                    
                    <div className="turn-indicator">
                        <span className="label">Turn</span>
                        <span className={`color-badge ${game.turn}`}>
                            {game.turn === 'white' ? 'White' : 'Black'}
                        </span>
                    </div>
                </div>

                {game.situation === 'check' && (
                    <div className="check-alert">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L1 21H23L12 2Z" stroke="currentColor" fill="currentColor"/>
                            <circle cx="12" cy="16" r="1.5" fill="white"/>
                            <line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2"/>
                        </svg>
                        Check
                    </div>
                )}

                <div className="game-meta">
                    {isVsBot && (
                        <div className="vs-bot">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" fill="none"/>
                                <circle cx="9" cy="11" r="1.5" fill="currentColor"/>
                                <circle cx="15" cy="11" r="1.5" fill="currentColor"/>
                                <path d="M8 15H16" stroke="currentColor" strokeWidth="1.5"/>
                            </svg>
                            VS Bot
                        </div>
                    )}
                    
                    <div className={`connection-status ${wsConnected ? 'connected' : 'connecting'}`}>
                        <span className="status-dot"></span>
                        <span className="status-text">
                            {wsConnected ? 'Connected' : 'Connecting'}
                        </span>
                    </div>
                </div>
            </div>
            
            <span className="turn">{game.turn}</span>
            <div className={`situation ${game.situation}`}>
                {game.situation}
            </div>
        </div>
    )
}
