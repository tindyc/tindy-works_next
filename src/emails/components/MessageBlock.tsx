type Props = {
  message: string;
};

export function MessageBlock({ message }: Props) {
  return (
    <table cellPadding={0} cellSpacing={0} width="100%" style={{ borderCollapse: 'separate', borderSpacing: 0, backgroundColor: '#fafafa', border: '1px solid #d8d8d6', borderRadius: '10px', marginTop: '16px' }}>
      <tbody>
        <tr>
          <td style={{ padding: '24px 26px' }}>
            <h2 style={{ margin: '0 0 14px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888888' }}>
              Message
            </h2>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.75', color: '#111111', fontSize: '15px' }}>
              {message}
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
