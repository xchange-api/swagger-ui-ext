export function createObjectURL(arrayBuffer: ArrayBuffer, type: string) {
  return URL.createObjectURL(new Blob([arrayBuffer], { type: type }));
}
