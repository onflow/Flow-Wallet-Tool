export function arrToStringArr(arr: Uint8Array[]): string[] {
  return arr.map((a: Uint8Array | Uint8Array[]) => {
    if (Array.isArray(a)) {
      return arrToStringArr(a) as unknown as string;
    }
    const result = withPrefix(Buffer.from(a).toString('hex'));
    return result || '';
  });
}

export function sansPrefix(address: string): string | null {
  if (address == null) return null;
  return address.replace(/^0x/, '').replace(/^Fx/, '');
}

export function withPrefix(address: string): string | null {
  if (address == null) return null;
  return '0x' + sansPrefix(address);
}

export function hexToUtf8(hex: string): string {
  const hexStr = sansPrefix(hex);
  if (!hexStr) return '';
  return new TextDecoder().decode(Buffer.from(hexStr, 'hex'));
}

export function hexToInt(hex: string): number {
  return parseInt(hex, 16);
}

export function removeFlowTag(address: string): string | null {
  if (address == null) return null;
  return address.replace(
    /^464c4f572d56302e302d7472616e73616374696f6e0000000000000000000000/,
    '',
  );
} 