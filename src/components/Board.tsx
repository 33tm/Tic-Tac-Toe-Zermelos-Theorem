export function Board({ board }: { board: number }) {
    const cells = []

    for (let i = 0; i < 9; i++)
        cells.push(["", "X", "O"][(board >> (i * 2)) & 0b11])

    return (
        <div className="w-32 h-32 grid grid-cols-3 grid-rows-3 gap-2 p-2 bg-primary rounded-lg">
            {cells.map((cell, i) => (
                <div
                    key={i}
                    className="flex w-full h-full m-auto rounded-md bg-secondary"
                >
                    <p className="m-auto font-mono font-bold text-tertiary">
                        {cell}
                    </p>
                </div>
            ))}
        </div>
    )
}