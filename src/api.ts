import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { config } from 'dotenv'
import { logger } from './util'
import {
    CancelRequest,
    CancelResponse,
    GetActiveOrderRequest,
    GetActiveOrderResponse,
    GetAllLimitOrderBooksRequest,
    GetAllLimitOrderBooksResponse,
    GetAllTradesRequest,
    GetAllTradesResponse,
    GetGameInfoRequest,
    GetGameInfoResponse,
    GetInstrumentInfoRequest,
    GetInstrumentInfoResponse,
    GetLimitOrderBookRequest,
    GetLimitOrderBookResponse,
    GetTradeRequest,
    GetTradeResponse,
    GetUserInfoRequest,
    GetUserInfoResponse,
    OrderRequest,
    OrderResponse
} from './types';
import { PASS_WORD, USER_NAME } from './env';

config()

export class InterfaceClass {
    private session: AxiosInstance;

    private tokenUb: string | undefined;

    constructor(domainName?: string) {
        this.session = axios.create({
            baseURL: domainName || 'http://8.147.116.35:30020',
            timeout: 5000
        })
    }

    private async sendLogin(username: string, password: string) {
        const url = `/Login`;
        const data = {
            user: username,
            password: password
        };
        const response = await this.session.post(url, data);
        if (response.data.status == 'Success') {
            this.tokenUb = response.data.token_ub;
        } else {
            throw new Error(`Error when login: ${response.status}, ${JSON.stringify(response.data)}`)
        }
        return response.data;
    }

    private async getTokenUb(): Promise<string> {
        if (!this.tokenUb) {
            const username = USER_NAME
            const password = PASS_WORD
            await this.sendLogin(username, password);
        }
        return this.tokenUb!
    }

    async sendGetGameInfo(): Promise<GetGameInfoResponse> {
        const url = `/TradeAPI/GetGameInfo`;
        const data: GetGameInfoRequest = {
            token_ub: await this.getTokenUb(),
        };
        const response = await this.session.post(url, data);
        return response.data;
    }

    async sendOrder(instrument: string, localtime: number, direction: "buy" | "sell", price: number, volume: number): Promise<OrderResponse> {
        logger.debug(`Order: Instrument: ${instrument}, Direction: ${direction}, Price: ${price}, Volume: ${volume}`);
        const url = `/TradeAPI/Order`;
        const data: OrderRequest = {
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

    async sendCancel(instrument: string, localtime: number, index: number): Promise<CancelResponse> {
        logger.debug(`Cancel: Instrument: ${instrument}, index: ${index}`);
        const url = `/TradeAPI/Cancel`;
        const data: CancelRequest = {
            token_ub: await this.getTokenUb(),
            user_info: "NULL",
            instrument: instrument,
            localtime: 0,
            index: index
        };
        const response = await this.session.post(url, data);
        return response.data;
    }

    async sendGetLimitOrderBook(instrument: string): Promise<GetLimitOrderBookResponse|void> {
        try {
            const url = `/TradeAPI/GetLimitOrderBook`;
            const data: GetLimitOrderBookRequest = {
                token_ub: await this.getTokenUb(),
                instrument: instrument
            };
            const response = await this.session.post(url, data);
            // 这里处理以下 response.data 里有 nan 导致无法处理的问题
            if (response && typeof response.data == 'string') {
                try {
                    response.data = JSON.parse(response.data.replace('-nan', '0'))
                } catch (e) {
                    // do nothing
                }
            }
            return response.data;
        } catch (e: any) {
            logger.error(`Error when sendGetLimitOrderBook, instrument: ${instrument}, ${e.message}`)
        }
    }

    async sendGetUserInfo(): Promise<GetUserInfoResponse> {
        const url = `/TradeAPI/GetUserInfo`;
        const data: GetUserInfoRequest = {
            token_ub: await this.getTokenUb(),
        };
        const response = await this.session.post(url, data);
        return response.data;
    }

    async sendGetInstrumentInfo(): Promise<GetInstrumentInfoResponse> {
        const url = `/TradeAPI/GetInstrumentInfo`;
        const data: GetInstrumentInfoRequest = {
            token_ub: await this.getTokenUb(),
        };
        const response = await this.session.post(url, data);
        return response.data;
    }

    async sendGetTrade(instrument: string): Promise<GetTradeResponse> {
        const url = `/TradeAPI/GetTrade`;
        const data: GetTradeRequest = {
            token_ub: await this.getTokenUb(),
            instrument_name: instrument
        };
        const response = await this.session.post(url, data);
        return response.data;
    }

    async sendGetActiveOrder(): Promise<GetActiveOrderResponse> {
        const url = `/TradeAPI/GetActiveOrder`;
        const data: GetActiveOrderRequest = {
            token_ub: await this.getTokenUb(),
        };
        const response = await this.session.post(url, data);
        return response.data;
    }

    async sendGetAllTrades(): Promise<GetAllTradesResponse> {
        const url = `/TradeAPI/GetAllTrades`;
        const data: GetAllTradesRequest = {
            token_ub: await this.getTokenUb()
        };
        const response = await this.session.post<GetAllTradesResponse, AxiosResponse<GetAllTradesResponse>, GetAllTradesRequest>(url, data);
        return response.data;
    }

    async sendGetAllLimitOrderBooks(): Promise<GetAllLimitOrderBooksResponse|void> {
        try {
            const url = `/TradeAPI/GetAllLimitOrderBooks`;
            const data: GetAllLimitOrderBooksRequest = {
                token_ub: await this.getTokenUb()
            };
            const response = await this.session.post<GetAllLimitOrderBooksResponse, any, GetAllLimitOrderBooksRequest>(url, data);
            // 这里处理以下 response.data 里有 nan 导致无法处理的问题
            if (response && typeof response.data == 'string') {
                try {
                    response.data = JSON.parse(response.data.replace('-nan', '0'))
                } catch (e) {
                    // do nothing
                }
            }
            return response.data;
        } catch (e: any) {
            logger.error(`Error when sendGetAllLimitOrderBooks, ${e.message}`)
        }
    }
}

export const api = new InterfaceClass()
