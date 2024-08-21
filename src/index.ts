import { game } from './context/game';
import { exchange } from './context/exchange';
import { account } from './context/account';
import { appendToFile, logger, sleep } from './util';
import { GAME_LOG_FOLDER, TRADE_TICK_COUNT_PER_DAY, TRADING_CYCLE_TICKS } from './env';
import { getInstrumentNames } from './context/ctxutil';
import { ActiveOrder, UserStockInfo } from './types';


const appendLog = async (logStr: string): Promise<void> => {
    const folderPath = `${GAME_LOG_FOLDER}/${game.getGameLabel()}`
    await appendToFile(`${folderPath}/order.log`, logStr)
}

const tradeForInstrument = async (instrumentName: string) => {

}

const clearForInstrument = async (instrumentName: string) => {
    const stockInfo: UserStockInfo | undefined = account.getStockInfoByInstrumentName(instrumentName)
    if (!stockInfo) {
        return
    }

    const remainVolume = stockInfo.remain_volume
    let unfilledVolume = 0
    account.getActiveOrdersByInstrumentName(instrumentName).forEach((order: ActiveOrder) => {
        unfilledVolume += order.volume
    })
    const orderVolume = remainVolume - unfilledVolume
    const [ask, bid] = exchange.getBestPriceByInstrumentName(instrumentName)

    let price = 0
    if (orderVolume > 0 && ask > 0) {   // 买
        price = ask + 0.02
    } else if (orderVolume < 0 && bid > 0) {    // 卖
        price = bid - 0.02
    }
    if (Math.abs(orderVolume) > 0 && price > 0) {     // 确实需要交易
        await account.cancelOrderByInstrument(instrumentName)
        const localtime = exchange.getLatestLocaltime()
        account.sendOrder(instrumentName, price, orderVolume, localtime).then(success => {
            if (success) {
                appendLog(`${localtime}, SendOrder: ${instrumentName}, ${orderVolume}, ${price}`)
            }
        })
    }
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
