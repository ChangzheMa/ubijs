import { api } from '../api'

class Exchange {
    private static instance: Exchange;

    private api;

    private lobMap

    private constructor() {
        this.api = api
    }

    public static getInstance(): Exchange {
        if (!Exchange.instance) {
            Exchange.instance = new Exchange();
        }
        return Exchange.instance;
    }
}

export const exchange = Exchange.getInstance()