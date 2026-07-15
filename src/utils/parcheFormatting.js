export const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') {
    return '0'
  }

  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 2,
  }).format(Number(value))
}

export const formatDate = (value) => {
  if (!value) {
    return '—'
  }

  const normalizedValue = value.includes('T') ? value.split('T')[0] : value
  const [year, month, day] = normalizedValue.split('-')

  return `${day}/${month}/${year}`
}

export const buildEventPayload = ({
  name,
  totalAmount,
  splitType,
  responsibleId,
  participantIds,
  customAmounts,
  currentUserId,
}) => {
  const payload = {
    name,
    total_amount: totalAmount,
    split_type: splitType,
    responsible_id: responsibleId || null,
    participant_ids: participantIds.length > 0 ? participantIds : [currentUserId],
  }

  if (splitType === 'custom') {
    payload.custom_amounts = customAmounts
  }

  return payload
}
