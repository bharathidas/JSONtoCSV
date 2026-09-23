import { ChangeEvent, Component, ReactNode, createElement } from "react";

export interface DelimiterSelectProps {
    value: string;
    onChange: (delimiter: string) => void;
}

interface DelimiterSelectState {
    // true while "Other…" is chosen, so the text box stays visible even when it holds a preset value
    other: boolean;
}

const presets: Array<{ value: string; label: string }> = [
    { value: ";", label: "Semicolon ( ; )" },
    { value: ",", label: "Comma ( , )" },
    { value: "\t", label: "Tab" },
    { value: "|", label: "Pipe ( | )" }
];

const OTHER = "__other__";

let nextId = 0;

export class DelimiterSelect extends Component<DelimiterSelectProps, DelimiterSelectState> {
    state: DelimiterSelectState = { other: false };
    private readonly id = `jsontocsv-delimiter-${++nextId}`;

    render(): ReactNode {
        const { value } = this.props;
        const isPreset = presets.some(p => p.value === value);
        const selected = this.state.other ? OTHER : value;
        return (
            <div className="jsontocsv-delimiter">
                <label htmlFor={this.id}>Delimiter</label>
                <select id={this.id} className="form-control" value={selected} onChange={this.onSelect}>
                    {presets.map(p => (
                        <option key={p.label} value={p.value}>
                            {p.label}
                        </option>
                    ))}
                    {!isPreset && !this.state.other && <option value={value}>{`Custom ( ${value} )`}</option>}
                    <option value={OTHER}>Other…</option>
                </select>
                {this.state.other && (
                    <input
                        className="form-control jsontocsv-delimiter-other"
                        aria-label="Other delimiter"
                        value={value}
                        maxLength={10}
                        placeholder="e.g. :"
                        onChange={this.onType}
                    />
                )}
            </div>
        );
    }

    private onSelect = (e: ChangeEvent<HTMLSelectElement>): void => {
        if (e.target.value === OTHER) {
            this.setState({ other: true });
            return;
        }
        this.setState({ other: false });
        this.props.onChange(e.target.value);
    };

    private onType = (e: ChangeEvent<HTMLInputElement>): void => {
        this.props.onChange(e.target.value);
    };
}

export function delimiterLabel(delimiter: string): string {
    return delimiter === "\t" ? "Tab" : delimiter;
}
