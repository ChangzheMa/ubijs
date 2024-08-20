import { config } from 'dotenv'
config()

export const USER_NAME = process.env.USER_NAME || ''
export const PASS_WORD = process.env.PASS_WORD || ''
export const LOG_FOLDER = process.env.LOG_FOLDER || './raw_log'
export const CSV_LOG_FOLDER = process.env.CSV_LOG_FOLDER || './csv_log'
export const GAME_LOG_FOLDER = process.env.GAME_LOG_FOLDER || './game_log'
export const LOB_REQUEST_DELAY_MS = process.env.LOB_REQUEST_DELAY_MS || '200'
export const ACCOUNT_REQUEST_DELAY_MS = process.env.ACCOUNT_REQUEST_DELAY_MS || '5000'  // 定期更新 accountInfo 的间隔
export const ALL_TRADES_REQUEST_DELAY_MS = process.env.ALL_TRADES_REQUEST_DELAY_MS || '100'  // 定期更新 allTrades 的间隔
