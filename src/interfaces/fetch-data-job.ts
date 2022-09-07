export interface FetchDataJobOptions {
    symbols?: string[] | any[],
    symbol?: string,
    limit?: number,
    since?: number,
    timeframe?: string,
    params?: any
}

export interface FetchDataJob {
    options: FetchDataJobOptions
}