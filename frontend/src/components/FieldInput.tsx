type TableColumn = {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
};

type FieldInputProps = {
  column: TableColumn;
  value: any;
  onChange: (value: any) => void;
};

export function FieldInput({column, value, onChange}: FieldInputProps) {
  const isRequired = !column.nullable && !column.default && column.name !== 'id';
  const isTimestamp =
    column.type.toLowerCase().includes('timestamp') ||
    column.name.toLowerCase().includes('_at') ||
    column.name.toLowerCase().includes('date');
  const isNumber =
    column.type.toLowerCase().includes('int') ||
    column.type.toLowerCase().includes('float') ||
    column.type.toLowerCase().includes('decimal') ||
    column.type.toLowerCase().includes('numeric');
  const isBoolean = column.type.toLowerCase().includes('bool');

  const baseInputClasses =
    'w-full px-3 py-2 bg-slate-800 text-white border border-slate-600/50 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200';

  return (
    <div>
      <label className="block text-sm text-slate-300 font-semibold mb-1">
        {column.name}
        {isRequired && <span className="text-red-400 ml-1">*</span>}
      </label>

      {isBoolean ? (
        <select
          value={value !== undefined ? String(value) : ''}
          onChange={e => onChange(e.target.value === 'true')}
          className={baseInputClasses}
        >
          <option value="">Seleccionar...</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      ) : isTimestamp ? (
        <input
          type="datetime-local"
          value={value ? new Date(value).toISOString().slice(0, 16) : ''}
          onChange={e =>
            onChange(e.target.value ? new Date(e.target.value).toISOString() : '')
          }
          className={baseInputClasses}
        />
      ) : isNumber ? (
        <input
          type="number"
          step="any"
          value={value !== undefined ? value : ''}
          onChange={e => onChange(e.target.value ? parseFloat(e.target.value) : '')}
          placeholder={column.default ? `Default: ${column.default}` : ''}
          className={baseInputClasses}
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={column.default ? `Default: ${column.default}` : ''}
          className={baseInputClasses}
        />
      )}
    </div>
  );
}
