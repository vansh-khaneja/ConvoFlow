/**
 * Provider configuration for credentials management
 */
import { Key } from 'lucide-react';
import { Provider } from '@/hooks/useCredentialsForm';

export const providers: Provider[] = [
  { key: 'CUSTOM', label: 'Custom', desc: 'Custom environment variables', icon: Key },
  { key: 'OPENAI_API_KEY', label: 'OpenAI', desc: 'OpenAI API access', image: '/providers/openai.png' },
  { key: 'GROQ_API_KEY', label: 'Groq', desc: 'Groq LPU models', image: '/providers/groq.png' },
  { key: 'TAVILY_API_KEY', label: 'Tavily', desc: 'Web search API', image: '/providers/tavily-color.png' },
  { key: 'RESEND_API_KEY', label: 'Resend', desc: 'Email API service', image: '/providers/resend.png' },
  { 
    key: 'QDRANT_API_KEY', 
    label: 'Qdrant', 
    desc: 'Vector database API', 
    image: '/providers/qdrant.png',
    fields: [
      { key: 'QDRANT_API_KEY', label: 'API Key', type: 'password', placeholder: 'Enter Qdrant API key', required: true },
      { key: 'QDRANT_URL', label: 'Host URL', type: 'url', placeholder: 'https://your-cluster.qdrant.io', required: true },
    ]
  },
  { 
    key: 'POSTGRES_DB_URL', 
    label: 'Postgres', 
    desc: 'Connection string for Postgres-compatible databases', 
    image: '/providers/postgres.png',
    fields: [
      { key: 'POSTGRES_DB_URL', label: 'Database URL', type: 'url', placeholder: 'postgres://user:pass@host:5432/dbname', required: true }
    ]
  },
  { key: 'HUGGINGFACE_API_KEY', label: 'Hugging Face', desc: 'Models requiring an access token', image: '/providers/huggingface-color.png' },
  { key: 'GEMINI_API_KEY', label: 'Gemini', desc: 'Google AI (Gemini) models', image: '/providers/gemini-color.png' },
  { key: 'ANTHROPIC_API_KEY', label: 'Anthropic', desc: 'Access Anthropic\'s Claude models', image: '/providers/anthropic.png' },
  { 
    key: 'TWILIO_ACCOUNT_SID', 
    label: 'Twilio', 
    desc: 'Send SMS and make calls via Twilio', 
    image: '/providers/twilio.png',
    fields: [
      { key: 'TWILIO_ACCOUNT_SID', label: 'Account SID', type: 'text', placeholder: 'Enter your Twilio Account SID', required: true },
      { key: 'TWILIO_AUTH_TOKEN', label: 'Auth Token', type: 'password', placeholder: 'Enter your Twilio Auth Token', required: true },
    ]
  },
];

