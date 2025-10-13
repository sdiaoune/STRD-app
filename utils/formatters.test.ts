import { formatDistance, formatDuration, formatPace } from './formatters';

test('formatDistance meters and km', () => {
  expect(formatDistance(340)).toBe('340 m');
  expect(formatDistance(1000)).toBe('1 km');
  expect(formatDistance(1340)).toBe('1.34 km');
});

test('formatDuration minutes', () => {
  expect(formatDuration(0)).toBe('0 min');
  expect(formatDuration(60)).toBe('1 min');
  expect(formatDuration(125)).toBe('2 min');
});

test('formatPace mm:ss/km', () => {
  expect(formatPace(402)).toBe('6:42/km');
  expect(formatPace(360)).toBe('6:00/km');
});

