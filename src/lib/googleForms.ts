import { getAccessToken, createRegistration } from './firebase';
import { PurchaseSource } from '../types/warranty';

export interface FormItemQuestion {
  questionId: string;
  title: string;
}

export interface GoogleFormDetails {
  formId: string;
  info: {
    title: string;
    documentTitle?: string;
    description?: string;
  };
  responderUri?: string;
  items?: {
    itemId: string;
    title: string;
    questionItem?: {
      question: {
        questionId: string;
      };
    };
  }[];
}

/**
 * Creates an official Tapmate Lifetime Warranty Registration Google Form
 * via the Google Forms API with standard fields.
 */
export async function createTapmateGoogleForm(): Promise<{
  formId: string;
  responderUri: string;
  title: string;
}> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google authentication required. Please sign in with Google first.');
  }

  // 1. Create base form
  const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title: 'Tapmate Lifetime Warranty Registration Form',
        documentTitle: 'Tapmate Warranty Registration',
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create form (${createRes.status})`);
  }

  const formData: GoogleFormDetails = await createRes.json();
  const formId = formData.formId;
  const safeFormId = encodeURIComponent(formId.trim());

  // 2. Add warranty registration questions via batchUpdate
  const batchUrl = `https://forms.googleapis.com/v1/forms/${safeFormId}:batchUpdate`;
  const batchBody = {
    requests: [
      {
        createItem: {
          item: {
            title: 'Full Name',
            description: 'Enter your full legal name as per purchase invoice',
            questionItem: {
              question: {
                required: true,
                textQuestion: { paragraph: false },
              },
            },
          },
          location: { index: 0 },
        },
      },
      {
        createItem: {
          item: {
            title: 'Email Address',
            description: 'We will send warranty status and confirmation here',
            questionItem: {
              question: {
                required: true,
                textQuestion: { paragraph: false },
              },
            },
          },
          location: { index: 1 },
        },
      },
      {
        createItem: {
          item: {
            title: 'Mobile Number',
            description: 'Contact number for warranty verification updates',
            questionItem: {
              question: {
                required: true,
                textQuestion: { paragraph: false },
              },
            },
          },
          location: { index: 2 },
        },
      },
      {
        createItem: {
          item: {
            title: 'Product Name',
            description: 'e.g. Tapmate 3-in-1 Magnetic Charging Stand, UltraFlow Cable',
            questionItem: {
              question: {
                required: true,
                textQuestion: { paragraph: false },
              },
            },
          },
          location: { index: 3 },
        },
      },
      {
        createItem: {
          item: {
            title: 'Serial Number / Batch Number',
            description: 'Located on the packaging barcode or on the product underside',
            questionItem: {
              question: {
                required: false,
                textQuestion: { paragraph: false },
              },
            },
          },
          location: { index: 4 },
        },
      },
      {
        createItem: {
          item: {
            title: 'Purchase Date (YYYY-MM-DD)',
            questionItem: {
              question: {
                required: true,
                textQuestion: { paragraph: false },
              },
            },
          },
          location: { index: 5 },
        },
      },
      {
        createItem: {
          item: {
            title: 'Purchased From',
            questionItem: {
              question: {
                required: true,
                choiceQuestion: {
                  type: 'DROP_DOWN',
                  options: [
                    { value: 'Tapmate Official Website' },
                    { value: 'Online Marketplace' },
                    { value: 'Retail Store / Dealer' },
                    { value: 'Other' },
                  ],
                },
              },
            },
          },
          location: { index: 6 },
        },
      },
      {
        createItem: {
          item: {
            title: 'Order ID / Invoice Number',
            questionItem: {
              question: {
                required: false,
                textQuestion: { paragraph: false },
              },
            },
          },
          location: { index: 7 },
        },
      },
    ],
  };

  await fetch(batchUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(batchBody),
  }).catch((e) => {
    console.warn('Batch items update note:', e);
  });

  return {
    formId,
    responderUri: formData.responderUri || `https://docs.google.com/forms/d/${formId}/viewform`,
    title: formData.info.title,
  };
}

/**
 * Fetches Google Form metadata and items
 */
export async function getGoogleFormDetails(formId: string): Promise<GoogleFormDetails> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google authentication required');
  }

  const safeFormId = encodeURIComponent(formId.trim());
  const res = await fetch(`https://forms.googleapis.com/v1/forms/${safeFormId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch form (${res.status})`);
  }

  return res.json();
}

/**
 * Fetches responses for a given Google Form
 */
export async function getGoogleFormResponses(formId: string): Promise<any[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google authentication required');
  }

  const safeFormId = encodeURIComponent(formId.trim());
  const res = await fetch(`https://forms.googleapis.com/v1/forms/${safeFormId}/responses`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch form responses (${res.status})`);
  }

  const data = await res.json();
  return data.responses || [];
}

/**
 * Synchronizes Google Form submissions into Firestore
 */
export async function syncGoogleFormResponsesToFirestore(
  formId: string
): Promise<{ importedCount: number }> {
  const form = await getGoogleFormDetails(formId);
  const responses = await getGoogleFormResponses(formId);

  // Map question titles to question IDs
  const titleToQId: Record<string, string> = {};
  if (form.items) {
    for (const item of form.items) {
      if (item.questionItem?.question?.questionId) {
        titleToQId[item.title.toLowerCase().trim()] = item.questionItem.question.questionId;
      }
    }
  }

  let importedCount = 0;

  for (const resp of responses) {
    const answers = resp.answers || {};

    const getAnswerValue = (matcher: string): string => {
      // Find matching question ID
      for (const [title, qId] of Object.entries(titleToQId)) {
        if (title.includes(matcher.toLowerCase())) {
          const ansObj = answers[qId];
          if (ansObj?.textAnswers?.answers?.[0]?.value) {
            return ansObj.textAnswers.answers[0].value.trim();
          }
        }
      }
      return '';
    };

    const fullName = getAnswerValue('name') || 'Google Form Registrant';
    const email = getAnswerValue('email') || 'support@tapmate.in';
    const mobile = getAnswerValue('mobile') || getAnswerValue('phone') || '+91 98765 43210';
    const productName = getAnswerValue('product') || 'Tapmate Product';
    const serialNumber = getAnswerValue('serial');
    const rawDate = getAnswerValue('date') || new Date().toISOString().slice(0, 10);
    const orderId = getAnswerValue('order') || getAnswerValue('invoice');
    const rawSource = getAnswerValue('purchased from') || getAnswerValue('source');

    let purchasedFrom: PurchaseSource = 'Online Marketplace';
    if (rawSource.includes('Official Website')) purchasedFrom = 'Tapmate Official Website';
    else if (rawSource.includes('Retail')) purchasedFrom = 'Retail Store / Dealer';
    else if (rawSource.includes('Other')) purchasedFrom = 'Other';

    try {
      const regPayload: Parameters<typeof createRegistration>[0] = {
        fullName,
        email,
        mobile,
        productName,
        purchaseDate: rawDate.slice(0, 10),
        purchasedFrom,
        agreedToTerms: true,
        adminNotes: `Synced from Google Form (${formId}) Response ID: ${resp.responseId}`,
      };
      if (serialNumber) regPayload.serialNumber = serialNumber;
      if (orderId) regPayload.orderId = orderId;

      await createRegistration(regPayload);
      importedCount++;
    } catch (e) {
      console.warn('Failed to import response row:', e);
    }
  }

  return { importedCount };
}
