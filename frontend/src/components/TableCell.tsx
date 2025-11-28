type TableCellProps = {
  value: any;
  columnName: string;
};

/**
 * Renders a table cell with automatic type detection and formatting
 * Handles: null, boolean, object, and string values
 */
export function TableCell({value, columnName}: TableCellProps) {
  if (value === null) {
    return <span className="text-slate-500 italic">null</span>;
  }

  if (typeof value === 'boolean') {
    return (
      <span
        className={`font-semibold ${value ? 'text-green-400' : 'text-red-400'}`}
      >
        {value.toString()}
      </span>
    );
  }

  if (typeof value === 'object') {
    return (
      <span className="text-purple-300 font-mono text-xs">
        {JSON.stringify(value)}
      </span>
    );
  }

  return <span className="truncate max-w-xs block">{String(value)}</span>;
}
