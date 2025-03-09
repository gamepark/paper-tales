export enum Position {
    TopLeft, BottomCenter, TopRight, BottomLeft, BottomRight
}

export const playerPositions = [
    [Position.BottomLeft, Position.BottomRight], // 2 players
    [Position.BottomLeft, Position.TopRight, Position.BottomRight], // 3 players
    [Position.BottomLeft, Position.TopLeft, Position.TopRight, Position.BottomRight], // 4 players
    [Position.BottomCenter, Position.BottomRight, Position.TopRight, Position.TopLeft, Position.BottomLeft] // 4 players
]

