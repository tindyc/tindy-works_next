type Props = { children: string };

export function SectionTitle({ children }: Props) {
  return (
    <table cellPadding={0} cellSpacing={0} width="100%" style={{ borderCollapse: 'collapse' }}>
      <tbody>
        <tr>
          <td style={{ padding: '8px 0 8px 0' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color: '#888888',
              fontFamily: 'Inter, Arial, sans-serif',
            }}>
              {children}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
