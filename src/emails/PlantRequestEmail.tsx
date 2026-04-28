import { EmailLayout } from './components/EmailLayout';
import { MetaStrip } from './components/MetaStrip';
import { DetailTable } from './components/DetailTable';
import { SectionTitle } from './components/SectionTitle';

type Props = {
  requestId: string;
  payload: Readonly<Record<string, string>>;
  timestamp?: string;
};

export function PlantRequestEmail({ requestId, payload, timestamp }: Props) {
  const isForSomeoneElse = payload.ownerType === 'other';

  const plantRows: Array<[string, string | undefined]> = [
    ['Plant', payload.plantName],
    ['Plant ID', payload.plantId],
    ['For', isForSomeoneElse ? 'Someone else' : 'Sender'],
  ];

  const senderRows: Array<[string, string | undefined]> = [
    ['Name', payload.senderName],
    ['Email', payload.senderEmail],
    ['Phone', payload.senderPhone],
  ];

  const recipientRows: Array<[string, string | undefined]> = [
    ['Name', payload.recipientName],
    ['Phone', payload.recipientPhone],
    ['Address', payload.recipientAddress],
    ['Gift Message', payload.giftMessage],
    ['Surprise', payload.surprise],
  ];

  const deliveryRows: Array<[string, string | undefined]> = [
    ['Method', payload.deliveryMethod],
    ['Collection By', payload.collectionWho],
    ['Collection Date', payload.collectionDate],
    ['Collection Time', payload.collectionTimeWindow],
    ['Address', payload.deliveryAddress || payload.recipientAddress],
    ['Notes', payload.deliveryNotes],
    ['Hide Sender Info', payload.hideSenderInfoInRecipientConfirmation],
    ['Hide Pricing', payload.hidePricingInRecipientConfirmation],
  ];

  return (
    <EmailLayout title="New Plant Request" timestamp={timestamp}>
      <MetaStrip id={requestId} type="Plant Request" />
      <SectionTitle>Plant Info</SectionTitle>
      <DetailTable rows={plantRows} />
      <SectionTitle>Sender Info</SectionTitle>
      <DetailTable rows={senderRows} />
      {isForSomeoneElse && (
        <>
          <SectionTitle>Recipient Info</SectionTitle>
          <DetailTable rows={recipientRows} />
        </>
      )}
      <SectionTitle>Delivery Details</SectionTitle>
      <DetailTable rows={deliveryRows} />
    </EmailLayout>
  );
}
