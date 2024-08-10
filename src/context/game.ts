import { api } from '../api';
import { appendToFile, logger, sleep } from '../util';

class Game {

    private gameStatusListener: { onGameStart: () => void, onGameEnd: () => void} | undefined;

    private isInGame: boolean = false

    constructor() {
    }

    public setGameStatusListener(listener: { onGameStart: () => void, onGameEnd: () => void}): Game {
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
            await sleep(1000)
        }
    }

    private notifyGameStart() {
        if (this.gameStatusListener) {
            this.gameStatusListener.onGameStart()
        }
    }

    private notifyGameEnd() {
        if (this.gameStatusListener) {
            this.gameStatusListener.onGameEnd()
        }
    }

    private setGameStatus(newStatus: boolean, tick: any) {
        if (this.isInGame != newStatus) {
            logger.info(`Tick: ${tick}`)
            this.isInGame = newStatus
            if (newStatus) {
                this.notifyGameStart()
            } else {
                this.notifyGameEnd()
            }
        }
    }
}

export const game = new Game()
