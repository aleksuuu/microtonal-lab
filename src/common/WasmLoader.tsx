export async function loadWasmModule(path: string) {
  const response = await fetch(path);
  const buffer = await response.arrayBuffer();
  const wasmModule = await WebAssembly.instantiate(buffer);
  return wasmModule.instance.exports;
}
