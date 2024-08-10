import { LobColumnName } from '../types';

let instrumentNames: string[]
export const getInstrumentNames = (): string[] => {
    if (!instrumentNames) {
        instrumentNames = []
        for (let i = 0; i < 50; i++) {
            instrumentNames.push('UBIQ' + ('00' + i).slice(-3))
        }
    }
    return instrumentNames
}

export const getLobColumns = (): LobColumnName[] => {
    return [
        'Tick',
        'AskPrice1', 'AskPrice2', 'AskPrice3', 'AskPrice4', 'AskPrice5', 'AskPrice6', 'AskPrice7', 'AskPrice8', 'AskPrice9', 'AskPrice10',
        'AskVolume1', 'AskVolume2', 'AskVolume3', 'AskVolume4', 'AskVolume5', 'AskVolume6', 'AskVolume7', 'AskVolume8', 'AskVolume9', 'AskVolume10',
        'BidPrice1', 'BidPrice2', 'BidPrice3', 'BidPrice4', 'BidPrice5', 'BidPrice6', 'BidPrice7', 'BidPrice8', 'BidPrice9', 'BidPrice10',
        'BidVolume1', 'BidVolume2', 'BidVolume3', 'BidVolume4', 'BidVolume5', 'BidVolume6', 'BidVolume7', 'BidVolume8', 'BidVolume9', 'BidVolume10',
        'TotalTradeVolume', 'TotalTradeValue'
    ]

}