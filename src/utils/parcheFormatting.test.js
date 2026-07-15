import { buildEventPayload, formatCurrency, formatDate } from './parcheFormatting'

describe('parcheFormatting', () => {
  it('formats currency values with Colombian separators', () => {
    expect(formatCurrency(1250.5)).toBe('1.250,5')
    expect(formatCurrency('')).toBe('0')
  })

  it('formats dates from YYYY-MM-DD to DD/MM/YYYY', () => {
    expect(formatDate('2024-01-02')).toBe('02/01/2024')
    expect(formatDate('')).toBe('—')
  })

  it('builds the event payload with the current user when no participants are selected', () => {
    const payload = buildEventPayload({
      name: 'Dinner',
      totalAmount: '100',
      splitType: 'equal',
      responsibleId: '2',
      participantIds: [],
      customAmounts: {},
      currentUserId: 7,
    })

    expect(payload).toEqual({
      name: 'Dinner',
      total_amount: '100',
      split_type: 'equal',
      responsible_id: '2',
      participant_ids: [7],
    })
  })
})
