"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const log4js = __importStar(require("log4js"));
const logger = log4js.getLogger();
logger.level = 'debug';
class InterfaceClass {
    constructor(domainName) {
        this.domainName = domainName;
        this.session = axios_1.default.create();
    }
    sendLogin(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.domainName}/Login`;
            const data = {
                user: username,
                password: password
            };
            const response = yield this.session.post(url, data);
            return response.data;
        });
    }
    sendGetGameInfo(tokenUb) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug('GetGameInfo: ');
            const url = `${this.domainName}/TradeAPI/GetGameInfo`;
            const data = {
                token_ub: tokenUb,
            };
            const response = yield this.session.post(url, data);
            return response.data;
        });
    }
    sendOrder(tokenUb, instrument, localtime, direction, price, volume) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const response = yield this.session.post(url, data);
            return response.data;
        });
    }
    sendCancel(tokenUb, instrument, localtime, index) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`Cancel: Instrument: ${instrument}, index: ${index}`);
            const url = `${this.domainName}/TradeAPI/Cancel`;
            const data = {
                token_ub: tokenUb,
                user_info: "NULL",
                instrument: instrument,
                localtime: 0,
                index: index
            };
            const response = yield this.session.post(url, data);
            return response.data;
        });
    }
    sendGetLimitOrderBook(tokenUb, instrument) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`GetLimitOrderBook: Instrument: ${instrument}`);
            const url = `${this.domainName}/TradeAPI/GetLimitOrderBook`;
            const data = {
                token_ub: tokenUb,
                instrument: instrument
            };
            const response = yield this.session.post(url, data);
            return response.data;
        });
    }
    sendGetUserInfo(tokenUb) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug('GetUserInfo: ');
            const url = `${this.domainName}/TradeAPI/GetUserInfo`;
            const data = {
                token_ub: tokenUb,
            };
            const response = yield this.session.post(url, data);
            return response.data;
        });
    }
    sendGetInstrumentInfo(tokenUb) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug('GetInstrumentInfo: ');
            const url = `${this.domainName}/TradeAPI/GetInstrumentInfo`;
            const data = {
                token_ub: tokenUb,
            };
            const response = yield this.session.post(url, data);
            return response.data;
        });
    }
    sendGetTrade(tokenUb, instrument) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`GetTrade: Instrument: ${instrument}`);
            const url = `${this.domainName}/TradeAPI/GetTrade`;
            const data = {
                token_ub: tokenUb,
                instrument_name: instrument
            };
            const response = yield this.session.post(url, data);
            return response.data;
        });
    }
    sendGetActiveOrder(tokenUb) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug('GetActiveOrder: ');
            const url = `${this.domainName}/TradeAPI/GetActiveOrder`;
            const data = {
                token_ub: tokenUb,
            };
            const response = yield this.session.post(url, data);
            return response.data;
        });
    }
}
