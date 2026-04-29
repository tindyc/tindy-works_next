import path from 'path';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type Payload = Record<string, string | boolean>;

type ExpectedResult = {
  status: number;
  responseOk?: boolean;
};

type RunOptions = {
  requestIp?: string;
};

type DbExpected = {
  status: string;
  content: string;
  intent?: string;
};

type DbValidationResult = {
  passed: boolean;
  reason?: string;
};

type TestResult = {
  name: string;
  passed: boolean;
  status: number | null;
  requestId?: string;
  error?: string;
  responseBody?: unknown;
  dbValidation?: boolean;
  notes?: string;
};

type RawResponseBody = {
  ok?: boolean;
  requestId?: string;
  error?: string;
  [key: string]: unknown;
};

const API_URL = 'http://localhost:3000/api/contact';
const RESULTS_DIR = path.join(process.cwd(), 'test-results');

let supabase: SupabaseClient | null = null;

async function loadLocalEnv() {
  const envFiles = ['.env.local', '.env'];

  for (const envFile of envFiles) {
    try {
      const filePath = path.join(process.cwd(), envFile);
      const content = await readFile(filePath, 'utf8');

      for (const line of content.split(/\r?\n/)) {
        const trimmedLine = line.trim();

        if (!trimmedLine || trimmedLine.startsWith('#')) {
          continue;
        }

        const equalsIndex = trimmedLine.indexOf('=');
        if (equalsIndex === -1) {
          continue;
        }

        const key = trimmedLine.slice(0, equalsIndex).trim();
        let value = trimmedLine.slice(equalsIndex + 1).trim();

        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        if (!process.env[key] && value) {
          process.env[key] = value;
        }
      }

      return;
    } catch {
      continue;
    }
  }
}

function createSupabaseVerificationClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY?.trim();

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set for DB validation.');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase verification client has not been initialized.');
  }

  return supabase;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toBodyText(body: unknown) {
  if (body === null || body === undefined) {
    return String(body);
  }

  if (typeof body === 'string') {
    return body;
  }

  return JSON.stringify(body);
}

function getDeterministicIp(payload: Payload) {
  const source = JSON.stringify(payload);
  let hash = 0;

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
  }

  const lastOctet = (hash % 250) + 2;
  return `127.0.0.${lastOctet}`;
}

function parseResponseBody(text: string): unknown {
  if (!text) {
    return '';
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function extractRequestId(body: unknown) {
  if (!body || typeof body !== 'object') {
    return undefined;
  }

  const requestId = (body as RawResponseBody).requestId;
  return typeof requestId === 'string' && requestId.trim() ? requestId : undefined;
}

async function runTest(
  name: string,
  payload: Payload,
  expected: ExpectedResult,
  options: RunOptions = {},
): Promise<TestResult> {
  const requestIp = options.requestIp ?? getDeterministicIp(payload);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': requestIp,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    const responseBody = parseResponseBody(responseText);
    const requestId = extractRequestId(responseBody);
    const bodyOk =
      typeof responseBody === 'object' &&
      responseBody !== null &&
      (responseBody as RawResponseBody).ok === true;

    const passed =
      response.status === expected.status &&
      (expected.responseOk === undefined || bodyOk === expected.responseOk);

    if (passed) {
      console.log(`[PASS] ${name} (${response.status})`);
    } else {
      const expectedSuffix = expected.responseOk === undefined ? '' : `, response.ok ${expected.responseOk}`;
      const actualSuffix = expected.responseOk === undefined ? '' : `, response.ok ${bodyOk}`;
      console.log(
        `[FAIL] ${name} (expected ${expected.status}${expectedSuffix}, got ${response.status}${actualSuffix})`,
      );
    }

    console.log(`  body: ${toBodyText(responseBody)}`);

    return {
      name,
      passed,
      status: response.status,
      requestId,
      responseBody,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`[FAIL] ${name} (request failed: ${message})`);
    console.log(`  body: ${message}`);

    return {
      name,
      passed: false,
      status: null,
      error: message,
      responseBody: null,
    };
  }
}

async function verifyDbRecord(requestId: string, expected: DbExpected): Promise<DbValidationResult> {
  const client = getSupabaseClient();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data, error } = await client
      .from('submissions')
      .select('request_id, content, status, intent')
      .eq('request_id', requestId)
      .maybeSingle();

    if (error) {
      const reason = `query failed: ${error.message}`;
      console.log(`[FAIL] DB validation (${requestId}): ${reason}`);
      return { passed: false, reason };
    }

    if (!data) {
      if (attempt < 2) {
        await sleep(150);
        continue;
      }

      const reason = 'record not found';
      console.log(`[FAIL] DB validation (${requestId}): ${reason}`);
      return { passed: false, reason };
    }

    if (data.content !== expected.content) {
      const reason = `content mismatch (expected ${toBodyText(expected.content)}, got ${toBodyText(data.content)})`;
      console.log(`[FAIL] DB validation (${requestId}): ${reason}`);
      return { passed: false, reason };
    }

    if (data.status !== expected.status) {
      const reason = `status mismatch (expected ${expected.status}, got ${data.status})`;
      console.log(`[FAIL] DB validation (${requestId}): ${reason}`);
      return { passed: false, reason };
    }

    if (expected.intent && data.intent !== expected.intent) {
      const reason = `intent mismatch (expected ${expected.intent}, got ${data.intent ?? 'null'})`;
      console.log(`[FAIL] DB validation (${requestId}): ${reason}`);
      return { passed: false, reason };
    }

    console.log(`[PASS] DB validation (${requestId})`);
    return { passed: true };
  }

  const reason = 'record validation timed out';
  console.log(`[FAIL] DB validation (${requestId}): ${reason}`);
  return { passed: false, reason };
}

