import { api } from '../api'
import { logger, sleep } from '../util';
import {
    ActiveOrder,
    InstrumentActiveOrder,
    Trade,
    UserStockInfo
} from '../types';
import { ACCOUNT_REQUEST_DELAY_MS, ALL_TRADES_REQUEST_DELAY_MS } from '../env';

class Account {
    private static instance: Account;

    private isInGame = false

    private stockInfoMap: Map<string, UserStockInfo> = new Map();

    private activeOrders: ActiveOrder[] = [];

    private constructor() {
    }

    public static getInstance(): Account {
        if (!Account.instance) {
            Account.instance = new Account()
        }
        return Account.instance
    }

    /**
     * 每日开始时初始化: 取消全部订单 & 获取当前 accountInfo & 开始定时更新 accountInfo
     */
    public async resetOrderAndStartFetchData() {
        // 取消全部订单
        const activeOrderResponse = await api.sendGetActiveOrder()
        logger.info(`activeOrdersResponse: ${JSON.stringify(activeOrderResponse)}`)
        if (activeOrderResponse.status == "Success") {
            activeOrderResponse.instruments?.forEach((instrumentActiveOrder: InstrumentActiveOrder) => {
                const instrumentName = instrumentActiveOrder.instrument_name
                instrumentActiveOrder.active_orders.forEach((order: ActiveOrder) => {
                    api.sendCancel(instrumentName, new Date().valueOf(), order.order_index)
                        .catch(error => {
                            logger.error(`Error when cancel order: instrument: ${instrumentName}, orderIndex: ${order.order_index}, error: ${error.message}`)
                        })
                })
            })
        }
        this.activeOrders = []

        // 获取 accountInfo
        let userInfoResponse = await api.sendGetUserInfo()
        while (userInfoResponse.status != "Success") {
            await sleep(500)
            userInfoResponse = await api.sendGetUserInfo()
        }
        logger.info(`Init userInfo, userInfoResponse: ${JSON.stringify(userInfoResponse)}`)
        this.stockInfoMap = new Map()
        userInfoResponse.rows?.forEach((row: UserStockInfo) => {
            this.stockInfoMap.set(row.instrument_name, row)
        })

        this.isInGame = true
        // 定时更新 accountInfo
        this.updateAccountInfoTimed().then()
        // 定时更新 allTrades
        this.updateActiveTradesTimed().then()
    }

    /**
     * 停止更新数据
     */
    public stopFetchData() {
        this.isInGame = false
    }

    /**
     * 获取某股票当前信息
     * @param instrumentName
     */
    public getStockInfoByInstrumentName(instrumentName: string): UserStockInfo | undefined {
        return this.stockInfoMap.get(instrumentName)
    }

    /**
     * 下单
     * @param instrumentName 股票名
     * @param price 价格
     * @param volume 数量
     * @return 是否下单成功
     */
    public async sendOrder(instrumentName: string, price: number, volume: number): Promise<boolean> {

    }

    /**
     * 按股票名撤所有订单
     * @param instrumentName 股票名
     */
    public async cancelOrder(instrumentName: string): Promise<void> {

    }

    /**
     * 撤所有过期订单
     * @param expireTimeInLocaltime 过期时间，以交易所tick为单位，默认50 tick
     */
    public async cancelExpiredOrders(expireTimeInLocaltime: number=50): Promise<void> {

    }

    /**
     * 游戏进行时定期更新 accountInfo
     */
    private async updateAccountInfoTimed() {
        while (this.isInGame) {
            const userInfoResponse = await api.sendGetUserInfo()
            if (userInfoResponse.status == "Success") {
                logger.info(`Refresh userInfo, userInfoResponse: ${JSON.stringify(userInfoResponse)}`)
                userInfoResponse.rows?.forEach((row: UserStockInfo) => {
                    this.stockInfoMap.set(row.instrument_name, row)
                })
            }
            await sleep(Number(ACCOUNT_REQUEST_DELAY_MS))
        }
    }

    /**
     * 游戏时定时更新 trades
     */
    private async updateActiveTradesTimed() {
        while (this.isInGame) {
            const allTradesResponse = await api.sendGetAllTrades();
            if (allTradesResponse && allTradesResponse.status == "Success") {
                this.updateLocalDataWhenAllTradesUpdated(allTradesResponse.trade_list?.flat())
            }
            await sleep(Number(ALL_TRADES_REQUEST_DELAY_MS))
        }
    }

    /**
     * 当 trade 信息更新时，对应更新本地的 activeOrder 和 stockInfo 信息
     * @param allTrades
     * @private
     */
    private updateLocalDataWhenAllTradesUpdated(allTrades: Trade[] | undefined) {
        allTrades?.forEach((trade: Trade) => {
            const order: ActiveOrder | undefined = this.activeOrders.find(
                (o: ActiveOrder) => o.order_index == trade.order_index
            )
            if (order && Math.abs(trade.remain_volume) < Math.abs(order.volume)) {
                const instrumentName: string = order.instrument_name!
                const stockInfo = this.stockInfoMap.get(instrumentName)!
                stockInfo.remain_volume = stockInfo.remain_volume - (order.volume - trade.remain_volume)
                order.volume = trade.remain_volume
            }
        })
        this.activeOrders = this.activeOrders.filter(order => order.volume != 0)
    }
}

export const account: Account = Account.getInstance()
