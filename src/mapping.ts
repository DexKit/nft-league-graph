import {
  BattleNFTFactory,
  Aborted,
  Claimed,
  CreatedGame,
  GameFinished,
  GameStarted,
  JoinedGame,
  OwnershipTransferred,
  Withdrawed,
} from "../generated/BattleNFTFactory/BattleNFTFactory";
import { Game, Player, PlayerGame } from "../generated/schema";
import { ONE_BI, ZERO_BI } from "./helpers";

export function handleAborted(event: Aborted): void { }

export function handleClaimed(event: Claimed): void {
  const player = Player.load(`${event.params.claimer.toHexString()}`);

  if (player) {
    player.totalEarned = player.totalEarned.plus(event.params.amount);
    player.EarnedMinusSpent = player.EarnedMinusSpent.plus(event.params.amount);
    player.save();
  }
}

export function handleCreatedGame(event: CreatedGame): void {
  // We use here the array id

  const factoryContract = BattleNFTFactory.bind(event.address);
  const gameContract = factoryContract.allGames(event.params.id);
  const game = new Game(`${event.params.id}`);
  game.createdAt = event.block.timestamp;
  game.createdBy = event.transaction.from;
  game.duration = gameContract.value9;
  game.entry = gameContract.value6;
  game.status = "Waiting";
  game.startsAt = gameContract.value10;
  game.type = gameContract.value12 == 0 ? "Bull" : "Bear";

  game.save();
  const player = Player.load(`${event.transaction.from.toHexString()}`);
  if (!player) {
    const newPlayer = new Player(`${event.transaction.from.toHexString()}`);
    newPlayer.totalJoinedGames = ONE_BI;
    newPlayer.totalSpent = gameContract.value6;
    newPlayer.totalEarned = ZERO_BI;
    newPlayer.EarnedMinusSpent = gameContract.value6.neg();
    newPlayer.save();
    if (game && newPlayer) {
      const playerGame = new PlayerGame(`${game.id}-${newPlayer.id}`);
      playerGame.game = game.id;
      playerGame.player = newPlayer.id;
      playerGame.save();
    }
  }
  if (player) {
    player.totalJoinedGames = player.totalJoinedGames.plus(ONE_BI);
    player.totalSpent = player.totalSpent.plus(gameContract.value6);
    player.EarnedMinusSpent = player.EarnedMinusSpent.minus(
      gameContract.value6
    );
    player.save();
    if (game && player) {
      const playerGame = new PlayerGame(`${game.id}-${player.id}`);
      playerGame.game = game.id;
      playerGame.player = player.id;
      playerGame.save();
    }
  }
}

export function handleGameFinished(event: GameFinished): void {
  const game = Game.load(`${event.params.id}`);
  if (game) {
    game.status = "Ended";
    game.endedAt = event.block.timestamp;
    game.save();
  }
}

export function handleGameStarted(event: GameStarted): void {
  const game = Game.load(`${event.params.id}`);
  if (game) {
    game.status = "Started";
    game.startedAt = event.block.timestamp;
    game.save();
  }
}

export function handleJoinedGame(event: JoinedGame): void {
  const player = Player.load(`${event.transaction.from.toHexString()}`);
  const factoryContract = BattleNFTFactory.bind(event.address);
  const gameContract = factoryContract.allGames(event.params.id);
  const game = new Game(`${event.params.id}`);
  if (!player) {
    const newPlayer = new Player(`${event.transaction.from.toHexString()}`);
    newPlayer.totalJoinedGames = ONE_BI;
    newPlayer.totalSpent = gameContract.value6;
    newPlayer.totalEarned = ZERO_BI;
    newPlayer.EarnedMinusSpent = gameContract.value6.neg();
    newPlayer.save();
    if (game && newPlayer) {
      const playerGame = new PlayerGame(`${game.id}-${newPlayer.id}`);
      playerGame.game = game.id;
      playerGame.player = newPlayer.id;
      playerGame.save();
    }
  }
  if (player) {
    player.totalJoinedGames = player.totalJoinedGames.plus(ONE_BI);
    player.totalSpent = player.totalSpent.plus(gameContract.value6);
    player.EarnedMinusSpent = player.EarnedMinusSpent.minus(
      gameContract.value6
    );
    player.save();
    if (game && player) {
      const playerGame = new PlayerGame(`${game.id}-${player.id}`);
      playerGame.game = game.id;
      playerGame.player = player.id;
      playerGame.save();
    }
  }
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void { }

export function handleWithdrawed(event: Withdrawed): void {
  const player = Player.load(`${event.transaction.from.toHexString()}`);
  const factoryContract = BattleNFTFactory.bind(event.address);
  const gameContract = factoryContract.allGames(event.params.id);
  if (player) {
    player.totalJoinedGames = player.totalJoinedGames.minus(ONE_BI);
    player.totalSpent = player.totalSpent.minus(gameContract.value6);
    player.EarnedMinusSpent = player.EarnedMinusSpent.plus(gameContract.value6);
    player.save();
  }
}
