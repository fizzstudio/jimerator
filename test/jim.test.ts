import { describe, expect, test } from 'vitest';
import { strToId, type Manifest } from '@fizz/chartsignal-internal';
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

function multiDatasetManifest(): Manifest {
  const manifest = multiSeriesManifest();
  manifest.jim.datasets.push({
    representation: {
      type: 'chart',
      subtype: 'bar'
    },
    title: 'Enrollment by quarter',
    description: 'Full chart description for enrollment by quarter.',
    facets: {
      x: {
        label: 'Quarter',
        variableType: 'independent',
        measure: 'ordinal',
        datatype: 'string',
        displayType: {
          type: 'axis',
          orientation: 'vertical'
        }
      },
      y: {
        label: 'Enrollment',
        variableType: 'dependent',
        measure: 'ratio',
        datatype: 'number',
        displayType: {
          type: 'axis',
          orientation: 'horizontal'
        }
      }
    },
    series: [
      {
        key: 'North Region',
        label: 'North enrollment',
        records: [
          { x: 'Q1', y: '30' },
          { x: 'Q2', y: '34' }
        ]
      },
      {
        key: 'South Region',
        label: 'South enrollment',
        records: [
          { x: 'Q1', y: '25' },
          { x: 'Q2', y: '31' }
        ]
      }
    ]
  });
  return manifest;
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

  test('adds dataset-scoped datapoint selectors for multi-dataset manifests', () => {
    const jimerator = new Jimerator(multiDatasetManifest());
    const selectors = (jimerator.manifest.jim as any).selectors;

    expect(selectors.chartTitle as DataSelector).toEqual({
      dom: '#chart-title',
      json: '$.jim.datasets[0].title'
    });
    expect(selectors.dataset0_chartTitle).toBeUndefined();
    expect(selectors.dataset1_chartTitle).toBeUndefined();

    expect(selectors.axis_horiz.json).toBe('$.jim.datasets[0].facets.x');
    expect(selectors.dataset0_axis_horiz).toBeUndefined();
    expect(selectors.dataset1_axis_horiz).toBeUndefined();

    expect(selectors.dataset0_datapoint1 as DataSelector).toEqual({
      dom: '#dataset-0-datapoint-q1_north_region',
      json: [
        '$.jim.datasets[0].series[0].key',
        '$.jim.datasets[0].series[0].records[0].*'
      ]
    });
    expect(selectors.datapoint1).toBe(selectors.dataset0_datapoint1);
    expect(selectors.dataset1_datapoint1 as DataSelector).toEqual({
      dom: '#dataset-1-datapoint-q1_north_region',
      json: [
        '$.jim.datasets[1].series[0].key',
        '$.jim.datasets[1].series[0].records[0].*'
      ]
    });
    expect(selectors.dataset0_datapoint1.dom).not.toBe(selectors.dataset1_datapoint1.dom);

    expect(selectors.legendMarker_north_region as DataSelector).toEqual({
      dom: '#legend-marker-north_region',
      json: '$.jim.datasets[0].series[0].key'
    });
    expect(selectors.dataset1_legendMarker_north_region).toBeUndefined();
    expect(selectors.datasetGroup0).toBeUndefined();
    expect(selectors.datasetGroup1).toBeUndefined();
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
      dom: [
        selectors.datapoint1.dom,
        selectors.datapoint2.dom,
        '#legend-marker-north_region',
        '#legend-symbol-north_region',
        '#legend-label-north_region'
      ].join(', ')
    });
    expect(southGroup).toEqual({
      group: true,
      name: 'South',
      dom: [
        selectors.datapoint3.dom,
        selectors.datapoint4.dom,
        '#legend-marker-south_region',
        '#legend-symbol-south_region',
        '#legend-label-south_region'
      ].join(', ')
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

  test('adds a generated series summary to a selected dataset', () => {
    const jimerator = new Jimerator(multiDatasetManifest());
    const selectors = (jimerator.manifest.jim as any).selectors;
    const northGroupKey = `seriesGroup_${strToId('North Region')}`;

    jimerator.addSeriesSummary(1, 'North Region', 'Generated enrollment summary.');

    expect((jimerator.manifest.jim.datasets[0].series[0] as any).description)
      .toBe('North region series description.');
    expect((jimerator.manifest.jim.datasets[1].series[0] as any).description)
      .toBe('Generated enrollment summary.');
    expect(selectors.dataset1_seriesSummary_north_region as DataSelector).toEqual({
      dom: '#dataset-1-series-north_region',
      json: '$.jim.datasets[1].series[0].description'
    });
    expect(selectors.seriesSummary_north_region).toBeUndefined();
    expect((selectors[northGroupKey] as GroupSelector).name)
      .toBe('North region series description.');
  });

  test('adds a generated series summary to the first dataset in a multi-dataset manifest', () => {
    const jimerator = new Jimerator(multiDatasetManifest());
    const selectors = (jimerator.manifest.jim as any).selectors;
    const southGroupKey = `seriesGroup_${strToId('South Region')}`;

    jimerator.addSeriesSummary(0, 'South Region', 'Generated first dataset summary.');

    expect((jimerator.manifest.jim.datasets[0].series[1] as any).description)
      .toBe('Generated first dataset summary.');
    expect((jimerator.manifest.jim.datasets[1].series[1] as any).description)
      .toBeUndefined();
    expect(selectors.dataset0_seriesSummary_south_region as DataSelector).toEqual({
      dom: '#dataset-0-series-south_region',
      json: '$.jim.datasets[0].series[1].description'
    });
    expect(selectors.seriesSummary_south_region).toBe(selectors.dataset0_seriesSummary_south_region);
    expect((selectors[southGroupKey] as GroupSelector).name)
      .toBe('Generated first dataset summary.');
  });

  test('adds a generated series summary to a second-dataset-only series', () => {
    const manifest = multiDatasetManifest();
    manifest.jim.datasets[1].series[0].key = 'Enrollment North';
    manifest.jim.datasets[1].series[1].key = 'Enrollment South';
    const jimerator = new Jimerator(manifest);
    const selectors = (jimerator.manifest.jim as any).selectors;

    expect(() => jimerator.addSeriesSummary(1, 'Enrollment North', 'Generated enrollment summary.'))
      .not.toThrow();

    expect((jimerator.manifest.jim.datasets[1].series[0] as any).description)
      .toBe('Generated enrollment summary.');
    expect(selectors.dataset1_seriesSummary_enrollment_north as DataSelector).toEqual({
      dom: '#dataset-1-series-enrollment_north',
      json: '$.jim.datasets[1].series[0].description'
    });
    expect(selectors.seriesGroup_enrollment_north).toBeUndefined();
    expect(selectors.legendMarker_enrollment_north).toBeUndefined();
  });

  test('does not add chart hierarchy groups for a single-series chart', () => {
    const jimerator = new Jimerator(singleSeriesManifest());
    const selectors = (jimerator.manifest.jim as any).selectors;

    expect(selectors.chartGroup).toBeUndefined();
    expect(selectors[`seriesGroup_${strToId('North Region')}`]).toBeUndefined();
  });
});

describe('Jimerator legend selectors', () => {
  test('adds legend selectors and groups for series legend items', () => {
    const jimerator = new Jimerator(multiSeriesManifest());
    const selectors = (jimerator.manifest.jim as any).selectors;

    expect(selectors.legendMarker_north_region as DataSelector).toEqual({
      dom: '#legend-marker-north_region',
      json: '$.jim.datasets[0].series[0].key'
    });
    expect(selectors.legendSymbol_north_region as DataSelector).toEqual({
      dom: '#legend-symbol-north_region',
      json: '$.jim.datasets[0].series[0].key'
    });
    expect(selectors.legendLabel_north_region as DataSelector).toEqual({
      dom: '#legend-label-north_region',
      json: '$.jim.datasets[0].series[0].label'
    });
    expect(selectors.legendItemGroup_north_region as GroupSelector).toEqual({
      group: true,
      name: 'North region series description. legend item',
      dom: '#legend-marker-north_region, #legend-symbol-north_region, #legend-label-north_region'
    });
    expect(selectors.legendGroup as GroupSelector).toEqual({
      group: true,
      name: 'Legend',
      members: ['legendItemGroup_north_region', 'legendItemGroup_south_region']
    });
  });

  test('adds legend selectors and groups for pastry slice legend items', () => {
    const jimerator = new Jimerator(pastryManifest());
    const selectors = (jimerator.manifest.jim as any).selectors;

    expect(selectors['legendMarker_matter-1'] as DataSelector).toEqual({
      dom: '#legend-marker-matter-1',
      json: '$.jim.datasets[0].series[0].records[0].*'
    });
    expect(selectors['legendSymbol_matter-1'] as DataSelector).toEqual({
      dom: '#legend-symbol-matter-1',
      json: '$.jim.datasets[0].series[0].records[0].*'
    });
    expect(selectors['legendLabel_matter-1'] as DataSelector).toEqual({
      dom: '#legend-label-matter-1',
      json: '$.jim.datasets[0].series[0].records[0].*'
    });
    expect(selectors['legendItemGroup_matter-1'] as GroupSelector).toEqual({
      group: true,
      name: 'Dark matter legend item',
      dom: '#legend-marker-matter-1, #legend-symbol-matter-1, #legend-label-matter-1'
    });
    expect(selectors.legendGroup as GroupSelector).toEqual({
      group: true,
      name: 'Legend',
      members: ['legendItemGroup_matter-1', 'legendItemGroup_matter-2']
    });
  });
});

describe('Jimerator selector conformance', () => {
  test('emits selector-string keys with dom and json mappings for data selectors', () => {
    const jimerator = new Jimerator(multiDatasetManifest());
    jimerator.addSeriesSummary(1, 'North Region', 'Generated enrollment summary.');
    const selectors = (jimerator.manifest.jim as any).selectors;

    for (const [selectorKey, selector] of Object.entries(selectors) as [string, any][]) {
      expect(selectorKey).toMatch(/^[A-Za-z0-9_-]+$/);
      if (selector.group) {
        continue;
      }
      expect(selector.dom).toBeDefined();
      expect(selector.json).toBeDefined();
    }
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

  test('uses dataset-scoped selector paths for multi-dataset behaviors', () => {
    const jimerator = new Jimerator(multiDatasetManifest());
    const behaviors = (jimerator.manifest.jim as any).behaviors;

    expect(behaviors.map((behavior: any) => behavior.target.selector)).toEqual([
      '$.jim.selectors.dataset0_seriesSummary_north_region',
      '$.jim.selectors.dataset0_seriesSummary_south_region',
      '$.jim.selectors.dataset1_seriesSummary_north_region',
      '$.jim.selectors.dataset1_seriesSummary_south_region'
    ]);
  });
});
