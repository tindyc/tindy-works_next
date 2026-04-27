import React, { useMemo } from 'react';
import { type PlantDef } from './PlantCarousel';
import { TerminalForm } from '@/components/TerminalForm';
import {
  type TerminalFlowStep,
  type TerminalFormData,
  type TerminalValidationRule,
  terminalValidators,
} from '@/hooks/useTerminalFlow';

type PlantRequestTerminalProps = {
  plant: PlantDef;
  onComplete: (data: TerminalFormData) => void | Promise<void>;
};

type PlantRequestContext = {
  plant: PlantDef;
  challengeWord: string;
  challengeExpected: string;
};

const HUMAN_CHALLENGE_WORDS = ['monstera', 'philodendron', 'calathea', 'maranta', 'pothos'] as const;

function normalizeOwner(value: string) {
  const normalized = value.trim().toLowerCase();
  if (['self', 'me', 'myself', 'for me'].includes(normalized)) {
    return 'self';
  }
  if (['other', 'someone else', 'gift', 'for someone else'].includes(normalized)) {
    return 'other';
  }
  return normalized;
}

function normalizeDeliveryMethod(value: string) {
  const normalized = value.trim().toLowerCase();
  if (['collection', 'collect', 'pickup', 'pick up'].includes(normalized)) {
    return 'collection';
  }
  if (['post', 'delivery', 'mail'].includes(normalized)) {
    return 'post';
  }
  return normalized;
}

function normalizeYesNo(value: string) {
  const normalized = value.trim().toLowerCase();
  if (['yes', 'y'].includes(normalized)) {
    return 'yes';
  }
  if (['no', 'n'].includes(normalized)) {
    return 'no';
  }
  return normalized;
}

const ownerValidation: TerminalValidationRule<PlantRequestContext> = ({ value }) => {
  return ['self', 'other'].includes(normalizeOwner(value))
    ? null
    : 'Please type self or other.';
};

const deliveryValidation: TerminalValidationRule<PlantRequestContext> = ({ value }) => {
  return ['collection', 'post'].includes(normalizeDeliveryMethod(value))
    ? null
    : 'Please type collection or post.';
};

const yesNoValidation: TerminalValidationRule<PlantRequestContext> = ({ value }) => {
  return ['yes', 'no'].includes(normalizeYesNo(value))
    ? null
    : 'Please type yes or no.';
};

const collectionWhoValidation: TerminalValidationRule<PlantRequestContext> = ({ value }) => {
  const normalized = value.trim().toLowerCase();
  return ['sender', 'recipient'].includes(normalized)
    ? null
    : 'Please type sender or recipient.';
};

const optionalPhoneValidation: TerminalValidationRule<PlantRequestContext> = ({ value }) => {
  if (!value.trim()) {
    return null;
  }
  return terminalValidators.phone({ value, data: {}, context: undefined });
};

