import { api } from '../api';
import { appendToFile, logger, sleep } from '../util';
import { GAME_LOG_FOLDER } from '../env';
import { GetPrivateInfoResponse, GetPublicInfoResponse } from '../types';

class Game {

    private gameStatusListener: { onGameStart: (gameLabel: string) => void, onGameEnd: (gameLabel: string) => void} | undefined;

    private isInGame: boolean = false
    private gameLabel: string | undefined
    private privateInfo: GetPrivateInfoResponse | undefined
    private publicInfo: GetPublicInfoResponse | undefined

    constructor() {
    }

    public setGameStatusListener(listener: { onGameStart: (gameLabel: string) => void, onGameEnd: (gameLabel: string) => void}): Game {
        this.gameStatusListener = listener
        return this
    }

    public async start() {
        while (true) {
            api.sendGetLimitOrderBook('UBIQ000').then(lobResponse => {
                if (!lobResponse) {
                    // 请求不成功，不改变状态
                    logger.warn(`Failed when check game status: ${JSON.stringify(lobResponse)}`)

                } else if (lobResponse.status == 'Success') {
                    // 检测到在游戏运行中
                    if (lobResponse.lob?.localtime && lobResponse.lob?.localtime < 2950) {
                        this.setGameStatus(true, lobResponse.lob?.localtime)
                    } else if (lobResponse.lob?.localtime && lobResponse.lob?.localtime == 3000) {
                        this.setGameStatus(false, lobResponse.lob?.localtime)
                    }

                } else if (lobResponse.status == 'Invalid Time' || lobResponse.status == 'No Game') {
                    // 检测到非游戏状态
                    this.setGameStatus(false, undefined)

                } else {
                    // 请求结果无法解析
                    logger.warn(`Failed when check game status: ${JSON.stringify(lobResponse)}`)

                }

            })
            api.sendGetPrivateInfo().then(response => {
                if (response && response.status == "Success") {
                    this.privateInfo = response
                }
            })
            api.sendGetPublicInfo().then(response => {
                if (response && response.status == "Success") {
                    this.publicInfo = response
                }
            })
            await sleep(1000)
        }
    }

    public async saveScoreData(gameLabel: string) {
        const folderPath = `${GAME_LOG_FOLDER}/${gameLabel}`
        await appendToFile(`${folderPath}/conclusion.log`, JSON.stringify(this.privateInfo)).then()
        await appendToFile(`${folderPath}/rank.log`, JSON.stringify(this.publicInfo)).then()
    }

    private notifyGameStart(gameLabel: string) {
        if (this.gameStatusListener) {
            this.gameStatusListener.onGameStart(gameLabel)
        }
    }

    private notifyGameEnd(gameLabel: string) {
        if (this.gameStatusListener) {
            this.gameStatusListener.onGameEnd(gameLabel)
        }
    }

    private setGameStatus(newStatus: boolean, tick: any) {
        if (this.isInGame != newStatus) {
            logger.info(`Tick: ${tick}`)
            this.isInGame = newStatus
            if (newStatus) {
                this.gameLabel = new Date().toISOString()
                this.notifyGameStart(this.gameLabel)
            } else {
                this.notifyGameEnd(this.gameLabel || '')
            }
        }
    }
}

export const game = new Game()
