const boards: StateMap = require("@/data/boards.json")

export default () => {
    return (
        <>
        </>
    )
}

type State = StateMap | "X" | "O" | null

type StateMap = { [board: number]: State }