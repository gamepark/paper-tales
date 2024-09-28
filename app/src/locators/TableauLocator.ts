export enum Position {
    TopLeft, TopCenter, TopRight, BottomLeft, BottomRight
}

export const playerPositions = [
    [Position.BottomLeft, Position.BottomRight], // 2 players
    [Position.BottomLeft, Position.TopCenter, Position.BottomRight], // 3 players
    [Position.BottomLeft, Position.TopLeft, Position.TopRight, Position.BottomRight], // 4 players
    [Position.BottomLeft, Position.TopLeft, Position.TopCenter, Position.TopRight, Position.BottomRight] // 4 players
]

