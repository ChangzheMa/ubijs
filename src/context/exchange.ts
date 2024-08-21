import { api, InterfaceClass } from '../api'
import * as dataForge from 'data-forge'
import 'data-forge-fs'
import { getInstrumentNames, getLobColumns } from './ctxutil';
import { appendToFile, logger, sleep } from '../util';
import { GAME_LOG_FOLDER, LOB_REQUEST_DELAY_MS } from '../env';

class Exchange {
    private static instance: Exchange;

    private api: InterfaceClass

    private isInGame: boolean = false
    private lobMap: { [instrumentName in string]: number[][] } = {}

    private constructor() {
        this.api = api
    }

    public static getInstance(): Exchange {
        if (!Exchange.instance) {
            Exchange.instance = new Exchange()
        }
        return Exchange.instance
    }

    public resetLobMap() {
        for (const instrumentName of getInstrumentNames()) {
            this.lobMap[instrumentName] = []
        }
    }

    public async startFetchLob() {
        this.resetLobMap()
        this.isInGame = true
        for (const instrument of getInstrumentNames()) {
            this.fetchDataByInstrumentName(instrument).then()
            await sleep(20)
        }
    }

    public stopFetchLob() {
        this.isInGame = false
    }

    public getLatestLocaltime(): number {
        let localtime = this.isInGame ? 1 : 0
        for (const instrumentName of getInstrumentNames()) {
            const lob = this.lobMap[instrumentName]
            if (lob && lob.length > 0) {
                localtime = Math.max(localtime, lob[lob.length-1][0])
            }
        }
        return localtime
    }

    /**
     * 获取最优价格，没有数据的话会返回 [0, 0]
     * @param instrumentName
     */
    public getBestPriceByInstrumentName(instrumentName: string): number[] {
        const lob = this.lobMap[instrumentName]
        if (lob && lob.length > 0) {
            return [lob[lob.length-1][1], lob[lob.length-1][21]]
        }
        return [0, 0]
    }

    private async fetchDataByInstrumentName(instrumentName: string) {
        let preLocaltime = -1
        while (this.isInGame) {
            try {
                api.sendGetLimitOrderBook(instrumentName).then((lobResponse: any) => {
                    if (!this.isInGame) {
                        return
                    }
                    if (lobResponse && lobResponse.status == 'Success') {
                        const lob = lobResponse.lob
                        if (lob.localtime > preLocaltime) {
                            preLocaltime = lob.localtime
                            const rowData = [lob.localtime, ...lob.askprice, ...lob.askvolume, ...lob.bidprice, ...lob.bidvolume, lob.trade_volume, lob.trade_value]
                            this.lobMap[instrumentName].push(rowData)
                        }
                    }
                })
            } catch (error) {
                logger.warn(`Error when fetch data for ${instrumentName}, e: ${error}`)
            }
            await sleep(Number(LOB_REQUEST_DELAY_MS))
        }
    }

    async saveGameData(gameLabel: string) {
        const folderPath = `${GAME_LOG_FOLDER}/${gameLabel}`
        for (const instrument of getInstrumentNames()) {
            await appendToFile(`${folderPath}/lob_${instrument}.csv`, getLobColumns().join(','))
            const data = this.lobMap[instrument].map(line => line.join(',')).join('\n')
            await appendToFile(`${folderPath}/lob_${instrument}.csv`, data).then()
        }
    }
}

export const exchange = Exchange.getInstance()
