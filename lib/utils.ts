import { AllSeriesData, DatapointManifest } from "@fizz/paramanifest";

export function collectIndeps(data: DatapointManifest[], indepKey: string): Set<string> {
  return new Set(...data.map((datapoint) => datapoint.x));
}

type Primitive = undefined | null | boolean | number | string | symbol | BigInt;

// TODO: specify that T must be primitive
function setEquals<T extends Primitive>(lhs: Set<T>, rhs: Set<T>) {
  return lhs.size === rhs.size && lhs.isSubsetOf(rhs);
}

export function chartDataIsUnivalent(data: AllSeriesData, indepKey: string): boolean {
  let chartXs: Set<string> | null = null;
  for (const key in data) {
    const seriesData = data[key];
    const xs = collectIndeps(seriesData, indepKey);
    // Series not univalent
    if (xs.size !== seriesData.length) {
      return false;
    }
    // Chart not univalent
    if (chartXs === null) {
      chartXs = xs;
    } else if (!setEquals(xs, chartXs)) {
      return false;
    }
  }
  return true;
}