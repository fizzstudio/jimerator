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
  private _indepKey: string;
  private _depKey: string;
  private _seriesDatapointDoms: Record<string, string[]> = {};

  constructor(manifest: Manifest, externalData?: AllSeriesData) {
    this._manifest = manifest;
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
      this._data = externalData;
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
      selectors[this._seriesGroupKey(seriesKey)] = {
        group: true,
        name: this._seriesGroupName(seriesKey),
        dom: this._seriesDatapointDoms[seriesKey].join(', ')
      };
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

  private _renderSelectors(): Record<string, SelectorSet> {
    this._seriesDatapointDoms = {};
    const selectors: Record<string, SelectorSet> = {
      chartTitle: {
        dom: "#chart-title",
        json: "$.jim.datasets[0].title"
      }
    }
    if (isPastryType(this._manifest.jim.datasets[0].representation.subtype)) {
      this._addSelectorsPastry(selectors);
    } else if (chartDataIsUnivalent(this._data, this._indepKey)) {
      this._addSelectorsUnivalent(selectors);
    } else {
      this._addSelectorsMultivalent(selectors);
    }
    this._addChartHierarchyGroups(selectors);
    return selectors;
  }

  public addSliceSummary(sliceIndex: number, summary: string) {
    this._manifest.jim.datasets[0].series[0].records![sliceIndex].description = summary;
  }

  public addSeriesSummary(seriesKey: string, summary: string) {
    const seriesIndex = this._manifest.jim.datasets[0].series.findIndex(s => s.key === seriesKey);
    if (seriesIndex === -1) {
      throw new JimError(`Series key "${seriesKey}" not found`);
    }
    (this._manifest.jim.datasets[0].series[seriesIndex] as any).description = summary;
    const selectorKey = `seriesSummary_${strToId(seriesKey)}`;
    (this._manifest.jim as any).selectors[selectorKey] = {
      dom: `#series-${strToId(seriesKey)}`,
      json: `$.jim.datasets[0].series[${seriesIndex}].description`
    };
    const groupSelector = (this._manifest.jim as any).selectors[this._seriesGroupKey(seriesKey)] as GroupSelector | undefined;
    if (groupSelector?.group) {
      groupSelector.name = summary;
    }
  }

  private _renderBehaviors(): any[] {
    const behaviors: any[] = [];
    if (isPastryType(this._manifest.jim.datasets[0].representation.subtype)) {
      const slices = this._data[Object.keys(this._data)[0]];
      slices.forEach((_slice, sliceIndex) => {
        behaviors.push({
          target: {
            selector: `$.selectors.datapoint${sliceIndex + 1}`
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
            selector: `$.selectors.seriesSummary_${strToId(seriesKey)}`
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
