type Props = {
  id?: string;
  type?: string;
  priority?: string;
};

type MetaItemProps = {
  label: string;
  value: string;
  mono?: boolean;
  last?: boolean;
};

function MetaItem({ label, value, mono, last }: MetaItemProps) {
  return (
    <td style={{ padding: 0, paddingRight: last ? 0 : '24px', whiteSpace: 'nowrap' }}>
      <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#aaaaaa' }}>
        {label}{' '}
      </span>
      <span style={{ fontSize: '12px', fontWeight: 500, color: '#444444', fontFamily: mono ? 'Menlo, monospace' : undefined, letterSpacing: mono ? '0.02em' : undefined }}>
        {value}
      </span>
    </td>
  );
}

export function MetaStrip({ id, type, priority }: Props) {
  const items = [
    id && { label: 'ID', value: id, mono: true },
    type && { label: 'Type', value: type },
    priority && { label: 'Priority', value: priority },
  ].filter(Boolean) as Array<{ label: string; value: string; mono?: boolean }>;

  if (items.length === 0) return null;

  return (
    <table cellPadding={0} cellSpacing={0} width="100%" style={{ borderCollapse: 'separate', borderSpacing: 0, marginBottom: '22px', backgroundColor: '#f7f7f6', borderRadius: '6px', border: '1px solid #e7e7e5' }}>
      <tbody>
        <tr>
          <td style={{ padding: '10px 16px' }}>
            <table cellPadding={0} cellSpacing={0} style={{ borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            {items.map(({ label, value, mono }, i) => (
              <MetaItem key={label} label={label} value={value} mono={mono} last={i === items.length - 1} />
            ))}
          </tr>
        </tbody>
      </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
