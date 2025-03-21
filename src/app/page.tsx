import { Board } from "@/components/Board"

const boards: Tree = require("@/data/boards.json")

export default () => {
    return (
        <>
            <Board board={67993} />
        </>
    )
}

type Tree = { [board: number]: Tree | "X" | "O" | null }