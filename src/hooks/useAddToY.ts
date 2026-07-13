import { useFrame } from '@react-three/fiber'
import { useMemo, useState } from 'react'

const _options = {
    duration: 500,
}

function getInRange(x: number, min: number, max: number) {
    return Math.min(Math.max(x, min), max)
}

export function useAddToY(isSelected: boolean) {
    const [add, setAdd] = useState(0)
    const target = useMemo(() => {
        return isSelected ? 1 : 0
    }, [isSelected])

    useFrame((_, delta) => {
        setAdd((add) => {
            if (Math.abs(target - add) < 0.01) return target
            const diff = target === 0 ? -1 : 1
            const speed = (delta / _options.duration) * 1000
            return getInRange(add + diff * speed, 0, 1)
        })
    })

    return add
}
