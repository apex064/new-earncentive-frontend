import { GameActions } from '../hooks/useGame'

type StartMenuProps = {
    gameActions: GameActions
}

export function StartMenu({ gameActions }: StartMenuProps) {
    return (
        <div className="start-menu">
            <div className="title">Chess</div>
            <button onClick={() => gameActions.startGame()}>Start</button>
        </div>
    )
}
