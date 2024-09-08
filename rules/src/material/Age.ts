import { getEnumValues, Money } from "@gamepark/rules-api";

export enum Age{
    Age1 = 1,
}

export const ageMoney = new Money(getEnumValues(Age))