export function collectXs(data: DatapointManifest[]): Set<string> {
  return new Set(...data.map((datapoint) => datapoint.x));
}

// TODO: specify that T must be primitive
function setEquals<T>(lhs: Set<T>, rhs: Set<T>) {
  return lhs.size === rhs.size && lhs.isSubsetOf(rhs);
}

export function chartDataIsOrdered(data: AllSeriesData): boolean {
  let chartXs: Set<string> | null = null;
  for (const key in data) {
    const seriesData = data[key];
    const xs = collectXs(seriesData);
    // Series not ordered
    if (xs.size !== seriesData.length) {
      return false;
    }
    // Chart not ordered
    if (chartXs === null) {
      chartXs = xs;
    } else if (!setEquals(xs, chartXs)) {
      return false;
    }
  }
  return true;
}