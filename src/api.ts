import axios, { AxiosInstance } from 'axios'
import { config } from 'dotenv'
import { logger } from './util'

config()

export class InterfaceClass {
    private readonly domainName: string;
    private session: AxiosInstance;

    private tokenUb: string | undefined;

    constructor(domainName?: string) {
        this.domainName = domainName || 'http://8.147.116.35:30020'
        this.session = axios.create()
    }

    private async sendLogin(username: string, password: string) {
        const url = `${this.domainName}/Login`;
        const data = {
            user: username,
            password: password
        };
        const response = await this.session.post(url, data);
        if (response.data.status == 'Success') {
            this.tokenUb = response.data.token_ub;
        } else {
            throw new Error(`Error when login: ${response.status}, ${response.data}`)
        }
        return response.data;
    }

    private async getTokenUb(): Promise<string> {
        if (!this.tokenUb) {
            const username = process.env.USER_NAME!
            const password = process.env.PASS_WORD!
            await this.sendLogin(username, password);
        }
        return this.tokenUb!
    }

    async sendGetGameInfo() {
        const url = `${this.domainName}/TradeAPI/GetGameInfo`;
        const data = {
            token_ub: await this.getTokenUb(),
        };
        const response = await this.session.post(url, data);
        return response.data;
    }

    async sendOrder(instrument: string, localtime: number, direction: string, price: number, volume: number) {
        logger.debug(`Order: Instrument: ${instrument}, Direction: ${direction}, Price: ${price}, Volume: ${volume}`);
        const url = `${this.domainName}/TradeAPI/Order`;
        const data = {
            token_ub: await this.getTokenUb(),
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

    async sendCancel(instrument: string, localtime: number, index: number) {
        logger.debug(`Cancel: Instrument: ${instrument}, index: ${index}`);
        const url = `${this.domainName}/TradeAPI/Cancel`;
        const data = {
            token_ub: await this.getTokenUb(),
            user_info: "NULL",
            instrument: instrument,
            localtime: 0,
            index: index
        };
        const response = await this.session.post(url, data);
        return response.data;
    }

    async sendGetLimitOrderBook(instrument: string) {
        const url = `${this.domainName}/TradeAPI/GetLimitOrderBook`;
        const data = {
            token_ub: await this.getTokenUb(),
            instrument: instrument
        };
        const response = await this.session.post(url, data);
        return response.data;
    }

    async sendGetUserInfo() {
        const url = `${this.domainName}/TradeAPI/GetUserInfo`;
        const data = {
            token_ub: await this.getTokenUb(),
        };
        const response = await this.session.post(url, data);
        return response.data;
    }

    async sendGetInstrumentInfo() {
        const url = `${this.domainName}/TradeAPI/GetInstrumentInfo`;
        const data = {
            token_ub: await this.getTokenUb(),
        };
        const response = await this.session.post(url, data);
        return response.data;
    }

    async sendGetTrade(instrument: string) {
        const url = `${this.domainName}/TradeAPI/GetTrade`;
        const data = {
            token_ub: await this.getTokenUb(),
            instrument_name: instrument
        };
        const response = await this.session.post(url, data);
        return response.data;
    }

    async sendGetActiveOrder() {
        const url = `${this.domainName}/TradeAPI/GetActiveOrder`;
        const data = {
            token_ub: await this.getTokenUb(),
        };
        const response = await this.session.post(url, data);
        return response.data;
    }
}
