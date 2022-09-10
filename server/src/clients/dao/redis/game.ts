import RedisClient from '.';
import { GameSessionI, GameStatus, APIResponse } from '../../../models';

class Game {
  private static instance: RedisClient;

  public async insert(gameSession: GameSessionI): Promise<APIResponse> {
    const redis = RedisClient.getInstance();
    const { id, players, numberOfPlayers, timePerTurn } = gameSession;
    const status = GameStatus.waiting;
    const gameSessionCreation = await redis.hmset(id, {
      numberOfPlayers,
      players,
      status,
      timePerTurn,
    });

    const games = await redis.rpush('games', id);

    const data = {
      id,
    };

    if (gameSessionCreation === 'OK' && games === 1) {
      return {
        data,
        messages: ['game session created successfully'],
      };
    } else {
      throw new Error(
        '500: an error occurred while inserting game session on database',
      );
    }
  }

  public async getActiveGames() {
    const redis = RedisClient.getInstance();
    const games = await redis.lrange('games', 0, -1);
    return games;
  }

  public async getGameSession(id: string) {
    const redis = RedisClient.getInstance();
    const gameSession = await redis.hgetall(id);
    return gameSession;
  }

  public async updatePlayers(id: string, players: string[]) {
    const redis = RedisClient.getInstance();
    const gameSession = await redis.hmset(id, { players });
    return gameSession;
  }

  public async updateStatus(id: string, status: GameStatus) {
    const redis = RedisClient.getInstance();
    const gameSession = await redis.hmset(id, { status });
    return gameSession;
  }

  public async deleteGameSession(id: string) {
    const redis = RedisClient.getInstance();
    const gameSession = await redis.del(id);
    return gameSession;
  }

  public async deleteGameFromList(id: string) {
    const redis = RedisClient.getInstance();
    const gameSession = await redis.lrem('games', 0, id);
    return gameSession;
  }

  public async deleteAllGames() {
    const redis = RedisClient.getInstance();
    const games = await redis.del('games');
    return games;
  }

  public async deleteAllGameSessions() {
    const redis = RedisClient.getInstance();
    const games = await redis.flushall();
    return games;
  }
}

export default Game;