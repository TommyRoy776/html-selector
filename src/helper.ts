export function getTagAtCursor(line: string, char: number) {
  const start = line.lastIndexOf("<", char);
  const end = line.indexOf(">", char);

  if (start === -1 || end === -1) return null;

  return line.slice(start, end + 1);
}