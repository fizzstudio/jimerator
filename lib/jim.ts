/* Jimerator
Copyright (C) 2025 Fizz Studio

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.*/

// * Prelude *

// Imports

import { AllSeriesData, strToId, Manifest,
  isPastryType } from "@fizz/paramanifest";
import { chartDataIsUnivalent, collectIndeps } from "./utils";

// Types

/**
 * @public
 */
export interface DataSelector {
  dom: string | string[];
  json: string | string[];
}

/**
 * @public
 */
export interface GroupSelector {
  group: true;
  name: string;
  note?: string;
  dom?: string;
  members?: string[];
}

/**
 * @public
 */
export type Selector = DataSelector | GroupSelector;

type SelectorSet = Selector;
type AxisOrientation = 'horiz' | 'vert';

// Helpers

export class JimError extends Error {
  constructor(msg: string) {
    super(`[jimifier]: ${msg}`);
  }
}

// * Main Class *
/**
 * @public
 */
export class Jimerator {

  private _manifest: Manifest;
  private _data: AllSeriesData;
  private _externalData?: AllSeriesData;
  private _indepKey: string;
  private _depKey: string;
  private _seriesDatapointDoms: Record<string, string[]> = {};

  constructor(manifest: Manifest, externalData?: AllSeriesData) {
    this._manifest = manifest;
    this._externalData = externalData;
    const dataset = this._manifest.jim.datasets[0];
    this._indepKey = Object.entries(dataset.facets)
      .filter(([_key, facet]) => facet.variableType === 'independent')
      .map(([key, _facet]) => key)[0]; // Assumes exactly 1 independent facet
    this._depKey = Object.entries(dataset.facets)
      .filter(([_key, facet]) => facet.variableType === 'dependent')
      .map(([key, _facet]) => key)[0]; // Assumes exactly 1 dependent facet
    if (this._indepKey === undefined || this._depKey === undefined) {
      throw new JimError('Manifest must have exactly one independent and one dependent facet');
    }
    if (!dataset.href) {
      this._data = {};
      for (const series of dataset.series) {
        this._data[series.key] = series.records!;
      }
    } else if (externalData) {
      if (this._manifest.jim.datasets.length === 1) {
        this._data = externalData;
      } else {
        this._data = {};
        for (const series of dataset.series) {
          if (externalData[series.key]) {
            this._data[series.key] = externalData[series.key];
          }
        }
      }
    } else {
      throw new JimError('JIM cannot be created without external or inline chart data');
    }
    (this._manifest.jim as any).selectors = this._renderSelectors();
    (this._manifest.jim as any).behaviors = this._renderBehaviors();
    (this._manifest.jim as any).version = { jim: '0.4.0' };
  }

  get manifest() {
    return this._manifest;
  }

  private _isMultiDataset(): boolean {
    return this._manifest.jim.datasets.length > 1;
  }

  private _datasetPath(datasetIndex: number): string {
    return `$.jim.datasets[${datasetIndex}]`;
  }

  private _datasetScopedKey(datasetIndex: number, key: string): string {
    return this._isMultiDataset() ? `dataset${datasetIndex}_${key}` : key;
  }

  private _datasetScopedDom(datasetIndex: number, id: string): string {
    return this._isMultiDataset() ? `#dataset-${datasetIndex}-${id}` : `#${id}`;
  }

  private _facetKeysForDataset(datasetIndex: number): { indepKey: string; depKey: string } {
    const dataset = this._manifest.jim.datasets[datasetIndex];
    if (!dataset) {
      throw new JimError(`Dataset index ${datasetIndex} not found`);
    }
    const indepKey = Object.entries(dataset.facets)
      .filter(([_key, facet]) => facet.variableType === 'independent')
      .map(([key, _facet]) => key)[0]; // Assumes exactly 1 independent facet
    const depKey = Object.entries(dataset.facets)
      .filter(([_key, facet]) => facet.variableType === 'dependent')
      .map(([key, _facet]) => key)[0]; // Assumes exactly 1 dependent facet
    if (indepKey === undefined || depKey === undefined) {
      throw new JimError(`Dataset ${datasetIndex} must have exactly one independent and one dependent facet`);
    }
    return { indepKey, depKey };
  }

