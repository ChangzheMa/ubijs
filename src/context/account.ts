

class Account {
    private static instance: Account;

    // 游戏目标（getUserInfo 5次/秒
    // 当前持仓量（getUserInfo 5次/秒
    // 账户订单 & 成交信息（getActiveOrder（自己缓存），getTrade 50次/秒 * 股票
    // 下单 & 撤单（order，cancel 50次/秒

    private constructor() {
    }

    public static getInstance(): Account {
        if (!Account.instance) {
            Account.instance = new Account()
        }
        return Account.instance
    }

    /**
     * 每日开始时初始化: 取消全部订单 & 获取当前 gameInfo
     */
    public async initAccountInfoAndResetOrder() {

    }

    /**
     * 游戏进行时定期更新 accountInfo
     */
    public async updateAccountInfoTimed() {

    }
}

export const account: Account = Account.getInstance()
