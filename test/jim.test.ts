import { describe, expect, test } from 'vitest';
import { strToId, type Manifest } from '@fizz/paramanifest';
import { Jimerator, type GroupSelector } from '../lib';

function multiSeriesManifest(): Manifest {
  return {
    jim: {
      datasets: [
        {
          representation: {
            type: 'chart',
            subtype: 'line'
          },
          title: 'Revenue by quarter',
          description: 'Full chart description for revenue by quarter.',
          facets: {
            x: {
              label: 'Quarter',
              variableType: 'independent',
              measure: 'ordinal',
              datatype: 'string',
              displayType: {
                type: 'axis',
                orientation: 'horizontal'
              }
            },
            y: {
              label: 'Revenue',
              variableType: 'dependent',
              measure: 'ratio',
              datatype: 'number',
              displayType: {
                type: 'axis',
                orientation: 'vertical'
              }
            }
          },
          series: [
            {
              key: 'North Region',
              label: 'North',
              description: 'North region series description.',
              records: [
                { x: 'Q1', y: '10' },
                { x: 'Q2', y: '12' }
              ]
            } as any,
            {
              key: 'South Region',
              label: 'South',
              records: [
                { x: 'Q1', y: '8' },
                { x: 'Q2', y: '15' }
              ]
            }
          ]
        }
      ]
    }
  };
}

function singleSeriesManifest(): Manifest {
  const manifest = multiSeriesManifest();
  manifest.jim.datasets[0].series = [manifest.jim.datasets[0].series[0]];
  return manifest;
}

describe('Jimerator group selectors', () => {
  test('adds a chart group with series groups containing datapoints', () => {
    const manifest = multiSeriesManifest();
    const jimerator = new Jimerator(manifest);
    const selectors = (jimerator.manifest.jim as any).selectors;

    const northGroupKey = `seriesGroup_${strToId('North Region')}`;
    const southGroupKey = `seriesGroup_${strToId('South Region')}`;

    expect(selectors.chartGroup).toEqual({
      group: true,
      name: 'Full chart description for revenue by quarter.',
      note: 'Revenue by quarter',
      members: [northGroupKey, southGroupKey]
    });

    const northGroup = selectors[northGroupKey] as GroupSelector;
    const southGroup = selectors[southGroupKey] as GroupSelector;

    expect(selectors.datapoint1.json).toEqual([
      '$.jim.datasets[0].series[0].key',
      '$.jim.datasets[0].series[0].records[0].*'
    ]);
    expect(selectors.datapoint2.json).toEqual([
      '$.jim.datasets[0].series[0].key',
      '$.jim.datasets[0].series[0].records[1].*'
    ]);

    expect(northGroup).toEqual({
      group: true,
      name: 'North region series description.',
      dom: [selectors.datapoint1.dom, selectors.datapoint2.dom].join(', ')
    });
    expect(southGroup).toEqual({
      group: true,
      name: 'South',
      dom: [selectors.datapoint3.dom, selectors.datapoint4.dom].join(', ')
    });
  });

  test('updates the series group name when a generated series summary is added', () => {
    const jimerator = new Jimerator(multiSeriesManifest());
    const selectors = (jimerator.manifest.jim as any).selectors;
    const southGroupKey = `seriesGroup_${strToId('South Region')}`;

    jimerator.addSeriesSummary('South Region', 'Generated South region summary.');

    expect(selectors[southGroupKey].name).toBe('Generated South region summary.');
    expect((jimerator.manifest.jim.datasets[0].series[1] as any).description)
      .toBe('Generated South region summary.');
  });

  test('does not add chart hierarchy groups for a single-series chart', () => {
    const jimerator = new Jimerator(singleSeriesManifest());
    const selectors = (jimerator.manifest.jim as any).selectors;

    expect(selectors.chartGroup).toBeUndefined();
    expect(selectors[`seriesGroup_${strToId('North Region')}`]).toBeUndefined();
  });
});