  private _dataForDataset(datasetIndex: number): AllSeriesData {
    if (datasetIndex === 0) {
      return this._data;
    }

    const dataset = this._manifest.jim.datasets[datasetIndex];
    if (!dataset) {
      throw new JimError(`Dataset index ${datasetIndex} not found`);
    }
    if (!dataset.href) {
      const data: AllSeriesData = {};
      for (const series of dataset.series) {
        data[series.key] = series.records!;
      }
      return data;
    }
    if (!this._externalData) {
      throw new JimError('JIM cannot be created without external or inline chart data');
    }

    const data: AllSeriesData = {};
    for (const series of dataset.series) {
      if (this._externalData[series.key]) {
        data[series.key] = this._externalData[series.key];
      }
    }
    if (Object.keys(data).length === 0) {
      throw new JimError(`JIM cannot be created without external or inline chart data for dataset ${datasetIndex}`);
    }
    return data;
  }

  private _seriesKeys(): string[] {
    const dataset = this._manifest.jim.datasets[0];
    const manifestSeriesKeys = dataset.series
      .map(series => series.key)
      .filter(key => this._data[key]);
    const extraSeriesKeys = Object.keys(this._data)
      .filter(key => !manifestSeriesKeys.includes(key));
    return [...manifestSeriesKeys, ...extraSeriesKeys];
  }

  private _seriesGroupKey(seriesKey: string): string {
    return `seriesGroup_${strToId(seriesKey)}`;
  }

  private _legendItemId(seriesKey: string, datapointIndex?: number): string {
    const seriesId = strToId(seriesKey);
    return datapointIndex === undefined ? seriesId : `${seriesId}-${datapointIndex + 1}`;
  }

  private _legendItemGroupKey(seriesKey: string, datapointIndex?: number): string {
    return `legendItemGroup_${this._legendItemId(seriesKey, datapointIndex)}`;
  }

  private _legendItemDoms(seriesKey: string, datapointIndex?: number): string[] {
    const legendItemId = this._legendItemId(seriesKey, datapointIndex);
    return [
      `#legend-marker-${legendItemId}`,
      `#legend-symbol-${legendItemId}`,
      `#legend-label-${legendItemId}`
    ];
  }

