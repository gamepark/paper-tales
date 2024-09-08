import { getEnumValues, Money } from "@gamepark/rules-api";

export enum Gold{
    Gold1 = 1,
}

export const goldMoney = new Money(getEnumValues(Gold))