'use client';

import { useState } from 'react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

interface SubmitResult {
  status: string;
  message: string;
  sheets_url: string;
}

export default function LeadForm() {
  const [state, setState] = useState<FormState>('idle');
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('loading');
    setResult(null);
    setErrorMsg('');

    const form = e.currentTarget;
    const data = {
      'Your Name': (form.elements.namedItem('yourName') as HTMLInputElement).value,
      'About your Product': (form.elements.namedItem('aboutProduct') as HTMLTextAreaElement).value,
      'Designation': (form.elements.namedItem('designation') as HTMLInputElement).value,
      'Location': (form.elements.namedItem('location') as HTMLInputElement).value,
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
      if (!res.ok) throw new Error(json.error || 'Submission failed');
      setResult(json);
      setState('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setState('error');
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

        <Field label="Location" hint="City or country to target" required>
          <input
            name="location"
            type="text"
            required
            placeholder="Mumbai, India"
            className={inputClass}
          />
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
          disabled={state === 'loading'}
          className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state === 'loading' ? 'Generating leads…' : 'Generate Icebreakers'}
        </button>
      </form>

      {state === 'success' && result && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
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
      )}

      {state === 'error' && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{errorMsg}</p>
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
