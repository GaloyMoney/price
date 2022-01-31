import { median } from "@src/index"

it("median test", () => {
  expect(median([2, 1, 5])).toBe(2)
  expect(median([2, 1])).toBe(1.5)
  expect(median([2, 1, undefined])).toBe(1.5)
  expect(median([2, 1, undefined, 5])).toBe(2)
})
