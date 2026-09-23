import { Component, ReactNode, createElement } from "react";
// json-to-csv-export directly instead of the react-json-to-csv wrapper: the wrapper is CommonJS only, which leaves a
// require("react") in the ES module bundle and breaks the page in the Mendix 10 React client.
import csvDownload from "json-to-csv-export";

export interface JSONtoCSVProps {
    // undefined while there is no valid data; the button is then disabled
    data: object[] | undefined;
    filename: string;
    delimiter: string;
    headers?: string[];
}

export class JSONtoCSVInput extends Component<JSONtoCSVProps> {
    render(): ReactNode {
        const { data } = this.props;
        return (
            <button
                type="button"
                className="btn btn-primary jsontocsv-download"
                disabled={data === undefined}
                onClick={data === undefined ? undefined : () => this.download(data)}
            >
                <svg
                    className="jsontocsv-download-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    focusable="false"
                >
                    <path d="M8 1.5v8.2m0 0L4.8 6.5M8 9.7l3.2-3.2M2.5 11.5v2h11v-2" />
                </svg>
                Download Data
            </button>
        );
    }

    private download(data: object[]): void {
        csvDownload({
            data,
            filename: this.props.filename,
            delimiter: this.props.delimiter,
            headers: this.props.headers
        });
    }
}
