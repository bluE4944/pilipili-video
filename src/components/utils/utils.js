import {Decimal} from "decimal.js";

//16:9
const proportion16 = new Decimal(16).div(new Decimal(9)) ;

const proportion9 = new Decimal(9).div(new Decimal(16));

/**
 * 计算高 16：9
 * @param width 宽
 */
export function calculateHigh(width) {
    if(!width){
        return null;
    }
    return new Decimal(width).mul(proportion9).toNumber();
}

