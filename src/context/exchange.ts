import { api } from '../api'
import * as dataForge from 'data-forge'
import 'data-forge-fs'
import { getInstrumentNames, getLobColumns } from './ctxutil';
import { appendToFile, logger, sleep } from '../util';

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
        for (const instrument of getInstrumentNames().slice(0, 1)) {
            this.fetchDataByInstrumentName(instrument).then()
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
                            logger.info(this.lobMap[instrumentName].toCSV())
                        }
                    }
                })
            } catch (error) {
                logger.warn(`Error when fetch data for ${instrumentName}, e: ${error}`)
            }
            await sleep(Number(process.env.LOB_REQUEST_DELAY_MS) || 1000)
        }
    }
}

export const exchange = Exchange.getInstance()