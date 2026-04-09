'use client'

import { useState } from 'react'

const MSA1_ABOUT =
  'MSA1 Power Tools manufactures professional-grade power tools including drill machines, grinders, cutters, cleaning tools, cutting tools, and gardening tools. Built for reliability and performance, MSA1 tools are trusted by construction companies, fabrication workshops, agriculture sector, and government establishments across India.'

const INDUSTRIES = [
  { id: 'army', label: 'Army & Defense', icon: '🛡️' },
  { id: 'agriculture', label: 'Agriculture', icon: '🌾' },
  { id: 'construction', label: 'Construction & Infrastructure', icon: '🏗️' },
  { id: 'workshops', label: 'Workshops & Manufacturing', icon: '⚙️' },
  { id: 'govt', label: 'Government / PSU', icon: '🏛️' },
  { id: 'fabrication', label: 'Fabrication & Engineering', icon: '🔧' },
]

const INDIAN_STATES = [
  'Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Rajasthan',
  'Uttar Pradesh', 'Delhi', 'Punjab', 'Haryana', 'Madhya Pradesh',
  'West Bengal', 'Telangana', 'Andhra Pradesh', 'Kerala', 'Bihar',
  'Odisha', 'Jharkhand', 'Chhattisgarh', 'Uttarakhand', 'Goa',
  'Himachal Pradesh', 'Assam', 'Jammu & Kashmir',
]

type FormState = 'idle' | 'loading' | 'success' | 'error'

interface Result {
  message: string
  sheets_url: string
  execution_id?: string
}

