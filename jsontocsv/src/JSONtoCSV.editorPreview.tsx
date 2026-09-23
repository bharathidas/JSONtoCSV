import { Component, ReactNode, createElement } from "react";

import { JSONtoCSVPreviewProps } from "../typings/JSONtoCSVProps";
import { CsvPreview } from "./components/CsvPreview";
import { DelimiterSelect } from "./components/DelimiterSelect";
import { JSONtoCSVInput } from "./components/JSONtoCSVInput";

// Sample rows so the design-mode preview in Studio Pro shows what the widget looks like at runtime.
const sampleData = [
    { id: 1, name: "John Doe", city: "New York" },
    { id: 2, name: "Jane Smith", city: "San Francisco" },
    { id: 3, name: "Sam Johnson", city: "Chicago" }
];

export class preview extends Component<JSONtoCSVPreviewProps> {
    render(): ReactNode {
        return (
            <div className={"widget-jsontocsv " + this.props.class}>
                {this.props.showPreview && (
                    <CsvPreview
                        data={sampleData}
                        filename="export.csv"
                        delimiter=";"
                        rowsPerPage={this.props.rowsPerPage && this.props.rowsPerPage > 0 ? this.props.rowsPerPage : 10}
                    />
                )}
                <div className="jsontocsv-actions">
                    {this.props.allowDelimiterSelection && <DelimiterSelect value=";" onChange={() => undefined} />}
                    <JSONtoCSVInput data={sampleData} filename="export.csv" delimiter=";" />
                </div>
            </div>
        );
    }
}

export function getPreviewCss(): string {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("./ui/JSONtoCSV.css");
}
