export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  E_WALLET = 'e_wallet',
  QRIS = 'qris',
  CREDIT_CARD = 'credit_card',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  EXPIRED = 'expired',
  REFUNDED = 'refunded',
}
