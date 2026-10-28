/**
 * The tastes of a bot: a small bonus or malus, in Legend points, that it gives to each card or building. They are drawn
 * from the Monarch, the turn and the card, so that the bot keeps the same tastes all along a turn (the card it drafts
 * is the card it then wants to deploy), but plays differently from one turn and from one seat to another. They make a
 * bot that does not always play the best move, without ever playing an absurd one.
 */
export class Taste {
  constructor(
    private readonly player: number,
    private readonly turn: number,
    private readonly amplitude: number
  ) {}

  of(key: number): number {
    let hash = Math.imul(this.player, 73856093) ^ Math.imul(this.turn, 19349663) ^ Math.imul(key, 83492791)
    hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b)
    hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b)
    hash ^= hash >>> 16
    // From -1 to 1
    return (((hash >>> 0) / 0xffffffff) * 2 - 1) * this.amplitude
  }
}
