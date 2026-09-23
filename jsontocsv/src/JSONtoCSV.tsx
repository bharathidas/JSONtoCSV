import { Component, ReactNode, createElement } from "react";
import classNames from "classnames";

import { JSONtoCSVContainerProps } from "../typings/JSONtoCSVProps";
import { CsvPreview } from "./components/CsvPreview";
import { DelimiterSelect } from "./components/DelimiterSelect";
import { JSONtoCSVInput } from "./components/JSONtoCSVInput";
import { csvFilename } from "./utils/csv";
import "./ui/JSONtoCSV.css";

type ParsedData = { data: object[] } | { data: undefined; message: string; isError: boolean };

interface JSONtoCSVState {
    // Delimiter chosen in the dropdown; undefined until the user picks one, so the attribute value is used.
    chosenDelimiter?: string;
}

export class JSONtoCSV extends Component<JSONtoCSVContainerProps, JSONtoCSVState> {
    state: JSONtoCSVState = {};
    // Parsing is cached per attribute value, so the preview keeps its page when unrelated props change.
    private lastInput?: string;
    private lastParsed?: ParsedData;

    render(): ReactNode {
        const parsed = this.parseData();
        const filename = this.props.filenameKey?.value || "export.csv";
        const defaultDelimiter = this.props.delimiterKey?.value || ";";
        const allowSelection = this.props.allowDelimiterSelection ?? true;
        const chosen = allowSelection ? this.state.chosenDelimiter : undefined;
        // An empty "Other…" text box falls back to the default instead of joining values without a separator.
        const delimiter = chosen || defaultDelimiter;
        const headers = this.parseHeaders(this.props.headersKey?.value);
        const showPreview = this.props.showPreview ?? true;

        return (
            <div className={classNames("widget-jsontocsv", this.props.class)} style={this.props.style}>
                {parsed.data === undefined ? (
                    <div className={classNames("jsontocsv-message", { "jsontocsv-message-error": parsed.isError })}>
                        {parsed.message}
                    </div>
                ) : (
                    showPreview && (
                        <CsvPreview
                            data={parsed.data}
                            filename={csvFilename(filename)}
                            delimiter={delimiter}
                            headers={headers}
                            rowsPerPage={this.props.rowsPerPage > 0 ? this.props.rowsPerPage : 10}
                        />
                    )
                )}
                <div className="jsontocsv-actions">
                    {allowSelection && (
                        <DelimiterSelect
                            value={chosen ?? defaultDelimiter}
                            onChange={chosenDelimiter => this.setState({ chosenDelimiter })}
                        />
                    )}
                    <JSONtoCSVInput data={parsed.data} filename={filename} delimiter={delimiter} headers={headers} />
                </div>
            </div>
        );
    }

    // The parsed array, or a message when the attribute is loading, empty or not a JSON array.
    private parseData(): ParsedData {
        const attribute = this.props.dataKey;
        if (attribute?.status === "loading") {
            return { data: undefined, message: "Loading data…", isError: false };
        }
        const input = attribute?.value;
        if (input === this.lastInput && this.lastParsed) {
            return this.lastParsed;
        }
        this.lastInput = input;
        this.lastParsed = this.parse(input);
        return this.lastParsed;
    }

    private parse(input: string | undefined): ParsedData {
        if (!input) {
            return { data: undefined, message: "No data to export yet.", isError: false };
        }
        try {
            const parsed = JSON.parse(input);
            if (Array.isArray(parsed)) {
                return { data: parsed };
            }
            console.error("JSONtoCSV: data must be a JSON array of objects.");
            return {
                data: undefined,
                message: "The data must be a JSON array of objects, like [{...}, {...}].",
                isError: true
            };
        } catch (e) {
            console.error("JSONtoCSV: data is not valid JSON.", e);
            return { data: undefined, message: `The data is not valid JSON: ${(e as Error).message}`, isError: true };
        }
    }

    // Comma-separated column names; undefined when empty so the JSON keys are used as column names.
    private parseHeaders(input: string | undefined): string[] | undefined {
        const headers = (input || "")
            .split(",")
            .map(header => header.trim())
            .filter(header => header !== "");
        return headers.length > 0 ? headers : undefined;
    }
}
