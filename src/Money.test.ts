import { Money } from "./Money";

describe("Money", () => {
  describe("constructing", () => {
    it("can be constructed with and without currency", () => {
      const m1 = new Money(123);
      const m2 = new Money(123, "NZD");
      expect(m1.cents).toEqual(123);
      expect(m1.currency).toEqual("AUD");
      expect(m2.cents).toEqual(123);
      expect(m2.currency).toEqual("NZD");
    });

    it("can be constructed from an object", () => {
      const m1 = Money.from({ cents: 123 });
      const m2 = Money.from({ cents: 123, currency: "NZD" });
      expect(m1.cents).toEqual(123);
      expect(m1.currency).toEqual("AUD");
      expect(m2.cents).toEqual(123);
      expect(m2.currency).toEqual("NZD");
    });

    describe("from cents", () => {
      it("can be constructed from cents as a number", () => {
        const m1 = Money.fromCents(123);
        const m2 = Money.fromCents(123, "NZD");
        expect(m1.dollars).toEqual(1.23);
        expect(m1.currency).toEqual("AUD");
        expect(m2.dollars).toEqual(1.23);
        expect(m2.currency).toEqual("NZD");
      });

      it("can be constructed from cents as string", () => {
        const m1 = Money.fromCents("123");
        const m2 = Money.fromCents("123", "NZD");
        expect(m1.dollars).toEqual(1.23);
        expect(m1.currency).toEqual("AUD");
        expect(m2.dollars).toEqual(1.23);
        expect(m2.currency).toEqual("NZD");
      });
    });

    describe("from dollars", () => {
      it("can be constructed from dollars as a number", () => {
        const m1 = Money.fromDollars(123.45);
        const m2 = Money.fromDollars(0.12, "NZD");
        expect(m1.dollars).toEqual(123.45);
        expect(m1.currency).toEqual("AUD");
        expect(m2.dollars).toEqual(0.12);
        expect(m2.currency).toEqual("NZD");
      });

      it("can be constructed from dollars as string", () => {
        const m1 = Money.fromDollars("123.45");
        const m2 = Money.fromDollars("0.12", "NZD");
        expect(m1.dollars).toEqual(123.45);
        expect(m1.currency).toEqual("AUD");
        expect(m2.dollars).toEqual(0.12);
        expect(m2.currency).toEqual("NZD");
      });
    });

    it("if constructed from Money class, returns the same instance", () => {
      const m1 = Money.fromCents(123);
      const m2 = Money.from(m1);
      expect(m1 === m2).toEqual(true);
    });
  });

  describe("format", () => {
    it("returns formatted amount", () => {
      expect(Money.fromCents(0).format()).toEqual("$0.00");
      expect(Money.fromCents(1).format()).toEqual("$0.01");
      expect(Money.fromCents(12).format()).toEqual("$0.12");
      expect(Money.fromCents(123).format()).toEqual("$1.23");
      expect(Money.fromCents(12345).format()).toEqual("$123.45");
      expect(Money.fromCents(1234).format()).toEqual("$12.34");
      expect(Money.fromCents(123456).format()).toEqual("$1,234.56");
      expect(Money.fromCents(1234567).format()).toEqual("$12,345.67");
      expect(Money.fromCents(12345678).format()).toEqual("$123,456.78");
      expect(Money.fromCents(123456789).format()).toEqual("$1,234,567.89");
      expect(Money.fromCents(-1).format()).toEqual("-$0.01");
      expect(Money.fromCents(-12).format()).toEqual("-$0.12");
      expect(Money.fromCents(-123).format()).toEqual("-$1.23");
      expect(Money.fromCents(-1234).format()).toEqual("-$12.34");
      expect(Money.fromCents(-12345).format()).toEqual("-$123.45");
      expect(Money.fromCents(-123456).format()).toEqual("-$1,234.56");
      expect(Money.fromCents(-1234567).format()).toEqual("-$12,345.67");
      expect(Money.fromCents(-12345678).format()).toEqual("-$123,456.78");
      expect(Money.fromCents(-123456789).format()).toEqual("-$1,234,567.89");
    });

    it("can display without a symbol", () => {
      expect(Money.fromCents(123456789).format({ symbol: false })).toEqual(
        "1,234,567.89"
      );
      expect(Money.fromCents(-123456789).format({ symbol: false })).toEqual(
        "-1,234,567.89"
      );
    });

    it("can take a different thousand separator", () => {
      expect(
        Money.fromCents(123456789).format({ thousandSeparator: "" })
      ).toEqual("$1234567.89");
      expect(
        Money.fromCents(-123456789).format({ thousandSeparator: "" })
      ).toEqual("-$1234567.89");
      expect(
        Money.fromCents(123456789).format({ thousandSeparator: " " })
      ).toEqual("$1 234 567.89");
      expect(
        Money.fromCents(-123456789).format({ thousandSeparator: " " })
      ).toEqual("-$1 234 567.89");
    });

    it("can remove trailing zeroes", () => {
      expect(
        Money.fromCents(12300).format({ withTrailingZeros: false })
      ).toEqual("$123");
      expect(
        Money.fromCents(12310).format({ withTrailingZeros: false })
      ).toEqual("$123.1");
      expect(
        Money.fromCents(12311).format({ withTrailingZeros: false })
      ).toEqual("$123.11");
      expect(Money.fromCents(0).format({ withTrailingZeros: false })).toEqual(
        "$0"
      );
      expect(Money.fromCents(100).format({ withTrailingZeros: false })).toEqual(
        "$1"
      );
      expect(Money.fromCents(10).format({ withTrailingZeros: false })).toEqual(
        "$0.1"
      );
      expect(Money.fromCents(1).format({ withTrailingZeros: false })).toEqual(
        "$0.01"
      );
    });
  });

  describe("add", () => {
    it("throws an error if currencies are different", () => {
      const m1 = Money.fromCents(123, "AUD");
      const m2 = Money.fromCents(456, "NZD");

      expect(() => m1.add(m2)).toThrowErrorMatchingInlineSnapshot(
        `"Attempting to compare money of different currencies"`
      );
    });

    describe("when adding the same currency", () => {
      const m1 = Money.fromCents(100, "AUD");
      const m2 = Money.fromCents(250, "AUD");

      it("returns the difference between the two money amounts", () => {
        const fromM1ToM2 = m1.add(m2);
        expect(fromM1ToM2.dollars).toEqual(3.5);
        expect(fromM1ToM2.currency).toEqual("AUD");

        const fromM2ToM1 = m2.add(m1);
        expect(fromM2ToM1.dollars).toEqual(3.5);
        expect(fromM2ToM1.currency).toEqual("AUD");
      });
    });
  });

  describe("subtract", () => {
    it("throws an error if currencies are different", () => {
      const m1 = Money.fromCents(123, "AUD");
      const m2 = Money.fromCents(456, "NZD");

      expect(() => m1.subtract(m2)).toThrowErrorMatchingInlineSnapshot(
        `"Attempting to compare money of different currencies"`
      );
    });

    describe("when subtracting the same currency", () => {
      const m1 = Money.fromCents(100, "AUD");
      const m2 = Money.fromCents(250, "AUD");

      it("returns the difference between the two money amounts", () => {
        const diffFromM1ToM2 = m1.subtract(m2);
        expect(diffFromM1ToM2.dollars).toEqual(1.5);
        expect(diffFromM1ToM2.currency).toEqual("AUD");

        const diffFromM2ToM1 = m2.subtract(m1);
        expect(diffFromM2ToM1.dollars).toEqual(-1.5);
        expect(diffFromM2ToM1.currency).toEqual("AUD");
      });

      it("returns money with zero cents if compared to the same amount", () => {
        const diffFromM1ToItself = m1.subtract(m1);
        expect(diffFromM1ToItself.dollars).toEqual(0);
        expect(diffFromM1ToItself.currency).toEqual("AUD");
      });
    });
  });

  describe("multiply", () => {
    it("returns multiplyed money", () => {
      expect(Money.fromCents(3).multiply(2).cents).toEqual(6);
    });
  });

  describe("absolute", () => {
    it("returns Money with positive cents if cents amount is positive", () => {
      const m1 = Money.fromCents(123, "AUD").abs();

      expect(m1.dollars).toEqual(1.23);
      expect(m1.currency).toEqual("AUD");
    });
    it("returns Money with positive cents if cents amount is negative", () => {
      const m1 = Money.fromCents(-123, "AUD").abs();

      expect(m1.dollars).toEqual(1.23);
      expect(m1.currency).toEqual("AUD");
    });
  });

  describe("isPositive", () => {
    it("returns true if cents amount is positive", () => {
      const m1 = Money.fromCents(123, "AUD");

      expect(m1.isPositive).toEqual(true);
    });
    it("returns false if cents amount is zero", () => {
      const m1 = Money.fromCents(0, "AUD");

      expect(m1.isPositive).toEqual(false);
    });
    it("returns false if cents amount is negative", () => {
      const m1 = Money.fromCents(-123, "AUD");

      expect(m1.isPositive).toEqual(false);
    });
  });

  describe("isNegative", () => {
    it("returns false if cents amount is positive", () => {
      const m1 = Money.fromCents(123, "AUD");

      expect(m1.isNegative).toEqual(false);
    });
    it("returns false if cents amount is zero", () => {
      const m1 = Money.fromCents(0, "AUD");

      expect(m1.isNegative).toEqual(false);
    });
    it("returns true if cents amount is negative", () => {
      const m1 = Money.fromCents(-123, "AUD");

      expect(m1.isNegative).toEqual(true);
    });
  });

  describe("isZero", () => {
    it("returns false if cents amount is positive", () => {
      const m1 = Money.fromCents(123, "AUD");

      expect(m1.isZero).toEqual(false);
    });
    it("returns true if cents amount is zero", () => {
      const m1 = Money.fromCents(0, "AUD");

      expect(m1.isZero).toEqual(true);
    });
    it("returns false if cents amount is negative", () => {
      const m1 = Money.fromCents(-123, "AUD");

      expect(m1.isZero).toEqual(false);
    });
  });

  describe("centsOnly", () => {
    it("returns cent component of Money", () => {
      const m1 = Money.fromCents(12345, "AUD");
      expect(m1.centsOnly).toEqual(45);
    });

    it("returns 0 for 0 cents", () => {
      const m1 = Money.fromCents(0, "AUD");
      expect(m1.centsOnly).toEqual(0);
    });

    it("returns 22 for -5422 cents", () => {
      const m1 = Money.fromCents(-5422, "AUD");
      expect(m1.centsOnly).toEqual(22);
    });
  });

  describe("dollarsOnly", () => {
    it("returns dollar component of Money", () => {
      const m1 = Money.fromCents(12345, "AUD");
      expect(m1.dollarsOnly).toEqual(123);
    });

    it("returns 0 dollars for 0 cents", () => {
      const m1 = Money.fromCents(0, "AUD");
      expect(m1.dollarsOnly).toEqual(0);
    });

    it("returns 54 for -5422 cents", () => {
      const m1 = Money.fromCents(-5422, "AUD");
      expect(m1.dollarsOnly).toEqual(54);
    });
  });

  it("`.dollars` returns dollar value of Money", () => {
    const m1 = Money.fromCents(123, "AUD");
    expect(m1.dollars).toEqual(1.23);
  });

  it("`.cents` returns cent value of Money", () => {
    const m1 = Money.fromCents(123, "AUD");
    expect(m1.cents).toEqual(123);
  });
});
