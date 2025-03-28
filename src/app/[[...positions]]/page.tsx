import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"

const boards: Tree = require("@/data/boards.json")

// Okay maybe it's not a good idea generating 250,000+ pages
// export const generateStaticParams = () => traverse(boards)
//     .map(path => ({ params: { positions: path } }))

export default async ({ params }: { params: Promise<{ positions: string[] }> }) => {
    const { positions } = await params
    if (!positions) return redirect("/0")

    const position = parseInt(positions[positions.length - 1])

    const turn = positions.length % 2 ? "X" : "O"
    const player = turn === "X" ? 0b01 : 0b10

    let status = null
    let current = boards
    for (const position of positions) {
        const next = current[parseInt(position)]
        if (!isTree(next)) {
            status = next
            break
        }
        current = next
    }

    const cells = []
    for (let i = 0; i < 9; i++)
        cells.push(["", "X", "O"][(position >> (i * 2)) & 0b11])

    const probabilities = cells.map((_, i) => {
        if ((position & (0b11 << i * 2)) >> i * 2) return

        const reference = (position | (player << i * 2)).toString()

        let current = boards
        for (const position of [...positions, reference]) {
            const next = current[parseInt(position)]
            if (!isTree(next)) break
            current = next
        }

        let wins = 0
        const paths = traverse(current)

        for (const path of paths) {
            let edge: any = current
            for (const position of path)
                edge = edge[parseInt(position)]
            if (edge === turn) wins++
        }

        return wins / paths.length
    })

    const optimal = probabilities
        .filter(Boolean)
        .sort((a, b) => a! - b!)
        .reverse()[0]

    const best: number[] = []
    for (const n1 in current) {
        const next = current[n1] as Tree
        if (!isTree(next)) break
        for (const n2 in next) {
            const next = current[n1]![n2]
            if ((next === "X" || next === "O") && turn !== next)
                best.push(+n1)
        }
    }

    return (
        <div className="flex w-screen h-screen justify-evenly">
            <div className="h-96 w-96 my-auto rounded-2xl grid grid-cols-3 grid-rows-3 gap-4 p-4 bg-secondary outline-4 outline-tertiary">
                {cells.map((value, i) => {
                    const reference = position | (player << i * 2)
                    const probability = probabilities[i]!
                    const isBest = best.length && !best.includes(reference) && !value

                    return (
                        <Link
                            key={i}
                            href={(value || status) ? "" : `/${[...positions, reference].join("/")}`}
                        >
                            <div className={`flex w-full h-full m-auto rounded-xl bg-primary ${isBest && "bg-tertiary"} ${probability === optimal && optimal > 0 && "outline-4 outline-tertiary"}`}>
                                <div className="m-auto text-[50px] font-mono font-bold text-tertiary">
                                    {value
                                        ? value
                                        : (
                                            <div className="flex flex-col">
                                                <p className={`m-auto text-sm text-secondary ${isBest && "text-white"}`}>
                                                    {reference}
                                                </p>
                                                {probability ? (
                                                    <p className={`m-auto text-xs opacity-80 ${isBest && "text-secondary"}`}>
                                                        {probability.toFixed(3)}
                                                    </p>
                                                ) : (
                                                    <p className={`m-auto text-xs opacity-80 ${isBest && "text-secondary"}`}>
                                                        0
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
            <div className="relative h-96 w-[1000px] my-auto rounded-2xl grid grid-cols-3 grid-rows-3 gap-4 p-4 bg-secondary outline-4 outline-tertiary">
                <Image
                    src={`http://localhost:5000/${positions.join("/")}`}
                    alt="Board"
                    className="p-2 rounded-2xl"
                    fill
                />
            </div>
        </div>
    )
}

function Node({ current, turn }: { current: Tree, turn: "X" | "O" }) {
    return (
        <div className="flex space-x-2 space-y-2">
            {Object.entries(current).map(([key, value]) => (
                <div
                    key={key}
                    className={`w-3 h-3 ${value === turn ? "bg-tertiary" : "bg-white"}`}
                >
                    &nbsp;
                    {isTree(value) && <Node current={value} turn={turn} />}
                </div>
            ))}
        </div>
    )
}

function traverse(tree: Tree, path: string[] = []) {
    let paths: string[][] = []

    for (const node in tree) {
        const p = [...path, node]

        if (isTree(tree[node]))
            paths = [...paths, ...traverse(tree[node], p)]
        else
            paths.push(p)
    }

    return paths
}

function isTree(tree: unknown): tree is Tree {
    return typeof tree === "object" && tree !== null
}

export type Tree = { [board: number]: Tree | "X" | "O" | null }