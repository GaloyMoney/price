import { unixTimestamp } from "@utils"

it("unixTimestamp test", () => {
  expect(unixTimestamp(new Date("2009-01-03"))).toBe(1230940800)
  expect(unixTimestamp(new Date("2009-01-03T23:59:59.694Z"))).toBe(1231027199)
})
