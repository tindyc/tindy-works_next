type Props = {
  rows: Array<[string, string | undefined]>;
};

function formatValue(value: string | undefined) {
  return value?.trim() || 'Not provided';
}

export function DetailTable({ rows }: Props) {
  return (
    <table cellPadding={0} cellSpacing={0} width="100%" style={{ borderCollapse: 'separate', borderSpacing: 0, backgroundColor: '#ffffff', border: '1px solid #e4e4e2', borderRadius: '10px', marginBottom: '20px' }}>
      <tbody>
        <tr>
          <td style={{ padding: '10px 24px' }}>
            <table cellPadding={0} cellSpacing={0} width="100%" style={{ borderCollapse: 'collapse' }}>
              <tbody>
                {rows.map(([label, value], i) => {
                  const isLast = i === rows.length - 1;
                  const border = isLast ? undefined : '1px solid #f0f0ee';
                  return (
                    <tr key={i}>
                      <td style={{ padding: '15px 16px 15px 0', borderBottom: border, verticalAlign: 'top', width: '150px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#888888' }}>
                          {label}
                        </span>
                      </td>
                      <td style={{ padding: '15px 0', borderBottom: border, verticalAlign: 'top' }}>
                        <span style={{ fontSize: '14px', color: '#111111', lineHeight: '1.5' }}>
                          {formatValue(value)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