  private _jsonPathProperty(parentPath: string, key: string): string {
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      return `${parentPath}.${key}`;
    }
    const escaped = key.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `${parentPath}['${escaped}']`;
  }

  private _facetPath(facetKey: string): string {
    return this._jsonPathProperty('$.jim.datasets[0].facets', facetKey);
  }

  private _facetKeyForAxis(orientation: AxisOrientation): string | undefined {
    const dataset = this._manifest.jim.datasets[0];
    if (isPastryType(dataset.representation.subtype)) {
      return undefined;
    }

    if (dataset.representation.subtype === 'bar') {
      return orientation === 'horiz' ? this._depKey : this._indepKey;
    }

    const displayOrientation = orientation === 'horiz' ? 'horizontal' : 'vertical';
    const displayOrientationShort = orientation === 'horiz' ? 'horiz' : 'vert';
    const axisFacetEntry = Object.entries(dataset.facets).find(([_key, facet]) => {
      const displayType = (facet as any).displayType;
      return displayType?.type === 'axis'
        && (displayType.orientation === displayOrientation
          || displayType.orientation === displayOrientationShort);
    });

    return axisFacetEntry?.[0] ?? (orientation === 'horiz' ? this._indepKey : this._depKey);
  }

  private _trackSeriesDatapointDom(seriesKey: string, dom: string): void {
    this._seriesDatapointDoms[seriesKey] ??= [];
    this._seriesDatapointDoms[seriesKey].push(dom);
  }

  private _chartGroupName(): string {
    const dataset = this._manifest.jim.datasets[0];
    return dataset.description || dataset.title;
  }

  private _seriesGroupName(seriesKey: string): string {
    const dataset = this._manifest.jim.datasets[0];
    const series = dataset.series.find(s => s.key === seriesKey) as typeof dataset.series[number] & { description?: string } | undefined;
    return series?.description || series?.label || seriesKey;
  }

  private _addChartHierarchyGroups(selectors: Record<string, SelectorSet>): void {
    const seriesKeys = this._seriesKeys()
      .filter(seriesKey => this._seriesDatapointDoms[seriesKey]?.length);
    if (seriesKeys.length < 2) {
      return;
    }

    const dataset = this._manifest.jim.datasets[0];
    const members = seriesKeys.map(seriesKey => this._seriesGroupKey(seriesKey));
    selectors.chartGroup = {
      group: true,
      name: this._chartGroupName(),
      note: dataset.title,
      members
    };

    for (const seriesKey of seriesKeys) {
      const seriesDom = [
        ...this._seriesDatapointDoms[seriesKey],
        ...this._legendItemDoms(seriesKey)
      ];
      selectors[this._seriesGroupKey(seriesKey)] = {
        group: true,
        name: this._seriesGroupName(seriesKey),
        dom: seriesDom.join(', ')
      };
    }
  }

  private _addLegendSelectors(selectors: Record<string, SelectorSet>): void {
    const dataset = this._manifest.jim.datasets[0];
    const legendGroups: string[] = [];

    if (isPastryType(dataset.representation.subtype)) {
      const seriesKey = Object.keys(this._data)[0];
      const seriesIndex = dataset.series.findIndex(series => series.key === seriesKey);
      if (seriesIndex === -1) {
        return;
      }

      this._data[seriesKey].forEach((_datapoint, pointIndex) => {
        const legendItemId = this._legendItemId(seriesKey, pointIndex);
        const recordPath = `$.jim.datasets[0].series[${seriesIndex}].records[${pointIndex}]`;
        selectors[`legendMarker_${legendItemId}`] = {
          dom: `#legend-marker-${legendItemId}`,
          json: `${recordPath}.*`
        };
        selectors[`legendSymbol_${legendItemId}`] = {
          dom: `#legend-symbol-${legendItemId}`,
          json: `${recordPath}.*`
        };
        selectors[`legendLabel_${legendItemId}`] = {
          dom: `#legend-label-${legendItemId}`,
          json: `${recordPath}.*`
        };

        const groupKey = this._legendItemGroupKey(seriesKey, pointIndex);
        selectors[groupKey] = {
          group: true,
          name: `${_datapoint[this._indepKey]} legend item`,
          dom: this._legendItemDoms(seriesKey, pointIndex).join(', ')
        };
        legendGroups.push(groupKey);
      });
    } else {
      for (const seriesKey of this._seriesKeys()) {
        const seriesIndex = dataset.series.findIndex(series => series.key === seriesKey);
        if (seriesIndex === -1) {
          continue;
        }

        const series = dataset.series[seriesIndex] as typeof dataset.series[number] & { label?: string };
        const legendItemId = this._legendItemId(seriesKey);
        const seriesPath = `$.jim.datasets[0].series[${seriesIndex}]`;
        const labelPath = series.label ? `${seriesPath}.label` : `${seriesPath}.key`;
        selectors[`legendMarker_${legendItemId}`] = {
          dom: `#legend-marker-${legendItemId}`,
          json: `${seriesPath}.key`
        };
        selectors[`legendSymbol_${legendItemId}`] = {
          dom: `#legend-symbol-${legendItemId}`,
          json: `${seriesPath}.key`
        };
        selectors[`legendLabel_${legendItemId}`] = {
          dom: `#legend-label-${legendItemId}`,
          json: labelPath
        };

        const groupKey = this._legendItemGroupKey(seriesKey);
        selectors[groupKey] = {
          group: true,
          name: `${this._seriesGroupName(seriesKey)} legend item`,
          dom: this._legendItemDoms(seriesKey).join(', ')
        };
        legendGroups.push(groupKey);
      }
    }

    if (legendGroups.length > 0) {
      selectors.legendGroup = {
        group: true,
        name: 'Legend',
        members: legendGroups
      };
    }
  }

  private _addAxisSelectors(selectors: Record<string, SelectorSet>): void {
    const dataset = this._manifest.jim.datasets[0];
    const axisGroups: string[] = [];

    for (const orientation of ['horiz', 'vert'] as const) {
      const facetKey = this._facetKeyForAxis(orientation);
      if (!facetKey) {
        continue;
      }

      const facet = dataset.facets[facetKey];
      const facetPath = this._facetPath(facetKey);
      const axisName = `${orientation === 'horiz' ? 'Horizontal' : 'Vertical'} axis: ${facet.label}`;

      selectors[`axis_${orientation}`] = {
        dom: `#${orientation}-axis`,
        json: facetPath
      };
      selectors[`axisTitle_${orientation}`] = {
        dom: `#axis-title-${orientation}`,
        json: `${facetPath}.label`
      };
      selectors[`axisLine_${orientation}`] = {
        dom: `#${orientation}-axis-line`,
        json: facetPath
      };
      selectors[`tickStrip_${orientation}`] = {
        dom: `#${orientation}-axis-tick-strip`,
        json: facetPath
      };

      const axisGroupKey = `axisGroup_${orientation}`;
      selectors[axisGroupKey] = {
        group: true,
        name: axisName,
        note: `Axis and labels for facet "${facetKey}"`,
        dom: `#${orientation}-axis, #${orientation}-axis *`
      };
      axisGroups.push(axisGroupKey);
    }

    if (axisGroups.length > 0) {
      selectors.axesGroup = {
        group: true,
        name: 'Axes',
        members: axisGroups
      };
    }
  }

  private _scopeDomToDataset(dom: string, datasetIndex: number): string {
    return this._datasetScopedDom(datasetIndex, dom.replace(/^#/, ''));
  }

  private _scopeFirstDatasetDatapointSelectors(selectors: Record<string, SelectorSet>): void {
    for (const selectorKey of Object.keys(selectors)) {
      if (!/^datapoint\d+$/.test(selectorKey)) {
        continue;
      }
      const selector = selectors[selectorKey] as DataSelector;
      if (typeof selector.dom === 'string') {
        selector.dom = this._scopeDomToDataset(selector.dom, 0);
      }
      selectors[`dataset0_${selectorKey}`] = selector;
    }

    for (const seriesKey of Object.keys(this._seriesDatapointDoms)) {
      this._seriesDatapointDoms[seriesKey] = this._seriesDatapointDoms[seriesKey]
        .map(dom => this._scopeDomToDataset(dom, 0));
    }
  }

  private _addSelectorsPastry(selectors: Record<string, SelectorSet>): void {
    const seriesKey = Object.keys(this._data)[0];
    this._data[seriesKey].forEach((datapoint, pointIndex) => {
      const indepSanitized = strToId(datapoint[this._indepKey]);
      const depSanitized = strToId(datapoint[this._depKey]);
      const dom = `#datapoint-${indepSanitized}_${depSanitized}_${strToId(seriesKey)}`;
      const selector: DataSelector = {
        dom,
        json: `$.jim.datasets[0].series[0].records[${pointIndex}].description`
      };
      selectors[`datapoint${pointIndex + 1}`] = selector;
      this._trackSeriesDatapointDom(seriesKey, dom);
    });
  }

  private _addSelectorsUnivalent(selectors: Record<string, SelectorSet>): void {
    let datapointIndex = 1;
    // FIXME: Assumes at least 1 series in data
    const indeps = Array.from(collectIndeps(this._data[Object.keys(this._data)[0]], this._indepKey));
    Object.keys(this._data).forEach((key, seriesIndex) => {
      indeps.forEach((indepValue, pointIndex) => {
        const dom = `#datapoint-${strToId(indepValue)}_${strToId(key)}`;
        const selector: DataSelector = {
          dom,
          "json": [
            `$.jim.datasets[0].series[${seriesIndex}].key`,
            `$.jim.datasets[0].series[${seriesIndex}].records[${pointIndex}].*`
          ]
        };
        selectors[`datapoint${datapointIndex}`] = selector;
        this._trackSeriesDatapointDom(key, dom);
        datapointIndex++;
      })
    });
  }

  private _addSelectorsMultivalent(selectors: Record<string, SelectorSet>): void {
    let datapointIndex = 1;
    Object.keys(this._data).forEach((key, seriesIndex) => {
      this._data[key].forEach((datapoint, pointIndex) => {
        const indepSanitized = strToId(datapoint[this._indepKey]);
        const depSanitized = strToId(datapoint[this._depKey]);
        const dom = `#datapoint-${indepSanitized}_${depSanitized}_${strToId(key)}`;
        const selector: DataSelector = {
          dom,
          json: [
            `$.jim.datasets[0].series[${seriesIndex}].key`,
            `$.jim.datasets[0].series[${seriesIndex}].records[${pointIndex}].*`
          ]
        };
        selectors[`datapoint${datapointIndex}`] = selector;
        this._trackSeriesDatapointDom(key, dom);
        datapointIndex++;
      })
    });
  }

  private _addDatasetDatapointSelectors(selectors: Record<string, SelectorSet>, datasetIndex: number): void {
    const dataset = this._manifest.jim.datasets[datasetIndex];
    const data = this._dataForDataset(datasetIndex);
    const { indepKey, depKey } = this._facetKeysForDataset(datasetIndex);
    const datasetSelectors: Record<string, SelectorSet> = {};
    const originalData = this._data;
    const originalIndepKey = this._indepKey;
    const originalDepKey = this._depKey;
    const originalSeriesDatapointDoms = this._seriesDatapointDoms;

    this._data = data;
    this._indepKey = indepKey;
    this._depKey = depKey;
    this._seriesDatapointDoms = {};
    try {
      if (isPastryType(dataset.representation.subtype)) {
        this._addSelectorsPastry(datasetSelectors);
      } else if (chartDataIsUnivalent(data, indepKey)) {
        this._addSelectorsUnivalent(datasetSelectors);
      } else {
        this._addSelectorsMultivalent(datasetSelectors);
      }
    } finally {
      this._data = originalData;
      this._indepKey = originalIndepKey;
      this._depKey = originalDepKey;
      this._seriesDatapointDoms = originalSeriesDatapointDoms;
    }

    const scopeJson = (json: string | string[]) => Array.isArray(json)
      ? json.map(path => path.replace('$.jim.datasets[0]', this._datasetPath(datasetIndex)))
      : json.replace('$.jim.datasets[0]', this._datasetPath(datasetIndex));
    for (const [selectorKey, selector] of Object.entries(datasetSelectors) as [string, DataSelector][]) {
      selector.dom = this._scopeDomToDataset(selector.dom as string, datasetIndex);
      selector.json = scopeJson(selector.json);
      selectors[this._datasetScopedKey(datasetIndex, selectorKey)] = selector;
    }
  }

  private _renderSelectors(): Record<string, SelectorSet> {
    this._seriesDatapointDoms = {};
    const selectors: Record<string, SelectorSet> = {
      chartTitle: {
        dom: "#chart-title",
        json: "$.jim.datasets[0].title"
      }
    }
    this._addAxisSelectors(selectors);
    if (isPastryType(this._manifest.jim.datasets[0].representation.subtype)) {
      this._addSelectorsPastry(selectors);
    } else if (chartDataIsUnivalent(this._data, this._indepKey)) {
      this._addSelectorsUnivalent(selectors);
    } else {
      this._addSelectorsMultivalent(selectors);
    }
    if (this._isMultiDataset()) {
      this._scopeFirstDatasetDatapointSelectors(selectors);
    }
    for (let datasetIndex = 1; datasetIndex < this._manifest.jim.datasets.length; datasetIndex++) {
      this._addDatasetDatapointSelectors(selectors, datasetIndex);
    }
    this._addLegendSelectors(selectors);
    this._addChartHierarchyGroups(selectors);
    return selectors;
  }

  public addSliceSummary(sliceIndex: number, summary: string): void;
  public addSliceSummary(datasetIndex: number, sliceIndex: number, summary: string): void;
  public addSliceSummary(datasetIndexOrSliceIndex: number, sliceIndexOrSummary: number | string, maybeSummary?: string): void {
    const datasetIndex = maybeSummary === undefined ? 0 : datasetIndexOrSliceIndex;
    const sliceIndex = maybeSummary === undefined ? datasetIndexOrSliceIndex : sliceIndexOrSummary as number;
    const summary = maybeSummary === undefined ? sliceIndexOrSummary as string : maybeSummary;
    this._manifest.jim.datasets[datasetIndex].series[0].records![sliceIndex].description = summary;
  }

  public addSeriesSummary(seriesKey: string, summary: string): void;
  public addSeriesSummary(datasetIndex: number, seriesKey: string, summary: string): void;
  public addSeriesSummary(datasetIndexOrSeriesKey: number | string, seriesKeyOrSummary: string, maybeSummary?: string): void {
    const datasetIndex = typeof datasetIndexOrSeriesKey === 'number' ? datasetIndexOrSeriesKey : 0;
    const seriesKey = typeof datasetIndexOrSeriesKey === 'number' ? seriesKeyOrSummary : datasetIndexOrSeriesKey;
    const summary = typeof datasetIndexOrSeriesKey === 'number' ? maybeSummary! : seriesKeyOrSummary;
    const dataset = this._manifest.jim.datasets[datasetIndex];
    if (!dataset) {
      throw new JimError(`Dataset index ${datasetIndex} not found`);
    }
    const seriesIndex = dataset.series.findIndex(s => s.key === seriesKey);
    if (seriesIndex === -1) {
      throw new JimError(`Series key "${seriesKey}" not found in dataset ${datasetIndex}`);
    }
    (dataset.series[seriesIndex] as any).description = summary;
    const selectorKey = this._datasetScopedKey(datasetIndex, `seriesSummary_${strToId(seriesKey)}`);
    (this._manifest.jim as any).selectors[selectorKey] = {
      dom: this._datasetScopedDom(datasetIndex, `series-${strToId(seriesKey)}`),
      json: `${this._datasetPath(datasetIndex)}.series[${seriesIndex}].description`
    };
    if (this._isMultiDataset() && datasetIndex === 0) {
      (this._manifest.jim as any).selectors[`seriesSummary_${strToId(seriesKey)}`] =
        (this._manifest.jim as any).selectors[selectorKey];
    }
    const groupSelector = (this._manifest.jim as any).selectors[this._seriesGroupKey(seriesKey)] as GroupSelector | undefined;
    if (datasetIndex === 0 && groupSelector?.group) {
      groupSelector.name = summary;
    }
  }

  private _renderBehaviors(): any[] {
    const behaviors: any[] = [];
    if (this._isMultiDataset()) {
      for (let datasetIndex = 0; datasetIndex < this._manifest.jim.datasets.length; datasetIndex++) {
        const dataset = this._manifest.jim.datasets[datasetIndex];
        const data = this._dataForDataset(datasetIndex);
        if (isPastryType(dataset.representation.subtype)) {
          const slices = data[Object.keys(data)[0]] ?? [];
          slices.forEach((_slice, sliceIndex) => {
            behaviors.push({
              target: {
                selector: `$.jim.selectors.${this._datasetScopedKey(datasetIndex, `datapoint${sliceIndex + 1}`)}`
              },
              enter: {
                haptic: {
                  durations: [0, 125, 125, 125, 125, 125, 125, 125],
                  repeatInterval: 125
                },
                audio: {
                  earcon: "PewPew",
                  repeat: "none"
                }
              }
            });
          });
        } else {
          Object.keys(data).forEach((seriesKey) => {
            behaviors.push({
              target: {
                selector: `$.jim.selectors.${this._datasetScopedKey(datasetIndex, `seriesSummary_${strToId(seriesKey)}`)}`
              },
              enter: {
                haptic: {
                  durations: [0, 125, 125, 125, 125, 125, 125, 125],
                  repeatInterval: 125
                },
                audio: {
                  earcon: "PewPew",
                  repeat: "none"
                }
              }
            });
          });
        }
      }
      return behaviors;
    }

    if (isPastryType(this._manifest.jim.datasets[0].representation.subtype)) {
      const slices = this._data[Object.keys(this._data)[0]];
      slices.forEach((_slice, sliceIndex) => {
        behaviors.push({
          target: {
            selector: `$.jim.selectors.datapoint${sliceIndex + 1}`
          },
          enter: {
            haptic: {
              durations: [0, 125, 125, 125, 125, 125, 125, 125],
              repeatInterval: 125
            },
            audio: {
              earcon: "PewPew",
              repeat: "none"
            }
          }
        });
      });
    } else {
      Object.keys(this._data).forEach((seriesKey, seriesIndex) => {
        behaviors.push({
          target: {
            selector: `$.jim.selectors.seriesSummary_${strToId(seriesKey)}`
          },
          enter: {
            haptic: {
              durations: [0, 125, 125, 125, 125, 125, 125, 125],
              repeatInterval: 125
            },
            audio: {
              earcon: "PewPew",
              repeat: "none"
            }
          }
        });
      });
    }
    return behaviors;
  }

}
