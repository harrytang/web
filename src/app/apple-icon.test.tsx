jest.mock('./icon', () => ({
  __esModule: true,
  default: jest.fn(),
}))

import AppleIcon, { contentType, runtime, size } from './apple-icon'
import Icon from './icon'

describe('apple-icon route', () => {
  it('exports the expected static metadata', () => {
    expect(runtime).toBe('edge')
    expect(size).toEqual({ width: 180, height: 180 })
    expect(contentType).toBe('image/png')
  })

  it('re-exports icon implementation as default', () => {
    expect(AppleIcon).toBe(Icon)
  })
})