// Login
export interface LoginRequest {
    user: string;
    password: string;
}

export interface LoginResponse {
    response_type: string;
    token_ub?: string;
    status: "Success" | "Invalid User";
}

// TradeAPI/GetGameInfo
export interface GetGameInfoRequest {
    token_ub: string;
}

export interface GetGameInfoResponse {
    response_type: string;
    next_game_start_time?: string;
    next_game_running_days?: number;
    next_game_running_time?: number;
    next_game_time_ratio?: number;
    status: "Success" | "Invalid User" | "No Game";
}

// TradeAPI/Order
export interface OrderRequest {
    token_ub: string;
    user_info: string;
    instrument: string;
    localtime: number;
    direction: "buy" | "sell";
    price: number;
    volume: number;
}

export interface OrderResponse {
    response_type: string;
    user_info: string;
    localtime: number;
    index?: number;
    status:
        | "Success"
        | "Invalid User"
        | "No Game"
        | "Invalid Time"
        | "Invalid Instrument"
        | "Invalid Direction"
        | "Invalid Price"
        | "Invalid Volume"
        | "Too Many Active Order"
        | "Wrong Direction"
        | "Volume Exceeds Target";
}

// TradeAPI/Cancel
export interface CancelRequest {
    token_ub: string;
    user_info: string;
    instrument: string;
    localtime: number;
    index: number;
}

export interface CancelResponse {
    response_type: string;
    user_info: string;
    localtime: number;
    status:
        | "Success"
        | "Invalid User"
        | "No Game"
        | "Invalid Time"
        | "Invalid Instrument"
        | "No Order Index"
        | "No Order"
        | "Canceled Order"
        | "Traded Order"
        | "Not Your Order";
}

// TradeAPI/GetActiveOrder
export interface GetActiveOrderRequest {
    token_ub: string;
}

export interface ActiveOrder {
    order_index: number;
    order_price: number;
    volume: number;
    direction: "buy" | "sell";
}

export interface InstrumentActiveOrder {
    instrument_name: string;
    active_orders: ActiveOrder[];
}

export interface GetActiveOrderResponse {
    response_type: string;
    instruments?: InstrumentActiveOrder[];
    status: "Success" | "Invalid User" | "No Game" | "Invalid Time";
}

// TradeAPI/GetTrade
export interface GetTradeRequest {
    token_ub: string;
    instrument_name: string;
}

export interface Trade {
    trade_time: number;
    trade_index: number;
    order_index: number;
    trade_price: number;
    trade_volume: number;
    remain_volume: number;
}

export interface GetTradeResponse {
    response_type: string;
    instrument?: string;
    trade_list?: Trade[];
    status: "Success" | "Invalid User" | "No Game" | "Invalid Time" | "Invalid Instrument";
}

// TradeAPI/GetLimitOrderBook
export interface GetLimitOrderBookRequest {
    token_ub: string;
    instrument: string;
}

export interface LimitOrderBook {
    localtime: number;
    limit_up_price: number;
    limit_down_price: number;
    bidprice: number[];
    askprice: number[];
    bidvolume: number[];
    askvolume: number[];
    last_price: number;
    trade_volume: number;
    trade_value: number;
    twap: number;
}

export interface GetLimitOrderBookResponse {
    response_type: string;
    instrument?: string;
    lob?: LimitOrderBook;
    status: "Success" | "Invalid User" | "No Game" | "Invalid Time" | "Invalid Instrument";
}

// TradeAPI/GetUserInfo
export interface GetUserInfoRequest {
    token_ub: string;
}

export interface UserStockInfo {
    instrument_name: string;
    share_holding: number;
    orders: number;
    error_orders: number;
    order_value: number;
    trade_value: number;
    target_volume: number;
    remain_volume: number;
    frozen_volume: number;
}

export interface GetUserInfoResponse {
    response_type: string;
    orders?: number;
    error_orders?: number;
    order_value?: number;
    trade_value?: number;
    rows?: UserStockInfo[];
    status: "Success" | "Invalid User" | "No Game" | "Invalid Time" | "Invalid Instrument";
}

// TradeAPI/GetInstrumentInfo
export interface GetInstrumentInfoRequest {
    token_ub: string;
}

export interface InstrumentInfo {
    id: number;
    instrument_name: string;
}

export interface GetInstrumentInfoResponse {
    response_type: string;
    instrument_number?: number;
    instruments?: InstrumentInfo[];
    status: "Success" | "Invalid User";
}
