import { game } from './context/game';
import { exchange } from './context/exchange';
import { logger } from './util';


const main = async () => {
    const listener = {
        onGameStart: (gameLabel: string): void => {
            logger.info(`~~~~~~~~~~~~~~~~~~ game start`)
            exchange.startFetchLob().then()
        },
        onGameEnd: (gameLabel: string): void => {
            logger.info(`~~~~~~~~~~~~~~~~~~ game end`)
            exchange.stopFetchLob()
            exchange.saveGameData(gameLabel).then()
        }
    }
    game.setGameStatusListener(listener).start().then()
}

main().then()
