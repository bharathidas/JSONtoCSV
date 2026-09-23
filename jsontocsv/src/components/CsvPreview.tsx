import { Component, ReactNode, createElement } from "react";
import { buildCsv, columnKeys, displayValue, Row } from "../utils/csv";
import { delimiterLabel } from "./DelimiterSelect";

export interface CsvPreviewProps {
    data: object[];
    filename: string;
    delimiter: string;
    headers?: string[];
    rowsPerPage: number;
}

type Tab = "table" | "csv";

interface CsvPreviewState {
    tab: Tab;
    page: number;
    collapsed: boolean;
    copied: boolean;
}

export class CsvPreview extends Component<CsvPreviewProps, CsvPreviewState> {
    state: CsvPreviewState = { tab: "table", page: 0, collapsed: false, copied: false };
    private copiedTimer?: number;

    componentDidUpdate(prevProps: CsvPreviewProps): void {
        // Back to the first page when the data or page size changes and the current page no longer exists
        if (
            (prevProps.data !== this.props.data || prevProps.rowsPerPage !== this.props.rowsPerPage) &&
            this.state.page >= this.pageCount()
        ) {
            this.setState({ page: 0 });
        }
    }

    componentWillUnmount(): void {
        window.clearTimeout(this.copiedTimer);
    }

    render(): ReactNode {
        const { data, filename, delimiter, headers } = this.props;
        const keys = columnKeys(data);
        const { tab, collapsed } = this.state;

        return (
            <div className="jsontocsv-preview">
                <div className="jsontocsv-preview-header">
                    <div className="jsontocsv-preview-title">
                        <span className="jsontocsv-file-icon" aria-hidden="true">
                            CSV
                        </span>
                        <div>
                            <div className="jsontocsv-filename">{filename}</div>
                            <div className="jsontocsv-summary">
                                {plural(data.length, "row")} · {plural(keys.length, "column")} · delimiter{" "}
                                <code>{delimiterLabel(delimiter)}</code>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="btn btn-sm btn-default jsontocsv-toggle"
                        aria-expanded={!collapsed}
                        onClick={() => this.setState({ collapsed: !collapsed })}
                    >
                        {collapsed ? "Show preview" : "Hide preview"}
                    </button>
                </div>
                {!collapsed && (
                    <div className="jsontocsv-preview-body">
                        {this.renderHeaderWarning(keys)}
                        <div className="jsontocsv-tabs" role="tablist">
                            {this.renderTab("table", "Table")}
                            {this.renderTab("csv", "CSV")}
                        </div>
                        {tab === "table" ? this.renderTable(keys) : this.renderCsv(buildCsv(data, delimiter, headers))}
                    </div>
                )}
            </div>
        );
    }

    private renderTab(tab: Tab, label: string): ReactNode {
        const selected = this.state.tab === tab;
        return (
            <button
                type="button"
                role="tab"
                aria-selected={selected}
                className={"jsontocsv-tab" + (selected ? " jsontocsv-tab-active" : "")}
                onClick={() => this.setState({ tab })}
            >
                {label}
            </button>
        );
    }

    private renderHeaderWarning(keys: string[]): ReactNode {
        const { headers } = this.props;
        if (!headers || keys.length === 0 || headers.length === keys.length) {
            return null;
        }
        return (
            <div className="alert alert-warning jsontocsv-warning" role="status">
                headers has {plural(headers.length, "name")} but the data has {plural(keys.length, "column")}, so the
                header row will not line up with the values.
            </div>
        );
    }

    private renderTable(keys: string[]): ReactNode {
        const { data, headers, rowsPerPage } = this.props;
        if (data.length === 0) {
            return (
                <div className="jsontocsv-empty">The data is an empty array, so the CSV will only contain headers.</div>
            );
        }
        const page = Math.min(this.state.page, this.pageCount() - 1);
        const first = page * rowsPerPage;
        const rows = data.slice(first, first + rowsPerPage);
        return (
            <div>
                <div className="jsontocsv-table-wrapper">
                    <table className="table table-striped table-hover jsontocsv-table">
                        <thead>
                            <tr>
                                <th scope="col" className="jsontocsv-rownumber">
                                    #
                                </th>
                                {keys.map((key, i) => (
                                    <th scope="col" key={key} title={headers ? `JSON key: ${key}` : undefined}>
                                        {headers ? headers[i] ?? "" : key}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, r) => (
                                <tr key={first + r}>
                                    <td className="jsontocsv-rownumber">{first + r + 1}</td>
                                    {keys.map(key => (
                                        <td key={key}>{displayValue((row as Row)[key])}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {this.renderPaging(page, first, rows.length)}
            </div>
        );
    }

    private renderPaging(page: number, first: number, shown: number): ReactNode {
        const pages = this.pageCount();
        if (pages <= 1) {
            return null;
        }
        return (
            <div className="jsontocsv-paging">
                <span>
                    Rows {first + 1}–{first + shown} of {this.props.data.length}
                </span>
                <button
                    type="button"
                    className="btn btn-sm btn-default"
                    disabled={page === 0}
                    onClick={() => this.setState({ page: page - 1 })}
                >
                    Previous
                </button>
                <button
                    type="button"
                    className="btn btn-sm btn-default"
                    disabled={page >= pages - 1}
                    onClick={() => this.setState({ page: page + 1 })}
                >
                    Next
                </button>
            </div>
        );
    }

    private renderCsv(csv: string): ReactNode {
        return (
            <div className="jsontocsv-csv">
                <button type="button" className="btn btn-sm btn-default jsontocsv-copy" onClick={() => this.copy(csv)}>
                    {this.state.copied ? "Copied" : "Copy CSV"}
                </button>
                <pre>{csv}</pre>
            </div>
        );
    }

    private copy(csv: string): void {
        if (!navigator.clipboard) {
            return;
        }
        navigator.clipboard.writeText(csv).then(
            () => {
                this.setState({ copied: true });
                window.clearTimeout(this.copiedTimer);
                this.copiedTimer = window.setTimeout(() => this.setState({ copied: false }), 2000);
            },
            e => console.error("JSONtoCSV: could not copy to the clipboard.", e)
        );
    }

    private pageCount(): number {
        return Math.max(1, Math.ceil(this.props.data.length / Math.max(1, this.props.rowsPerPage)));
    }
}

function plural(count: number, word: string): string {
    return `${count} ${word}${count === 1 ? "" : "s"}`;
}
