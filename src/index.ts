import * as log4js from 'log4js';
import { InterfaceClass } from './api';

const logger = log4js.getLogger();
logger.level = 'debug';

async function main() {
    const domainName = 'http://8.147.116.35:30020'; // 替换为你的API地址
    const username = ''; // 替换为你的用户名
    const password = ''; // 替换为你的密码

    const api = new InterfaceClass(domainName);

    try {
        // 1. 登录
        const loginResponse = await api.sendLogin(username, password);
        if (loginResponse.status === 'Success') {
            logger.info('Login Success: ', loginResponse.token_ub);
            const tokenUb = loginResponse.token_ub;

            // 2. 获取游戏信息
            const gameInfoResponse = await api.sendGetGameInfo(tokenUb);
            logger.info('Game Info: ', gameInfoResponse);

            // 3. 获取仪器信息
            const instrumentInfoResponse = await api.sendGetInstrumentInfo(tokenUb);
            if (instrumentInfoResponse.status === 'Success') {
                logger.info('Instrument Info: ', instrumentInfoResponse);

                // 选择前三个股票
                const instruments = instrumentInfoResponse.instruments.slice(0, 3);

                // 4. 每隔一秒获取限价订单簿
                for (const instrument of instruments) {
                    const instrumentName = instrument.instrument_name;
                    logger.info(`Fetching Limit Order Book for ${instrumentName}`);
                    const lobResponse = await api.sendGetLimitOrderBook(tokenUb, instrumentName);
                    logger.info(`Limit Order Book for ${instrumentName}: `, lobResponse);

                    // 每个请求间隔1秒
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } else {
                logger.error('Failed to get instrument info: ', instrumentInfoResponse);
            }
        } else {
            logger.error('Login failed: ', loginResponse);
        }
    } catch (error) {
        logger.error('An error occurred: ', error);
    }
}

main();
