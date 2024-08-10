import { game } from './context/game';
import { exchange } from './context/exchange';
import { logger } from './util';


const main = async () => {
    const listener = {
        onGameStart: (): void => {
            logger.info(`~~~~~~~~~~~~~~~~~~ game start`)
            exchange.startFetchLob()
        },
        onGameEnd: (): void => {
            logger.info(`~~~~~~~~~~~~~~~~~~ game end`)
            exchange.stopFetchLob()
        }
    }
    game.setGameStatusListener(listener).start().then()
}

main().then()
