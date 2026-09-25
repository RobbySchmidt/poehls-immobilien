export function fileId(source, kokenId) {
  return `${source === 'grandtower' ? 'gt' : 'm'}-${kokenId}`
}