export default function LeadForm() {
  const [name, setName] = useState('Abhijit')
  const [aboutProduct, setAboutProduct] = useState(MSA1_ABOUT)
  const [productUrl, setProductUrl] = useState('https://msa1tools.com')
  const [city, setCity] = useState('')
  const [state, setState] = useState('Maharashtra')
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [formState, setFormState] = useState<FormState>('idle')
  const [result, setResult] = useState<Result | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [statusMsg, setStatusMsg] = useState('')

  function toggleIndustry(label: string) {
    setSelectedIndustries(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (selectedIndustries.length === 0) {
      setErrorMsg('Please select at least one industry.')
      return
    }
    setErrorMsg('')
    setFormState('loading')
    setResult(null)

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, aboutProduct, productUrl, city, state, industries: selectedIndustries }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setResult(data)
      setFormState('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error')
      setFormState('error')
    }
  }

  async function checkStatus() {
    if (!result?.execution_id) return
    setStatusMsg('Checking…')
    try {
      const res = await fetch(`/api/status/${result.execution_id}`)
      const data = await res.json()
      if (data.status === 'success') setStatusMsg('✅ Workflow completed successfully.')
      else if (data.status === 'error') setStatusMsg(`❌ ${data.error || 'Workflow failed.'}`)
      else if (data.status === 'running') setStatusMsg('⏳ Still running — check again in a moment.')
      else setStatusMsg(`Status: ${data.status}`)
    } catch {
      setStatusMsg('Could not fetch status.')
    }
  }

  const industryCount = selectedIndustries.length

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f1117', color: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#1a1d27', borderBottom: '1px solid #2d3142' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'linear-gradient(135deg, #dc2626, #991b1b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 900, color: '#fbbf24', flexShrink: 0,
            }}>M</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>
                MSA1 B2B Lead Generator
              </h1>
              <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                Google Maps · Maharashtra · Power Tools
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px' }}>
        <form onSubmit={handleSubmit}>

          {/* YOUR DETAILS */}
          <Section title="YOUR DETAILS">
            <Field label="Your Name">
              <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Abhijit" />
            </Field>
            <Field label="About your Product">
              <textarea
                value={aboutProduct}
                onChange={e => setAboutProduct(e.target.value)}
                required
                rows={4}
                style={textareaStyle}
              />
            </Field>
            <Field label="Product URL">
              <Input value={productUrl} onChange={e => setProductUrl(e.target.value)} required placeholder="https://msa1tools.com" />
            </Field>
          </Section>

          {/* LOCATION */}
          <Section title="LOCATION">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="City *">
                <Input
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  required
                  placeholder="e.g. Pune, Nashik, Nagpur"
                />
              </Field>
              <Field label="State">
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  style={selectStyle}
                >
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>
          </Section>

          {/* TARGET INDUSTRIES */}
          <Section title="TARGET INDUSTRIES" subtitle="Select one or more — up to 20 leads each via Google Maps">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {INDUSTRIES.map(ind => {
                const checked = selectedIndustries.includes(ind.label)
                return (
                  <button
                    key={ind.id}
                    type="button"
                    onClick={() => toggleIndustry(ind.label)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                      border: checked ? '2px solid #dc2626' : '2px solid #2d3142',
                      backgroundColor: checked ? '#1f1214' : '#1a1d27',
                      color: checked ? '#f1f5f9' : '#94a3b8',
                      textAlign: 'left', fontSize: 14, fontWeight: checked ? 600 : 400,
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{
                      width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                      border: checked ? '2px solid #dc2626' : '2px solid #475569',
                      backgroundColor: checked ? '#dc2626' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: '#fff',
                    }}>
                      {checked ? '✓' : ''}
                    </span>
                    <span>{ind.icon} {ind.label}</span>
                  </button>
                )
              })}
            </div>
            {errorMsg && <p style={{ marginTop: 10, color: '#f87171', fontSize: 13 }}>{errorMsg}</p>}
          </Section>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={formState === 'loading'}
            style={{
              width: '100%', padding: '14px', borderRadius: 8, border: 'none',
              backgroundColor: formState === 'loading' ? '#7f1d1d' : '#dc2626',
              color: '#fff', fontSize: 16, fontWeight: 700, cursor: formState === 'loading' ? 'not-allowed' : 'pointer',
              marginTop: 8, transition: 'background-color 0.15s',
            }}
          >
            {formState === 'loading'
              ? `🔍 Searching ${industryCount} industr${industryCount === 1 ? 'y' : 'ies'} on Google Maps…`
              : '🚀 Find Leads'}
          </button>
        </form>

        {/* SUCCESS */}
        {formState === 'success' && result && (
          <div style={{ marginTop: 24, borderRadius: 10, border: '1px solid #166534', backgroundColor: '#052e16', overflow: 'hidden' }}>
            <div style={{ padding: 20 }}>
              <p style={{ margin: '0 0 10px', fontWeight: 600, color: '#4ade80', fontSize: 14 }}>
                {result.message}
              </p>
              <a
                href={result.sheets_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#4ade80', fontSize: 14, fontWeight: 600 }}
              >
                Open Google Sheet →
              </a>
            </div>

            {result.execution_id && (
              <div style={{ padding: '14px 20px', borderTop: '1px solid #166534', backgroundColor: '#041a0e' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <span style={{ color: '#86efac', fontSize: 13 }}>Check if the workflow completed successfully:</span>
                  <button
                    onClick={checkStatus}
                    style={{
                      padding: '6px 16px', borderRadius: 6, border: 'none',
                      backgroundColor: '#1f2937', color: '#f1f5f9', fontSize: 13,
                      cursor: 'pointer', fontWeight: 600,
                    }}
                  >
                    Check Status
                  </button>
                </div>
                {statusMsg && (
                  <div style={{
                    marginTop: 12, padding: '10px 14px', borderRadius: 6,
                    border: `1px solid ${statusMsg.startsWith('✅') ? '#166534' : statusMsg.startsWith('❌') ? '#7f1d1d' : '#78350f'}`,
                    backgroundColor: statusMsg.startsWith('✅') ? '#052e16' : statusMsg.startsWith('❌') ? '#1c0a0a' : '#1c1008',
                  }}>
                    {statusMsg.startsWith('❌') && (
                      <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#f87171', fontSize: 13 }}>Workflow error:</p>
                    )}
                    <p style={{ margin: 0, fontSize: 13, fontFamily: 'monospace', color: statusMsg.startsWith('✅') ? '#4ade80' : statusMsg.startsWith('❌') ? '#fca5a5' : '#fbbf24' }}>
                      {statusMsg.replace(/^[✅❌⏳]\s*/, '')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ERROR */}
        {formState === 'error' && (
          <div style={{ marginTop: 24, padding: 16, borderRadius: 10, border: '1px solid #7f1d1d', backgroundColor: '#1c0a0a' }}>
            <p style={{ margin: 0, color: '#f87171', fontSize: 14, fontWeight: 600 }}>❌ Submission failed</p>
            <p style={{ margin: '4px 0 0', color: '#fca5a5', fontSize: 13 }}>{errorMsg}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28, backgroundColor: '#1a1d27', borderRadius: 10, border: '1px solid #2d3142', overflow: 'hidden' }}>
      <div style={{ padding: '12px 18px', borderBottom: '1px solid #2d3142', backgroundColor: '#161820' }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#94a3b8' }}>{title}</p>
        {subtitle && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#64748b' }}>{subtitle}</p>}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, required, placeholder }: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  placeholder?: string
}) {
  return (
    <input
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      style={inputStyle}
    />
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 6,
  border: '1px solid #2d3142', backgroundColor: '#0f1117',
  color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box',
}

const textareaStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 6,
  border: '1px solid #2d3142', backgroundColor: '#0f1117',
  color: '#f1f5f9', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box',
  fontFamily: 'system-ui, sans-serif',
}

const selectStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 6,
  border: '1px solid #2d3142', backgroundColor: '#0f1117',
  color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box',
}
