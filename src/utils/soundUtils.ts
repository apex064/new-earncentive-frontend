// Sound utilities for chess game using Web Audio API
let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContext
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    try {
        const ctx = getAudioContext()
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
        oscillator.type = type

        gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + duration)
    } catch (err) {
        console.warn('Could not play sound:', err)
    }
}

export function playSound(soundType: keyof typeof sounds) {
    switch (soundType) {
        case 'move':
            playTone(440, 0.2, 'sine') // A4 note
            break
        case 'capture':
            playTone(220, 0.3, 'sawtooth') // A3 note, longer
            playTone(330, 0.2, 'sawtooth') // E4 note
            break
        case 'check':
            playTone(660, 0.1, 'square') // E5 note
            setTimeout(() => playTone(660, 0.1, 'square'), 150)
            break
        case 'checkmate':
            playTone(440, 0.2, 'triangle')
            setTimeout(() => playTone(554, 0.2, 'triangle'), 200)
            setTimeout(() => playTone(659, 0.4, 'triangle'), 400)
            break
        case 'draw':
            playTone(330, 0.3, 'sine')
            setTimeout(() => playTone(262, 0.3, 'sine'), 300)
            break
    }
}

export function playMoveSound(isCapture: boolean = false) {
    playSound(isCapture ? 'capture' : 'move')
}

export function playGameEndSound(situation: string) {
    switch (situation) {
        case 'checkmate':
            playSound('checkmate')
            break
        case 'check':
            playSound('check')
            break
        case 'draw':
        case 'stalemate':
            playSound('draw')
            break
    }
}