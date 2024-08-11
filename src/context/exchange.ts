import { api } from '../api'
import * as dataForge from 'data-forge'
import 'data-forge-fs'
import { getInstrumentNames, getLobColumns } from './ctxutil';
import { appendToFile, logger, sleep } from '../util';
import { GAME_LOG_FOLDER, LOB_REQUEST_DELAY_MS } from '../env';

class Exchange {
    private static instance: Exchange;

    private api

    private isFetching: boolean = false
    private lobMap: { [instrumentName in string]: dataForge.IDataFrame } = {}

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
            this.lobMap[instrumentName] = new dataForge.DataFrame({
                columnNames: getLobColumns()
            })
        }
    }

    public async startFetchLob() {
        this.resetLobMap()
        this.isFetching = true
        for (const instrument of getInstrumentNames()) {
            this.fetchDataByInstrumentName(instrument).then()
            await sleep(20)
        }
    }

    public stopFetchLob() {
        this.isFetching = false
    }

    private async fetchDataByInstrumentName(instrumentName: string) {
        let preLocaltime = -1
        while (this.isFetching) {
            try {
                api.sendGetLimitOrderBook(instrumentName).then((lobResponse: any) => {
                    if (!this.isFetching) {
                        return
                    }
                    if (lobResponse && lobResponse.status == 'Success') {
                        const lob = lobResponse.lob
                        if (lob.localtime > preLocaltime) {
                            preLocaltime = lob.localtime
                            const rowData = [lob.localtime, ...lob.askprice, ...lob.askvolume, ...lob.bidprice, ...lob.bidvolume, lob.trade_volume, lob.trade_value]
                            this.lobMap[instrumentName] = this.lobMap[instrumentName].concat(new dataForge.DataFrame({columnNames: getLobColumns(), rows: [rowData]}))
                            logger.info(`${instrumentName} ${lob.localtime}`)
                        }
                    }
                })
            } catch (error) {
                logger.warn(`Error when fetch data for ${instrumentName}, e: ${error}`)
            }
            await sleep(Number(LOB_REQUEST_DELAY_MS))
        }
    }

    saveGameData(gameLabel: string) {
        const folderPath = `${GAME_LOG_FOLDER}/${gameLabel}`
        for (const instrument of getInstrumentNames()) {
            appendToFile(`${folderPath}/lob_${instrument}.csv`, this.lobMap[instrument].toCSV()).then()
        }
    }
}

export const exchange = Exchange.getInstance()