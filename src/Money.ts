import * as accounting from "accounting";
import MonetaryValue from "currency.js";

// We don't really support other currencies at the moment,
// but at least we're prepared for it ;)
export type Currency = "AUD" | "NZD";

export const DEFAULT_CURRENCY: Currency = "AUD";

export interface MoneyInterface {
  cents: number;
  currency?: Currency;
}

export class Money implements MoneyInterface {
  readonly currency: Currency;

  private readonly value: MonetaryValue;

  constructor(
    cents: number | string | MonetaryValue,
    currency: Currency = DEFAULT_CURRENCY
  ) {
    this.value = MonetaryValue(cents, { fromCents: true });
    this.currency = currency;
  }

  static from(obj: MoneyInterface | Money): Money {
    if (obj instanceof Money) {
      return obj;
    }

    return new Money(obj.cents, obj.currency);
  }

  static fromCents(
    cents: number | string,
    currency: Currency = DEFAULT_CURRENCY
  ): Money {
    const value = MonetaryValue(cents, { fromCents: true });
    return new Money(value, currency);
  }

  static fromDollars(
    dollars: number | string,
    currency: Currency = DEFAULT_CURRENCY
  ): Money {
    const value = MonetaryValue(dollars);
    return new Money(value, currency);
  }

  static zero(currency: Currency = DEFAULT_CURRENCY): Money {
    return new Money(0, currency);
  }

  /**
   * Returns float value of the dollars amount,
   * e.g. `123.45` for `{ cents: 12345 }`.
   */
  get dollars(): number {
    return this.value.value;
  }

  /**
   * Returns int value of the cents amount,
   * e.g. `12345` for `{ cents: 12345 }`.
   */
  get cents(): number {
    return this.value.intValue;
  }

  get isPositive(): boolean {
    return this.value.value > 0;
  }

  get isNegative(): boolean {
    return this.value.value < 0;
  }

  get isZero(): boolean {
    return this.value.value === 0;
  }

  add(addend: Money): Money {
    if (this.currency !== addend.currency) {
      throw new TypeError(
        "Attempting to compare money of different currencies"
      );
    }

    return new Money(addend.value.add(this.value), this.currency);
  }

  subtract(subtrahend: Money): Money {
    if (this.currency !== subtrahend.currency) {
      throw new TypeError(
        "Attempting to compare money of different currencies"
      );
    }

    return new Money(subtrahend.value.subtract(this.value), this.currency);
  }

  multiply(multiplier: number): Money {
    return new Money(this.value.multiply(multiplier), this.currency);
  }

  abs(): Money {
    if (this.isPositive || this.isZero) {
      return this;
    }

    return new Money(this.value.multiply(-1), this.currency);
  }

  format({
    symbol = true,
    thousandSeparator = ",",
    withTrailingZeros = true,
  }: {
    symbol?: boolean;
    thousandSeparator?: "," | "" | " ";
    withTrailingZeros?: boolean;
  } = {}): string {
    const result = accounting.formatMoney(this.dollars, {
      symbol: symbol ? "$" : "",
      precision: 2,
      thousand: thousandSeparator,
      format: {
        pos: "%s%v",
        neg: "-%s%v",
        zero: "%s%v",
      },
    });

    if (!withTrailingZeros && result.includes(".")) {
      if (result.slice(-2) === "00") {
        return result.slice(0, -3);
      }
      if (result.slice(-1) === "0") {
        return result.slice(0, -1);
      }
    }

    return result;
  }

  toString(): string {
    return this.format();
  }
}
