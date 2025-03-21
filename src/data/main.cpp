#include <fstream>
#include <unordered_set>

#define X 0b01
#define O 0b10

using namespace std;

ofstream out("boards.json");
unordered_set<uint32_t> boards;

std::string binary(uint32_t n) {
    std::string binary = "";
    for (int i = 0; i < 32; i++) {
        binary += (n & 1) + '0';
        n >>= 1;
    }
    return binary;
}

std::string format(uint32_t board) {
    std::string output = "";
    for (int i = 0; i < 9; i++) {
        uint8_t player = (board >> i * 2) & 0b11;
        output += player == X ? "X" : player == O ? "O" : "·";
        if (i % 3 == 2) output += "\n";
    }
    return output;
}

const uint16_t patterns[] = {
    0b111000000, 0b000111000, 0b000000111,
    0b100100100, 0b010010010, 0b001001001,
    0b100010001, 0b001010100
};

inline void indent(int depth) {
    for (int i = 0; i < depth + 1; i++)
        out << '\t';
}

inline uint32_t place(
    uint32_t board,
    uint32_t position,
    uint8_t player
) {
    return board | (player << position * 2);
}

inline bool full(uint32_t board) {
    for (int i = 0; i < 9; i++)
        if (((board >> (i * 2)) & 0b11) == 0)
            return false;
    return true;
}

inline uint8_t check(uint32_t board) {
    for (int p = X; p <= O; p++) {
        uint16_t individual = 0;

        for (int i = 0; i < 9; i++)
            if (((board >> (i * 2)) & 0b11) == p)
                individual |= 1 << i;

        for (uint16_t pattern : patterns)
            if ((individual & pattern) == pattern)
                return p;
    }

    return full(board) ? 0xFF : 0;
}

void solve(
    int depth,
    uint32_t board,
    unordered_set<uint8_t> available,
    uint8_t player
) {
    indent(depth);
    out << '"' << board << "\": {";

    if (available.empty()) {
        out << "}";
        return;
    }

    bool first = true;
    bool moveable = false;

    for (uint8_t position : available) {
        uint32_t b = place(board, position, player);
        boards.insert(b);

        uint8_t winner = check(b);

        if (!first) out << ',';
        first = false;

        out << '\n';

        if (winner == X || winner == O) {
            moveable = true;
            indent(depth + 1);
            out << '"' << b << "\": \"" << (winner == X ? 'X' : 'O') << '"';
        } else if (winner == 0xFF || available.size() == 1) {
            moveable = true;
            indent(depth + 1);
            out << '"' << b << "\": null";
        } else {
            moveable = true;
            unordered_set<uint8_t> temp(available);
            temp.erase(position);
            solve(depth + 1, b, temp, player == X ? O : X);
        }
    }

    if (!moveable) {
        indent(depth + 1);
        out << '"' << board << "\": null\n";
    }

    out << '\n';
    indent(depth);
    out << "}";
}

int main() {
    uint32_t board = 0;
    unordered_set<uint8_t> available;

    for (uint8_t i = 0; i < 9; i++)
        available.insert(i);

    out << "{\n";

    solve(0, board, available, X);

    out << "\n}";
    out.close();

    return 0;
}