function createTimestamp() {
  return new Date().toISOString();
}

function createResultsFilename(timestamp: string) {
  return `submissions-${timestamp.replace(/:/g, '-').replace(/\.\d{3}Z$/, '')}.json`;
}

function updateResultAfterDbValidation(result: TestResult, validation: DbValidationResult) {
  result.dbValidation = validation.passed;

  if (!validation.passed) {
    result.passed = false;
    result.error = result.error ? `${result.error}; ${validation.reason}` : validation.reason;
  }
}

function buildFailureList(results: TestResult[]) {
  return results.filter((result) => !result.passed).map((result) => result.name);
}

async function main() {
  await loadLocalEnv();
  supabase = createSupabaseVerificationClient();

  await mkdir(RESULTS_DIR, { recursive: true });

  const timestamp = createTimestamp();
  const resultsFilename = createResultsFilename(timestamp);
  const resultsPath = path.join(RESULTS_DIR, resultsFilename);

  const results: TestResult[] = [];

  const happyPathPayload = {
    intent: 'general',
    name: 'Test User',
    email: 'tindyc@bath.edu',
    contactMethod: 'email',
    message: 'This is a valid test message with enough length.',
  };

  const happyPath = await runTest('Happy path', happyPathPayload, { status: 200, responseOk: true });
  if (happyPath.requestId) {
    updateResultAfterDbValidation(
      happyPath,
      await verifyDbRecord(happyPath.requestId, {
        status: 'sent',
        content: happyPathPayload.message,
      }),
    );
  }
  results.push(happyPath);
  await sleep(250);

  const invalidShortMessage = await runTest(
    'Invalid payload (short message)',
    {
      intent: 'general',
      name: 'Test User',
      email: 'tindyc@bath.edu',
      contactMethod: 'email',
      message: 'short',
    },
    { status: 400 },
  );
  results.push(invalidShortMessage);
  await sleep(250);

  const smsPayload = {
    intent: 'general',
    name: 'SMS User',
    phone: '+447123456789',
    contactMethod: 'sms',
    message: 'Testing SMS flow with valid message content.',
  };

  const smsPath = await runTest('No email (SMS path)', smsPayload, { status: 200, responseOk: true });
  if (smsPath.requestId) {
    updateResultAfterDbValidation(
      smsPath,
      await verifyDbRecord(smsPath.requestId, {
        status: 'sent',
        content: smsPayload.message,
      }),
    );
  }
  results.push(smsPath);
  await sleep(250);

  const duplicatePayload = {
    intent: 'general',
    name: 'Duplicate User',
    email: 'tindyc@bath.edu',
    contactMethod: 'email',
    message: 'Duplicate submission payload with enough length.',
  };

  const duplicateFirst = await runTest('Duplicate submission (first)', duplicatePayload, {
    status: 200,
    responseOk: true,
  });
  const duplicateSecond = await runTest('Duplicate submission (second)', duplicatePayload, {
    status: 429,
  });
  const duplicateStatuses = [duplicateFirst.status, duplicateSecond.status];
  const duplicatePattern = '200 -> 429';
  const duplicatePassed = duplicateStatuses[0] === 200 && duplicateStatuses[1] === 429;
  console.log(`[${duplicatePassed ? 'PASS' : 'FAIL'}] Duplicate submission (${duplicatePattern})`);
  results.push({
    name: 'Duplicate submission',
    passed: duplicatePassed,
    status: duplicateSecond.status,
    responseBody: {
      first: duplicateFirst.responseBody,
      second: duplicateSecond.responseBody,
    },
    notes: duplicatePattern,
  });
  await sleep(250);

  const rateLimitRequests: TestResult[] = [];
  for (let index = 1; index <= 6; index += 1) {
    const rateLimitPayload = {
      intent: 'general',
      name: `Rate Limit User ${index}`,
      email: 'tindyc@bath.edu',
      contactMethod: 'email',
      message: `Rate limit test payload ${index} with enough length and a unique fingerprint.`,
    };

    rateLimitRequests.push(
      await runTest(
        `Rate limit request ${index}`,
        rateLimitPayload,
        { status: index <= 5 ? 200 : 429 },
        { requestIp: '127.0.0.42' },
      ),
    );
  }

  const rateLimitStatuses = rateLimitRequests.map((result) => result.status);
  const rateLimitPattern = [200, 200, 200, 200, 200, 429];
  const rateLimitPassed =
    rateLimitStatuses.length === rateLimitPattern.length &&
    rateLimitStatuses.every((status, index) => status === rateLimitPattern[index]);
  console.log(
    `[${rateLimitPassed ? 'PASS' : 'FAIL'}] Rate limit test ([${rateLimitStatuses.join(', ')}])`,
  );
  results.push({
    name: 'Rate limit test',
    passed: rateLimitPassed,
    status: rateLimitRequests[rateLimitRequests.length - 1]?.status ?? null,
    requestId: rateLimitRequests[rateLimitRequests.length - 1]?.requestId,
    responseBody: {
      statuses: rateLimitStatuses,
      bodies: rateLimitRequests.map((result) => result.responseBody),
    },
    notes: `expected=[${rateLimitPattern.join(', ')}], actual=[${rateLimitStatuses.join(', ')}]`,
  });
  await sleep(250);

  const emailFailurePayload = {
    intent: 'general',
    name: 'Fail Email',
    email: 'bad..bad,bad@gmail.com',
    contactMethod: 'email',
    message: 'Trigger resend sandbox failure.',
  };

  const emailFailure = await runTest('Email failure scenario', emailFailurePayload, {
    status: 200,
    responseOk: true,
  });
  if (emailFailure.requestId) {
    updateResultAfterDbValidation(
      emailFailure,
      await verifyDbRecord(emailFailure.requestId, {
        status: 'failed',
        content: emailFailurePayload.message,
      }),
    );
  }
  results.push(emailFailure);
  await sleep(250);

  const supportPayload = {
    intent: 'client',
    name: 'Support User',
    email: 'tindyc@bath.edu',
    contactMethod: 'email',
    message: 'Need help with a project workflow and data sync.',
    consentRequired: 'true',
    metadata: JSON.stringify({
      projectGoal: 'workflow-automation',
      issueType: 'integration',
      priority: 'medium',
    }),
  };

  const supportResult = await runTest('Support flow (client)', supportPayload, {
    status: 200,
    responseOk: true,
  });
  if (supportResult.requestId) {
    updateResultAfterDbValidation(
      supportResult,
      await verifyDbRecord(supportResult.requestId, {
        status: 'sent',
        content: supportPayload.message,
        intent: 'client',
      }),
    );
  }
  results.push(supportResult);

  const total = results.length;
  const passed = results.filter((result) => result.passed).length;
  const failed = total - passed;
  const failureNames = buildFailureList(results);

  const resultsFile = {
    timestamp,
    total,
    passed,
    failed,
    results,
  };

  await writeFile(resultsPath, `${JSON.stringify(resultsFile, null, 2)}\n`, 'utf8');

  console.log('');
  console.log('--------------------------------');
  console.log('TEST SUMMARY');
  console.log('--------------------------------');
  console.log(`Total tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failureNames.length > 0) {
    console.log('');
    console.log('--------------------------------');
    console.log('FAILED TESTS');
    console.log('--------------------------------');
    for (const name of failureNames) {
      console.log(name);
    }
  }

  console.log(`Saved results to: test-results/${resultsFilename}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[FAIL] Test run aborted: ${message}`);
  process.exitCode = 1;
});