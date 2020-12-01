import Table from '../Table/Table';

export default function generatePass(size = 4, count = 20) {
  let counter = count;
  const start = Array.from(new Array((size ** 2) - 1), (val, index) => index + 1);
  start.push(0);

  const matrix = [];

  for (let i = 0; i < size; i += 1) {
    matrix.push(start.slice(i * size, (i + 1) * size));
  }

  let result = new Table(matrix);

  while (counter > 0) {
    const next = result.getNextStages();
    const rand = Math.floor(Math.random() * next.length);
    result = next[rand];
    counter -= 1;
  }
  return result;
}
