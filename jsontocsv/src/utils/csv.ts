// Mirrors json-to-csv-export 2.1.0 (the library that writes the downloaded file), so the preview shows exactly what
// the CSV will contain: columns come from the keys of the first row, headers only relabel them, and every value is
// JSON.stringify'd (strings quoted, missing values as "").

export type Row = Record<string, unknown>;

export function columnKeys(data: object[]): string[] {
    return data.length > 0 && data[0] !== null && typeof data[0] === "object" ? Object.keys(data[0]) : [];
}

export function csvValue(value: unknown): string {
    return JSON.stringify(value === 0 ? 0 : value ?? "") ?? "";
}

export function buildCsv(data: object[], delimiter: string, headers: string[] | undefined): string {
    if (data.length === 0) {
        return headers ? headers.join(delimiter) : "";
    }
    const keys = columnKeys(data);
    const lines = data.map(row => keys.map(key => csvValue((row as Row)[key])).join(delimiter));
    lines.unshift((headers ?? keys).join(delimiter));
    return lines.join("\r\n");
}

// The name the downloaded file gets: ".csv" is added unless the name already ends with "csv".
export function csvFilename(filename: string): string {
    return /csv$/i.test(filename) ? filename : `${filename}.csv`;
}

// Plain text for a table cell; objects and arrays are shown as JSON.
export function displayValue(value: unknown): string {
    if (value === null || value === undefined) {
        return "";
    }
    return typeof value === "object" ? JSON.stringify(value) : String(value);
}
