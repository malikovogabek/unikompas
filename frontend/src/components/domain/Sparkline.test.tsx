import { render } from '@testing-library/react'
import { Sparkline } from './Sparkline'

describe('Sparkline', () => {
  it('skips nulls and needs at least two points', () => {
    const { container, rerender } = render(<Sparkline values={[150, null, 156]} label="trend" />)
    expect(container.querySelector('path')?.getAttribute('d')).toMatch(/^M2\.0,18\.0 L62\.0,2\.0$/)
    rerender(<Sparkline values={[150, null]} label="trend" />)
    expect(container.querySelector('svg')).toBeNull()
  })
})
