import { useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Upload, CheckCircle, Loader, FileText, Send } from 'lucide-react';

export function Intake() {
  const { isDark } = useTheme();
  const { t } = useLocale();
  const { user } = useAuth();
  const [tab, setTab] = useState<'ask' | 'onedrop' | 'requests'>('onedrop');
  const [uploading, setUploading] = useState(false);
  const [extracted, setExtracted] = useState<any>(null);
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    setUploading(true);

    setTimeout(() => {
      setExtracted({
        type: 'NDA',
        parties: ['tesa SE', 'Example Partner GmbH'],
        effectiveDate: '2025-01-15',
        jurisdiction: 'Germany',
        language: 'de',
        confidence: 0.92,
      });
      setUploading(false);
    }, 2000);
  }

  async function createCLMRequest() {
    if (!user || !extracted) return;

    const { data } = await supabase
      .from('intake_requests')
      .insert({
        type: 'one-drop',
        created_by: user.id,
        extracted_metadata: extracted,
        status: 'pending',
      })
      .select()
      .single();

    if (data) {
      alert('CLM Request Created: #' + data.id.slice(0, 8));
      setExtracted(null);
    }
  }

  async function submitQuestion() {
    if (!user || !question.trim()) return;

    setSubmitting(true);

    const { data } = await supabase
      .from('intake_requests')
      .insert({
        type: 'question',
        created_by: user.id,
        extracted_metadata: { question: question.trim() },
        status: 'pending',
      })
      .select()
      .single();

    setSubmitting(false);

    if (data) {
      alert('Question submitted successfully! Request ID: #' + data.id.slice(0, 8));
      setQuestion('');
      setTab('requests');
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-6`}>{t.intake.title}</h1>

      <div className={`border-b ${isDark ? "border-slate-700" : "border-slate-200"} mb-6`}>
        <div className="flex gap-4">
          {(['ask', 'onedrop', 'requests'] as const).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`px-4 py-2 border-b-2 transition-colors ${
                tab === tabKey
                  ? `border-tesa-blue font-medium ${isDark ? 'text-tesa-blue' : 'text-tesa-blue'}`
                  : `border-transparent ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'}`
              }`}
            >
              {tabKey === 'ask' && 'Ask Helpdesk'}
              {tabKey === 'onedrop' && 'Upload Documents'}
              {tabKey === 'requests' && 'My Requests'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'onedrop' && (
        <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-xl border-2 border-dashed border-slate-300 p-12 text-center`}>
          {uploading ? (
            <div className="py-12">
              <Loader className="animate-spin mx-auto mb-4 text-tesa-blue" size={48} />
              <p className="text-slate-700 font-medium">{t.intake.extracting}</p>
            </div>
          ) : extracted ? (
            <div className="max-w-2xl mx-auto">
              <CheckCircle size={64} className="mx-auto mb-4 text-green-600" />
              <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-6`}>Metadata Extracted</h2>

              <div className="bg-slate-50 rounded-lg p-6 text-left space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"} mb-1`}>Contract Type</div>
                    <div className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{extracted.type}</div>
                  </div>
                  <div>
                    <div className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"} mb-1`}>Jurisdiction</div>
                    <div className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{extracted.jurisdiction}</div>
                  </div>
                  <div>
                    <div className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"} mb-1`}>Language</div>
                    <div className={`font-medium ${isDark ? "text-white" : "text-slate-900"} uppercase`}>{extracted.language}</div>
                  </div>
                  <div>
                    <div className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"} mb-1`}>Effective Date</div>
                    <div className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{extracted.effectiveDate}</div>
                  </div>
                </div>

                <div>
                  <div className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"} mb-1`}>Parties</div>
                  <div className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                    {extracted.parties.join(' ↔ ')}
                  </div>
                </div>

                <div className={`flex items-center justify-between pt-4 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                  <div className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    Confidence: {Math.round(extracted.confidence * 100)}%
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setExtracted(null)}
                      className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createCLMRequest}
                      className="px-6 py-2 bg-tesa-blue text-white rounded-lg hover:bg-tesa-blue hover:brightness-110 flex items-center gap-2"
                    >
                      <Send size={18} />
                      {t.intake.createRequest}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="cursor-pointer"
            >
              <Upload size={64} className="mx-auto mb-4 text-slate-400" />
              <p className="text-lg font-medium text-slate-700 mb-2">{t.intake.dropzone}</p>
              <p className="text-sm text-slate-500">PDF, DOCX up to 50MB</p>
            </div>
          )}
        </div>
      )}

      {tab === 'ask' && (
        <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-8`}>
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className={`text-xl font-semibold ${isDark ? "text-white" : "text-slate-900"} mb-2`}>
                Ask the Legal Helpdesk
              </h2>
              <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Submit questions to the legal team for guidance on contracts, compliance, or general legal matters.
              </p>
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Your Question *
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className={`w-full p-4 border rounded-lg ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'border-slate-300 placeholder-slate-400'}`}
                rows={6}
                placeholder="Example: What are the key clauses I should review in a supplier agreement for the DACH region?"
              />
            </div>

            <div className="flex items-center justify-between">
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Typical response time: 1-2 business days
              </p>
              <button
                onClick={submitQuestion}
                disabled={!question.trim() || submitting}
                className="px-6 py-2 bg-tesa-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Question
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'requests' && (
        <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-6`}>
          <p className="text-slate-500">Your intake requests will appear here</p>
        </div>
      )}
    </div>
  );
}
