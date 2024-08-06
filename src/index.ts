import * as log4js from 'log4js';
import { InterfaceClass } from './api';
import { sleep } from './util';

const logger = log4js.getLogger()
logger.level = 'debug'

const api = new InterfaceClass()

const fetchDataByInstrumentName = async (instrumentName: string) => {
    while (true) {
        try {
            const lobResponse = await api.sendGetLimitOrderBook(instrumentName)
            logger.info(`Limit Order Book for ${instrumentName}: ${JSON.stringify(lobResponse)}`);
        } catch (error) {
            logger.warn(`Error when fetch data for ${instrumentName}, e: ${error}`)
        }
        await sleep(1000)
    }
}

const main = async () => {
    try {
        // 1. 获取比赛信息
        const gameInfoResponse = await api.sendGetGameInfo();
        logger.info(`Game Info: ${JSON.stringify(gameInfoResponse)}`);

        // 2. 获取股票信息
        const instrumentInfoResponse = await api.sendGetInstrumentInfo();
        if (instrumentInfoResponse.status === 'Success') {
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
