import { api } from './api'
import { sleep, logger, appendToFile } from './util';
import { CSV_LOG_FOLDER, LOB_REQUEST_DELAY_MS } from './env';

const fetchDataByInstrumentName = async (instrumentName: string) => {
    const baseFolder = `${CSV_LOG_FOLDER}`
    const logPath = `${baseFolder}/${instrumentName}.csv`
    // const errPath = `${baseFolder}/${instrumentName}.error.log`
    // const invalidPath = `${baseFolder}/${instrumentName}.invalid.log`

    let pre_localtime = -1
    while (true) {
        try {
            api.sendGetLimitOrderBook(instrumentName).then((lobResponse: any) => {
                if (lobResponse && lobResponse.status == 'Success') {
                    const lob = lobResponse.lob
                    if (lob.localtime != pre_localtime) {
                        pre_localtime = lob.localtime
                        const dataStr = `${lob.localtime}|${lob.askprice.join('|')}|${lob.askvolume.join('|')}|`
                            + `${lob.bidprice.join('|')}|${lob.bidvolume.join('|')}|${lob.trade_volume}|${lob.trade_value}`
                        appendToFile(logPath, `${dataStr}`).then()
                    }
                } else if (!lobResponse || (lobResponse.status != 'Invalid Time' && lobResponse.status != 'No Game')) {
                    logger.debug(`${new Date().toISOString()} || ${JSON.stringify(lobResponse)}`)
                }
            })
        } catch (error) {
            logger.warn(`Error when fetch data for ${instrumentName}, e: ${error}`)
        }
        await sleep(Number(LOB_REQUEST_DELAY_MS))
    }
}

const main = async () => {
    try {
        // 1. 获取比赛信息
        const gameInfoResponse = await api.sendGetGameInfo();
        logger.info(`Game Info: ${JSON.stringify(gameInfoResponse)}`);

        // 2. 获取股票信息
        const instrumentInfoResponse = await api.sendGetInstrumentInfo();
        if (instrumentInfoResponse.status === 'Success' && instrumentInfoResponse.instruments) {
            const instrumentNames = instrumentInfoResponse.instruments.map((item: any) => {
                return item.instrument_name
            })

            // 3. 每隔一秒获取限价订单簿
            for (const instrumentName of instrumentNames) {
                await sleep(20)
                fetchDataByInstrumentName(instrumentName).then()
            }
        } else {
            logger.error('Failed to get instrument info: ', instrumentInfoResponse);
        }
    } catch (error) {
        logger.error('An error occurred: ', error);
    }
}

main().then()
