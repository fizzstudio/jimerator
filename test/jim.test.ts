import { describe, expect, test } from 'vitest';
import { strToId, type Manifest } from '@fizz/paramanifest';
import { Jimerator, type DataSelector, type GroupSelector } from '../lib';

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

function barManifest(): Manifest {
  const manifest = multiSeriesManifest();
  manifest.jim.datasets[0].representation.subtype = 'bar';
  return manifest;
}

function pastryManifest(): Manifest {
  return {
    jim: {
      datasets: [
        {
          representation: {
            type: 'chart',
            subtype: 'pie'
          },
          title: 'Matter distribution',
          facets: {
            x: {
              label: 'Matter type',
              variableType: 'independent',
              measure: 'nominal',
              datatype: 'string',
              displayType: {
                type: 'marking'
              }
            },
            y: {
              label: 'Percent',
              variableType: 'dependent',
              measure: 'ratio',
              datatype: 'number',
              displayType: {
                type: 'angle'
              }
            }
          },
          series: [
            {
              key: 'matter',
              records: [
                { x: 'Dark matter', y: '27', description: 'Dark matter: 27%' },
                { x: 'Ordinary matter', y: '5', description: 'Ordinary matter: 5%' }
              ]
            }
          ]
        }
      ]
    }
  };
}

describe('Jimerator axis selectors', () => {
  test('adds selectors and groups for plane chart axes', () => {
    const jimerator = new Jimerator(multiSeriesManifest());
    const selectors = (jimerator.manifest.jim as any).selectors;

    expect(selectors.axis_horiz as DataSelector).toEqual({
      dom: '#horiz-axis',
      json: '$.jim.datasets[0].facets.x'
    });
    expect(selectors.axisTitle_horiz as DataSelector).toEqual({
      dom: '#axis-title-horiz',
      json: '$.jim.datasets[0].facets.x.label'
    });
    expect(selectors.axisLine_horiz as DataSelector).toEqual({
      dom: '#horiz-axis-line',
      json: '$.jim.datasets[0].facets.x'
    });
    expect(selectors.tickStrip_horiz as DataSelector).toEqual({
      dom: '#horiz-axis-tick-strip',
      json: '$.jim.datasets[0].facets.x'
    });
    expect(selectors.axis_vert as DataSelector).toEqual({
      dom: '#vert-axis',
      json: '$.jim.datasets[0].facets.y'
    });
    expect(selectors.axisTitle_vert as DataSelector).toEqual({
      dom: '#axis-title-vert',
      json: '$.jim.datasets[0].facets.y.label'
    });

    expect(selectors.axisGroup_horiz as GroupSelector).toEqual({
      group: true,
      name: 'Horizontal axis: Quarter',
      note: 'Axis and labels for facet "x"',
      dom: '#horiz-axis, #horiz-axis *'
    });
    expect(selectors.axisGroup_vert as GroupSelector).toEqual({
      group: true,
      name: 'Vertical axis: Revenue',
      note: 'Axis and labels for facet "y"',
      dom: '#vert-axis, #vert-axis *'
    });
    expect(selectors.axesGroup as GroupSelector).toEqual({
      group: true,
      name: 'Axes',
      members: ['axisGroup_horiz', 'axisGroup_vert']
    });
  });

  test('maps horizontal bar axes to ParaCharts rendered orientation', () => {
    const jimerator = new Jimerator(barManifest());
    const selectors = (jimerator.manifest.jim as any).selectors;

    expect(selectors.axis_horiz.json).toBe('$.jim.datasets[0].facets.y');
    expect(selectors.axisTitle_horiz.json).toBe('$.jim.datasets[0].facets.y.label');
    expect(selectors.axisGroup_horiz.name).toBe('Horizontal axis: Revenue');
    expect(selectors.axis_vert.json).toBe('$.jim.datasets[0].facets.x');
    expect(selectors.axisTitle_vert.json).toBe('$.jim.datasets[0].facets.x.label');
    expect(selectors.axisGroup_vert.name).toBe('Vertical axis: Quarter');
  });

  test('does not add axis selectors for pastry charts', () => {
    const jimerator = new Jimerator(pastryManifest());
    const selectors = (jimerator.manifest.jim as any).selectors;

    expect(selectors.axis_horiz).toBeUndefined();
    expect(selectors.axis_vert).toBeUndefined();
    expect(selectors.axesGroup).toBeUndefined();
  });
});

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

describe('Jimerator behavior selector references', () => {
  test('uses enveloped selector paths for plane chart behaviors', () => {
    const jimerator = new Jimerator(multiSeriesManifest());
    const behaviors = (jimerator.manifest.jim as any).behaviors;

    expect(behaviors[0].target.selector).toBe('$.jim.selectors.seriesSummary_north_region');
    expect(behaviors[1].target.selector).toBe('$.jim.selectors.seriesSummary_south_region');
  });

  test('uses enveloped selector paths for pastry chart behaviors', () => {
    const jimerator = new Jimerator(pastryManifest());
    const behaviors = (jimerator.manifest.jim as any).behaviors;

    expect(behaviors[0].target.selector).toBe('$.jim.selectors.datapoint1');
    expect(behaviors[1].target.selector).toBe('$.jim.selectors.datapoint2');
  });
});
