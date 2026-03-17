export function generateBarcode() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `TCB-${random}`;
}