export function PlantRequestTerminal({ plant, onComplete }: PlantRequestTerminalProps) {
  const challengeWord = useMemo(() => {
    const index = Math.floor(Math.random() * HUMAN_CHALLENGE_WORDS.length);
    return HUMAN_CHALLENGE_WORDS[index];
  }, [plant.id]);

  const context = useMemo<PlantRequestContext>(
    () => ({
      plant,
      challengeWord,
      challengeExpected: challengeWord.slice(-3).toLowerCase(),
    }),
    [challengeWord, plant],
  );

  const challengeValidation: TerminalValidationRule<PlantRequestContext> = ({ value, context: stepContext }) => {
    const answer = value.trim().toLowerCase();
    const expected = stepContext?.challengeExpected;

    if (!expected) {
      return 'Challenge unavailable. Please try again.';
    }

    return answer === expected ? null : 'Challenge failed. Please type the correct last 3 letters.';
  };

  const flow = useMemo<Array<TerminalFlowStep<PlantRequestContext>>>(
    () => [
      {
        id: 'ownerType',
        field: 'ownerType',
        question: 'Is this plant for you or someone else? (self / other)',
        validation: ['required', ownerValidation],
        normalize: (value) => normalizeOwner(value),
      },
      {
        id: 'senderName',
        field: 'senderName',
        question: 'What is your full name?',
        validation: 'required',
      },
      {
        id: 'senderEmail',
        field: 'senderEmail',
        question: 'What is your email address?',
        validation: ['required', 'email'],
        normalize: (value) => value.trim().toLowerCase(),
      },
      {
        id: 'senderPhone',
        field: 'senderPhone',
        question: 'What is your phone number?',
        validation: ['required', 'phone'],
      },
      {
        id: 'recipientName',
        field: 'recipientName',
        question: 'Recipient name?',
        validation: 'required',
        condition: (data) => data.ownerType === 'other',
      },
      {
        id: 'recipientPhone',
        field: 'recipientPhone',
        question: 'Recipient phone? (optional, Enter to skip)',
        validation: optionalPhoneValidation,
        condition: (data) => data.ownerType === 'other',
      },
      {
        id: 'recipientAddress',
        field: 'recipientAddress',
        question: 'Recipient address?',
        validation: 'required',
        condition: (data) => data.ownerType === 'other',
      },
      {
        id: 'giftMessage',
        field: 'giftMessage',
        question: 'Optional gift message? (Enter to skip)',
        condition: (data) => data.ownerType === 'other',
      },
      {
        id: 'surprise',
        field: 'surprise',
        question: 'Do you want this to be a surprise? (yes / no)',
        validation: ['required', yesNoValidation],
        normalize: (value) => normalizeYesNo(value),
        condition: (data) => data.ownerType === 'other',
      },
      {
        id: 'deliveryMethod',
        field: 'deliveryMethod',
        question: 'Delivery method? (collection / post)',
        validation: ['required', deliveryValidation],
        normalize: (value) => normalizeDeliveryMethod(value),
      },
      {
        id: 'collectionWho',
        field: 'collectionWho',
        question: 'Who will collect? (sender / recipient)',
        validation: ['required', collectionWhoValidation],
        condition: (data) => data.deliveryMethod === 'collection',
      },
      {
        id: 'collectionDate',
        field: 'collectionDate',
        question: 'Preferred collection date? (e.g. 2026-05-10)',
        validation: 'required',
        condition: (data) => data.deliveryMethod === 'collection',
      },
      {
        id: 'collectionTimeWindow',
        field: 'collectionTimeWindow',
        question: 'Preferred time window? (e.g. 10:00-12:00)',
        validation: 'required',
        condition: (data) => data.deliveryMethod === 'collection',
      },
      {
        id: 'deliveryAddress',
        field: 'deliveryAddress',
        question: 'Delivery address?',
        validation: 'required',
        condition: (data) => data.deliveryMethod === 'post' && !data.recipientAddress,
      },
      {
        id: 'deliveryNotes',
        field: 'deliveryNotes',
        question: 'Any delivery notes? (optional, Enter to skip)',
        condition: (data) => data.deliveryMethod === 'post',
      },
      {
        id: 'humanChallenge',
        field: 'humanChallengeAnswer',
        question: `Human check: Type the last 3 letters of the word "${challengeWord}"`,
        validation: ['required', challengeValidation],
        normalize: (value) => value.trim().toLowerCase(),
      },
    ],
    [challengeValidation, challengeWord],
  );

  const summaryBuilder = (data: TerminalFormData, terminalContext?: PlantRequestContext) => {
    const selectedPlant = terminalContext?.plant;
    const isSurprise = data.surprise === 'yes';

    return [
      `Plant: ${selectedPlant?.name ?? 'Unknown'}`,
      `For: ${data.ownerType === 'other' ? 'Someone else' : 'Myself'}`,
      `Sender: ${data.senderName} | ${data.senderEmail} | ${data.senderPhone}`,
      ...(data.ownerType === 'other'
        ? [
            `Recipient: ${data.recipientName}`,
            `Recipient phone: ${data.recipientPhone || 'not provided'}`,
            `Recipient address: ${data.recipientAddress}`,
            `Gift message: ${data.giftMessage || 'none'}`,
            `Surprise: ${data.surprise}`,
          ]
        : []),
      `Delivery: ${data.deliveryMethod}`,
      ...(data.deliveryMethod === 'collection'
        ? [
            `Collection by: ${data.collectionWho}`,
            `Collection date: ${data.collectionDate}`,
            `Collection window: ${data.collectionTimeWindow}`,
          ]
        : [
            `Delivery address: ${data.deliveryAddress || data.recipientAddress || 'missing'}`,
            `Delivery notes: ${data.deliveryNotes || 'none'}`,
          ]),
      ...(isSurprise
        ? ['Recipient confirmation policy: hide sender details and pricing.']
        : []),
    ];
  };

  return (
    <TerminalForm
      flow={flow}
      context={context}
      onComplete={(data) => {
        const isSurprise = data.surprise === 'yes';
        const payload: TerminalFormData = {
          ...data,
          plantId: plant.id,
          plantName: plant.name,
          challengeWord: context.challengeWord,
          hideSenderInfoInRecipientConfirmation: isSurprise ? 'yes' : 'no',
          hidePricingInRecipientConfirmation: isSurprise ? 'yes' : 'no',
        };

        return onComplete(payload);
      }}
      introMessages={[
        `REQUEST CHANNEL OPENED // ${plant.name}`,
        'Answer each prompt and press Enter.',
        'Optional prompts can be skipped by pressing Enter.',
      ]}
      confirmationQuestion="Submit this request? (yes/no)"
      summaryBuilder={summaryBuilder}
      resetKey={plant.id}
      honeypotFieldName="company"
    />
  );
}
