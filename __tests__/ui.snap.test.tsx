import React from 'react';
import renderer from 'react-test-renderer';
import TopBar from '../components/ui/TopBar';
import Button from '../components/ui/Button';
import Stat from '../components/ui/Stat';
import EmptyState from '../components/ui/EmptyState';
import { ThemeProvider as TokensThemeProvider, type ThemeMode } from '../theme';

function renderWithTheme(node: React.ReactNode, mode: ThemeMode) {
  return renderer.create(<TokensThemeProvider mode={mode}>{node}</TokensThemeProvider>).toJSON();
}

describe('UI snapshots', () => {
  const cases: Array<[string, React.ReactNode]> = [
    ['TopBar', <TopBar title="Title" />],
    ['Button', <Button title="Press" />],
    ['Stat', <Stat value="24" label="Runs" />],
    ['EmptyState', <EmptyState icon="image" title="Empty" body="Nothing here" />],
  ];

  const modes: ThemeMode[] = ['light', 'dark'];

  cases.forEach(([name, element]) => {
    modes.forEach((mode) => {
      it(`${name} renders in ${mode}`, () => {
        const tree = renderWithTheme(element, mode);
        expect(tree).toMatchSnapshot();
      });
    });
  });
});

