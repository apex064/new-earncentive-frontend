import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons'
import { GameActions } from '@/hooks/useGame'

type OptionsProps = {
    gameActions: GameActions
}

export function Options({ gameActions }: OptionsProps) {
    return (
        <div className="options">
            <button onClick={gameActions.reset}>
                <FontAwesomeIcon icon={faArrowsRotate} />
            </button>
        </div>
    )
}
