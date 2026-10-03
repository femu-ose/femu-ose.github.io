// Match femu_realize(): 10% over-provisioning, one namespace, 512-byte alignment.
// The product rawBytes * 100 can exceed Number's exact integer range even when
// rawBytes itself is safe. Keep intermediate arithmetic integral.
export function exposedBytes(rawBytes) {
  return Number((BigInt(rawBytes) * 100n / 110n / 512n) * 512n);
}
