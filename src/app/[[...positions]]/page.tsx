import Link from "next/link"
import { redirect } from "next/navigation"

const boards: Tree = require("@/data/boards.json")

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

    const best: string[] = []
    const optimal = Object
        .entries(current)
        .filter(([key, value]) => {
            if (!isTree(value)) {
                if (value === turn) best.push(key)
                return value === turn
            }
            return evaluate(value, turn)
        })
        .map(([key]) => parseInt(key))

    return (
        <div className="flex w-screen h-screen">
            <div className="h-96 w-96 m-auto rounded-2xl grid grid-cols-3 grid-rows-3 gap-4 p-4 bg-secondary outline-4 outline-tertiary">
                {cells.map((value, i) => {
                    const reference = position | (player << i * 2)
                    return (
                        <Link
                            key={i}
                            href={(value || status) ? "" : `/${[...positions, reference].join("/")}`}
                        >
                            <div className={`flex w-full h-full m-auto rounded-xl ${best.includes(reference.toString()) ? "bg-tertiary" : "bg-primary"} ${optimal.includes(reference) && "outline-4 outline-tertiary"}`}>
                                <div className="m-auto text-[50px] font-mono font-bold text-tertiary">
                                    {value
                                        ? value
                                        : (
                                            <p className="m-auto text-sm text-secondary">
                                                {reference}
                                            </p>
                                        )
                                    }
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
            {/* <div className="h-96 w-96 m-auto rounded-2xl grid grid-cols-3 grid-rows-3 gap-4 p-4 bg-secondary outline-4 outline-tertiary">
                {positions.length > 3 && (
                    <Node current={current} turn={turn} />
                )}
            </div> */}
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

function evaluate(tree: Tree, target: "X" | "O" | null): boolean {
    return Object.values(tree).some(node => {
        if (!isTree(node)) return node === target
        return evaluate(node, target)
    })
}

function isTree(tree: unknown): tree is Tree {
    return typeof tree === "object" && tree !== null
}

export type Tree = { [board: number]: Tree | "X" | "O" | null }