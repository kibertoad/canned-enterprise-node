import { arraysEqual } from '../lib/equalsChecks'

describe('equalsChecks', () => {
  describe('arraysEqual', () => {
    it('correctly compares equal arrays', () => {
      expect(arraysEqual([1], [1])).toEqual(true)
      expect(arraysEqual([], [])).toEqual(true)
      expect(arraysEqual([1, 2], [1, 2])).toEqual(true)
      expect(arraysEqual(['1'], ['1'])).toEqual(true)
      expect(arraysEqual([true, false], [true, false])).toEqual(true)
    })

    it('correctly compares not equal arrays', () => {
      expect(arraysEqual([1], [2])).toEqual(false)
      expect(arraysEqual([1], [1, 2])).toEqual(false)
      expect(arraysEqual([1, 2], [2, 1])).toEqual(false)
      expect(arraysEqual(['1'], [1] as any)).toEqual(false)
      expect(arraysEqual([true, false, true], [true, false, false])).toEqual(false)
      expect(arraysEqual([{}], [{}])).toEqual(false)
    })
  })
})
