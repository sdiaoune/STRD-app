import React from 'react';
import renderer from 'react-test-renderer';
import TopBar from '../components/ui/TopBar';
import Button from '../components/ui/Button';
import Stat from '../components/ui/Stat';
import EmptyState from '../components/ui/EmptyState';

describe('UI snapshots', () => {
  it('TopBar renders', () => {
    const tree = renderer.create(<TopBar title="Title" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('Button renders', () => {
    const tree = renderer.create(<Button title="Press" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('Stat renders', () => {
    const tree = renderer.create(<Stat value="24" label="Runs" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('EmptyState renders', () => {
    const tree = renderer.create(<EmptyState icon="image" title="Empty" body="Nothing here" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});

