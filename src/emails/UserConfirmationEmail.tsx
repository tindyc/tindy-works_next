import { EmailLayout } from './components/EmailLayout';

type Props = {
  requestId: string;
  name?: string;
  type: 'contact' | 'support' | 'plant';
  preview?: string;
};

const typeLabel: Record<Props['type'], string> = {
  contact: 'contact request',
  support: 'support request',
  plant: 'plant request',
};

export function UserConfirmationEmail({ requestId, name, type, preview }: Props) {
  return (
    <EmailLayout title="Request received">
      <table cellPadding={0} cellSpacing={0} width="100%" style={{ borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ paddingBottom: '24px' }}>
              <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.6', color: '#333333' }}>
                {name ? `Hi ${name},` : 'Hi there,'}
              </p>
              <p style={{ margin: '12px 0 0', fontSize: '16px', lineHeight: '1.6', color: '#555555' }}>
                {`We've received your ${typeLabel[type]} and will get back to you shortly.`}
              </p>
            </td>
          </tr>
          <tr>
            <td style={{ paddingBottom: preview ? '24px' : '0' }}>
              <table
                cellPadding={0}
                cellSpacing={0}
                width="100%"
                style={{
                  borderCollapse: 'separate',
                  backgroundColor: '#f7f7f6',
                  border: '1px solid #e7e7e5',
                  borderRadius: '6px',
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ padding: '16px 20px' }}>
                      <p
                        style={{
                          margin: '0 0 6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: '#aaaaaa',
                        }}
                      >
                        Reference ID
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '14px',
                          fontFamily: 'Menlo, Consolas, monospace',
                          fontWeight: 500,
                          color: '#111111',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {requestId}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          {preview ? (
            <tr>
              <td
                style={{
                  paddingTop: '20px',
                  paddingBottom: '24px',
                  borderTop: '1px solid #e8e8e6',
                }}
              >
                <p
                  style={{
                    margin: '0 0 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#aaaaaa',
                  }}
                >
                  Your message
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#666666',
                    fontStyle: 'italic',
                  }}
                >
                  {preview}
                </p>
              </td>
            </tr>
          ) : null}
          <tr>
            <td
              style={{
                paddingTop: '20px',
                borderTop: '1px solid #e8e8e6',
              }}
            >
              <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#888888' }}>
                You can reply directly to this email if needed.
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </EmailLayout>
  );
}
