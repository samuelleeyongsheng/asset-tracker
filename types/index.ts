export type AssetType = "crypto" | "stock";

export interface Ticker {
    symbol: string;
    name: string;
    price: string;
    change: number;
    type: AssetType;
    data: number[];
}

export interface Feature {
    icon: string;
    title: string;
    desc: string;
}

export interface User{
    name: string;
    email: string;
}