/**
 * This file was generated from JSONtoCSV.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { EditableValue } from "mendix";

export interface JSONtoCSVContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    dataKey: EditableValue<string>;
    filenameKey?: EditableValue<string>;
    delimiterKey?: EditableValue<string>;
    headersKey?: EditableValue<string>;
    allowDelimiterSelection: boolean;
    showPreview: boolean;
    rowsPerPage: number;
}

export interface JSONtoCSVPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    dataKey: string;
    filenameKey: string;
    delimiterKey: string;
    headersKey: string;
    allowDelimiterSelection: boolean;
    showPreview: boolean;
    rowsPerPage: number | null;
}
