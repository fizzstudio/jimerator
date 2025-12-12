/* Jimerator
Copyright (C) 2025 Fizz Studios

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

import { ChartType, AllSeriesData, dataFromManifest, strToId, DatapointManifest, Manifest, 
  Dataset as ManifestDataset } from "@fizz/paramanifest";
import { chartDataIsUnivalent, collectIndeps } from "./utils";

// Types

export interface Jim {
  datasets: Dataset[];
  selectors: Record<string, Selector>;
  behaviors: any[];
  version: { jim: string };
}

export interface Dataset {
  title: string;
  subtitle?: string;
  source?: Source;
  facets: {[key: string]: Facet};
  series: Series[];
  href?: Href;
}

export interface Source {
  url: string;
  name: string;
}

export interface Facet {
  label: string;
  variableType?: 'independent' | 'dependent';
}

type SeriesType = 'row' | 'column' | 'line' | 'other';

export interface Series {
  name: string;
  type: SeriesType;
  records: DatapointManifest[];
  description?: string;
}

export interface Href {
  url: string;
  format: 'csv' | 'json';
  type: 'extendedDataset';
}

export interface Selector {
  dom: string | string[];
  json: string | string[];
}

// Helpers

const CHART_TYPE_MAP: Record<ChartType, SeriesType> = {
  bar: 'column',
  column: 'column',
  lollipop: 'column',
  histogram: 'column',
  waterfall: 'column',
  line: 'line',
  stepline: 'line',
  graph: 'line',
  scatter: 'other',
  heatmap: 'other',
  pie: 'other',
  donut: 'other',
  venn: 'other'
}

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

  private _jim!: Jim;
  private _dataset: ManifestDataset;
  private _data: AllSeriesData;
  private _seriesKeys: string[];
  private _indepKey: string;
  private _depKey: string;

  constructor(private _manifest: Manifest, externalData?: AllSeriesData) {
    this._dataset = this._manifest.datasets[0];
    this._indepKey = Object.entries(this._dataset.facets)
      .filter(([_key, facet]) => facet.variableType === 'independent')
      .map(([key, _facet]) => key)[0]; // Assumes exactly 1 independent key
    this._depKey = Object.entries(this._dataset.facets)
      .filter(([_key, facet]) => facet.variableType === 'dependent')
      .map(([key, _facet]) => key)[0]; // Assumes exactly 1 dependent key
    if (this._dataset.data.source === 'inline') {
      this._data = dataFromManifest(this._manifest);
    } else if (externalData) {
      this._data = externalData;
    } else {
      throw new JimError('JIM cannot be created without external or inline chart data');
    }
    this._seriesKeys = Object.keys(this._data);
  }

  get jim() {
    return this._jim;
  }

  private _addSelectorsUnivalent(selectors: Record<string, Selector>): void {
    let datapointIndex = 1;
    // FIXME: Assumes at least 1 series in data
    const indeps = collectIndeps(this._data[this._seriesKeys[0]], this._indepKey);
    this._seriesKeys.forEach((key, seriesIndex) => {
      indeps.forEach((indepValue, pointIndex) => {
        selectors[`datapoint${datapointIndex}`] = {
          "dom": `#datapoint-${strToId(indepValue)}_${strToId(key)}`,
          "json": [
            `$.datasets[0].series[${seriesIndex}].name`,
            `$.datasets[0].series[${seriesIndex}].records[${pointIndex}].*`
          ]
        };
        datapointIndex++;
      })
    });
  }

  private _addSelectorsMultivalent(selectors: Record<string, Selector>): void {
    let datapointIndex = 1;
    Object.keys(this._data).forEach((key, seriesIndex) => {
      this._data[key].forEach((datapoint, pointIndex) => {
        const indepSanitized = strToId(datapoint[this._indepKey]);
        const depSanitized = strToId(datapoint[this._depKey]);
        selectors[`datapoint${datapointIndex}`] = {
          dom: `#datapoint-${indepSanitized}_${depSanitized}_${strToId(key)}`,
          json: [
            `$.datasets[0].series[${seriesIndex}].name`,
            `$.datasets[0].series[${seriesIndex}].records[${pointIndex}].*`
          ]
        };
        datapointIndex++;
      })
    });
  }

  private _renderSelectors(): Record<string, Selector> {
    const selectors: Record<string, Selector> = {
      chartTitle: {
        dom: "#chart-title",
        json: "$.datasets[0].title"
      }
    }
    if (chartDataIsUnivalent(this._data, this._indepKey)) {
      this._addSelectorsUnivalent(selectors);
    } else {
      this._addSelectorsMultivalent(selectors);
    }
    return selectors;
  }

  public render() {
    const dataset: Dataset = {
      title: this._dataset.title,
      facets: this._dataset.facets,
      series: []
    };
    dataset.series = this._dataset.series.map((aSeries) => ({
      name: aSeries.key,
      type: CHART_TYPE_MAP[this._dataset.type],
      records: this._data[aSeries.key]
    }));
    const selectors = this._renderSelectors();
    const behaviors = this._renderBehaviors();
    this._jim = { 
      datasets: [dataset], 
      selectors,
      behaviors,
      version: { jim: '0.4.0' }
    };
  }

  public addSeriesSummary(seriesKey: string, summary: string) {
    if (!this._jim) {
      throw new JimError('JIM must be rendered before adding series summary');
    }
    const seriesIndex = this._seriesKeys.indexOf(seriesKey);
    if (seriesIndex === -1) {
      throw new JimError(`Series key "${seriesKey}" not found`);
    }
    this._jim.datasets[0].series[seriesIndex].description = summary;
    const selectorKey = `seriesSummary_${strToId(seriesKey)}`;
    this._jim.selectors[selectorKey] = {
      dom: `#series-${strToId(seriesKey)}`,
      json: `$.datasets[0].series[${seriesIndex}].description`
    };
  }

  private _renderBehaviors(): any[] {
    const behaviors: any[] = [];
    this._seriesKeys.forEach((seriesKey, seriesIndex) => {
      behaviors.push({
        target: {
          selector: `$.selectors.seriesSummary_${seriesKey}`
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
        },
        details: {
          announcement: {
            path: `$.datasets[0].series[${seriesIndex}].description`
          }
        }
      });
    });
    return behaviors;
  }

}
