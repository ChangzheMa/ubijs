import axios, { AxiosInstance } from 'axios';
import * as log4js from 'log4js';

const logger = log4js.getLogger();
logger.level = 'debug';

class InterfaceClass {
    private domainName: string;
    private session: AxiosInstance;

    constructor(domainName: string) {
        this.domainName = domainName;
        this.session = axios.create();
    }

    async sendLogin(username: string, password: string) {
        const url = `${this.domainName}/Login`;
        const data = {
            user: username,
            password: password
        };
        const response = await this.session.post(url, data);
        return response.data;
    }

    async sendGetGameInfo(tokenUb: string) {
        logger.debug('GetGameInfo: ');
        const url = `${this.domainName}/TradeAPI/GetGameInfo`;
        const data = {
            token_ub: tokenUb,
        };
        const response = await this.session.post(url, data);
        return response.data;
    }

    async sendOrder(tokenUb: string, instrument: string, localtime: number, direction: string, price: number, volume: number) {
        logger.debug(`Order: Instrument: ${instrument}, Direction: ${direction}, Price: ${price}, Volume: ${volume}`);
        const url = `${this.domainName}/TradeAPI/Order`;
        const data = {
            token_ub: tokenUb,
            user_info: "NULL",
            instrument: instrument,
            localtime: localtime,
            direction: direction,
            price: price,
            volume: volume,
        };
        const response = await this.session.post(url, data);
        return response.data;
    }

    async sendCancel(tokenUb: string, instrument: string, localtime: number, index: number) {
        logger.debug(`Cancel: Instrument: ${instrument}, index: ${index}`);
        const url = `${this.domainName}/TradeAPI/Cancel`;
        const data = {
            token_ub: tokenUb,
            user_info: "NULL",
            instrument: instrument,
            localtime: 0,
            index: index
        };
        const response = await this.session.post(url, data);
        return response.data;
    }

    async sendGetLimitOrderBook(tokenUb: string, instrument: string) {
        logger.debug(`GetLimitOrderBook: Instrument: ${instrument}`);
        const url = `${this.domainName}/TradeAPI/GetLimitOrderBook`;
        const data = {
            token_ub: tokenUb,
            instrument: instrument
        };
        const response = await this.session.post(url, data);
        return response.data;
    }

    async sendGetUserInfo(tokenUb: string) {
        logger.debug('GetUserInfo: ');
        const url = `${this.domainName}/TradeAPI/GetUserInfo`;
        const data = {
            token_ub: tokenUb,
        };
        const response = await this.session.post(url, data);
        return response.data;
    }

    async sendGetInstrumentInfo(tokenUb: string) {
        logger.debug('GetInstrumentInfo: ');
        const url = `${this.domainName}/TradeAPI/GetInstrumentInfo`;
        const data = {
            token_ub: tokenUb,
        };
        const response = await this.session.post(url, data);
        return response.data;
    }

    async sendGetTrade(tokenUb: string, instrument: string) {
        logger.debug(`GetTrade: Instrument: ${instrument}`);
        const url = `${this.domainName}/TradeAPI/GetTrade`;
        const data = {
            token_ub: tokenUb,
            instrument_name: instrument
        };
        const response = await this.session.post(url, data);
        return response.data;
    }

    async sendGetActiveOrder(tokenUb: string) {
        logger.debug('GetActiveOrder: ');
        const url = `${this.domainName}/TradeAPI/GetActiveOrder`;
        const data = {
            token_ub: tokenUb,
        };
        const response = await this.session.post(url, data);
        return response.data;
    }
}
