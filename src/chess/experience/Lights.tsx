export function Lights() {
    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[4, 4, 4]} intensity={1} />
            <directionalLight position={[-4, 4, -4]} intensity={1} />
        </>
    )
}
