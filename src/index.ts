import { game } from './context/game';
import { exchange } from './context/exchange';
import { account } from './context/account';
import { logger, sleep } from './util';
import { TRADE_TICK_COUNT_PER_DAY, TRADING_CYCLE_TICKS } from './env';
import { getInstrumentNames } from './context/ctxutil';


const tradeForInstrument = async (instrumentName: string) => {

}

const clearForInstrument = async (instrumentName: string) => {

}

const main = async () => {
    const listener = {
        onGameStart: (gameLabel: string): void => {
            logger.info(`~~~~~~~~~~~~~~~~~~ game start`)
            account.resetOrderAndStartFetchData().then()
            exchange.startFetchLob().then()
        },
        onGameEnd: (gameLabel: string): void => {
            logger.info(`~~~~~~~~~~~~~~~~~~ game end`)
            account.stopFetchData()
            exchange.stopFetchLob()
            exchange.saveGameData(gameLabel).then()
            game.saveScoreData(gameLabel).then()
        }
    }
    game.setGameStatusListener(listener).start().then()

    let stockCleared = false
    while (true) {
        await sleep(Number(TRADING_CYCLE_TICKS) * 100)
        const currentLocaltime = exchange.getLatestLocaltime()
        const skipTicks = (3000 - Number(TRADE_TICK_COUNT_PER_DAY)) / 2

        if (game.getIsInGame()) {
            if (currentLocaltime < skipTicks) {
                // 啥也不干，等待开始交易
                stockCleared = false
            } else if (currentLocaltime > skipTicks && currentLocaltime < 3000 - skipTicks) {    // 只在中间 2800 tick 交易
                stockCleared = false
                // 这里对每一个股票进行交易
                for (const instrumentName of getInstrumentNames()) {
                    tradeForInstrument(instrumentName).then()
                }
            } else if (currentLocaltime > 3000 - skipTicks) {
                // 这里对每一个股票进行清仓
                if (!stockCleared) {
                    for (const instrumentName of getInstrumentNames()) {
                        clearForInstrument(instrumentName).then()
                    }
                    stockCleared = true
                }
            }
        }
    }
}

main().then()
