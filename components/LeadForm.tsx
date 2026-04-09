'use client';

import { useState } from 'react';

const COUNTRIES = [
  'india', 'united states', 'united kingdom', 'germany', 'france', 'canada',
  'australia', 'singapore', 'united arab emirates', 'south africa', 'netherlands',
  'italy', 'spain', 'brazil', 'mexico', 'indonesia', 'philippines', 'malaysia',
  'nigeria', 'kenya', 'saudi arabia', 'israel', 'turkey', 'japan', 'china',
  'south korea', 'hong kong', 'taiwan', 'new zealand', 'ireland', 'switzerland',
  'sweden', 'norway', 'denmark', 'finland', 'poland', 'portugal', 'belgium',
  'austria', 'czech republic', 'romania', 'hungary', 'ukraine', 'russia',
  'pakistan', 'bangladesh', 'sri lanka', 'egypt', 'morocco', 'ghana',
  'colombia', 'argentina', 'chile', 'peru', 'qatar', 'kuwait', 'bahrain', 'oman',
];

type FormState = 'idle' | 'loading' | 'success' | 'error';
type ExecutionStatus = 'running' | 'success' | 'error' | 'waiting' | null;

interface SubmitResult {
  status: string;
  message: string;
  sheets_url: string;
  execution_id?: string;
}

interface StatusResult {
  status: ExecutionStatus;
  stoppedAt: string | null;
  errorMessage: string | null;
}

export default function LeadForm() {
  const [formState, setFormState] = useState<FormState>('idle');
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>(null);
  const [executionError, setExecutionError] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(false);

  async function handleSubmit(e: { preventDefault(): void; currentTarget: HTMLFormElement }) {
    e.preventDefault();
    setFormState('loading');
    setResult(null);
    setErrorMsg('');
    setExecutionStatus(null);
    setExecutionError('');

    const form = e.currentTarget;
    const data = {
      'Your Name': (form.elements.namedItem('yourName') as HTMLInputElement).value,
      'About your Product': (form.elements.namedItem('aboutProduct') as HTMLTextAreaElement).value,
      'Designation': (form.elements.namedItem('designation') as HTMLInputElement).value,
      'Location': (form.elements.namedItem('location') as HTMLSelectElement).value,
      'Keywords': (form.elements.namedItem('keywords') as HTMLInputElement).value,
      'Product URL': (form.elements.namedItem('productUrl') as HTMLInputElement).value,
    };

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json.error || (res.status >= 500
          ? 'The automation server returned an error. Try again in a moment.'
          : 'Submission failed. Check your inputs and try again.');
        throw new Error(msg);
      }
      setResult(json);
      setFormState('success');
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setErrorMsg('Could not reach the server. Check your internet connection.');
      } else {
        setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
      }
      setFormState('error');
    }
  }

  async function checkStatus() {
    if (!result?.execution_id) return;
    setCheckingStatus(true);
    setExecutionStatus(null);
    setExecutionError('');
    try {
      const res = await fetch(`/api/status/${result.execution_id}`);
      const json: StatusResult = await res.json();
      if (!res.ok) throw new Error((json as { error?: string }).error || 'Status check failed');
      setExecutionStatus(json.status);
      if (json.status === 'error') {
        setExecutionError(json.errorMessage || 'The workflow failed with an unknown error.');
      }
    } catch (err) {
      setExecutionError(err instanceof Error ? err.message : 'Could not fetch status.');
      setExecutionStatus('error');
    } finally {
      setCheckingStatus(false);
    }
  }

  return (
    <div className="w-full max-w-xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">B2B Lead Generator</h1>
      <p className="text-sm text-gray-500 mb-8">
        Fill in the details below. Personalised icebreakers will appear in your Google Sheet.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Your Name" required>
          <input
            name="yourName"
            type="text"
            required
            placeholder="Jane Smith"
            className={inputClass}
          />
        </Field>

        <Field label="About your Product" required>
          <textarea
            name="aboutProduct"
            required
            rows={3}
            placeholder="Describe what your product does and why it's valuable..."
            className={inputClass}
          />
        </Field>

        <Field label="Target Designation" hint="e.g. CEO, Head of Marketing" required>
          <input
            name="designation"
            type="text"
            required
            placeholder="CEO"
            className={inputClass}
          />
        </Field>

        <Field label="Target Country" required>
          <select name="location" required className={inputClass}>
            <option value="">Select a country…</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c.replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Keywords" hint="Industry or niche keywords, comma-separated">
          <input
            name="keywords"
            type="text"
            placeholder="SaaS, outreach, sales automation"
            className={inputClass}
          />
        </Field>

        <Field label="Product URL" required>
          <input
            name="productUrl"
            type="url"
            required
            placeholder="https://yourproduct.com"
            className={inputClass}
          />
        </Field>

        <button
          type="submit"
          disabled={formState === 'loading'}
          className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {formState === 'loading' ? 'Generating leads…' : 'Generate Icebreakers'}
        </button>
      </form>

      {formState === 'success' && result && (
        <div className="mt-6 space-y-3">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">{result.message}</p>
            <a
              href={result.sheets_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-green-700 underline hover:text-green-900"
            >
              Open Google Sheet →
            </a>
          </div>

          {result.execution_id && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Check if the workflow completed successfully:</p>
                <button
                  onClick={checkStatus}
                  disabled={checkingStatus}
                  className="ml-3 rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkingStatus ? 'Checking…' : 'Check Status'}
                </button>
              </div>

              {executionStatus === 'running' || executionStatus === 'waiting' ? (
                <p className="mt-2 text-sm text-yellow-700">
                  ⏳ Still running — try again in a few seconds.
                </p>
              ) : executionStatus === 'success' ? (
                <p className="mt-2 text-sm text-green-700">
                  ✓ Workflow completed — check your Google Sheet for new leads.
                </p>
              ) : executionStatus === 'error' ? (
                <div className="mt-2 rounded border border-red-200 bg-red-50 p-3">
                  <p className="text-xs font-semibold text-red-700 mb-1">Workflow error:</p>
                  <p className="text-xs text-red-600 font-mono break-all">{executionError}</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {formState === 'error' && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700 mb-1">Submission failed</p>
          <p className="text-sm text-red-600">{errorMsg}</p>
        </div>
      )}
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400';

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
        {hint && <span className="ml-1 font-normal text-gray-400">({hint})</span>}
      </label>
      {children}
    </div>
  );
}
