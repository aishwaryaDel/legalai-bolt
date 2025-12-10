import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useColors } from '../lib/colors';
import { useAuth } from '../contexts/AuthContext';
import { aiModels } from '../lib/config';
import { securityService } from '../lib/securityService';
import {
  Settings, Database, Key, Users, Shield, DollarSign, FileText,
  Activity, AlertTriangle, CheckCircle, Clock, Search, Filter,
  Download, Eye, Lock, Unlock
} from 'lucide-react';

interface AuditLog {
  id: string;
  user_id: string;
  action_type: string;
  resource_type: string;
  resource_id: string;
  details: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  users?: { email: string };
}

interface UserRole {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  last_login: string;
}

export function Admin() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const c = useColors(isDark);
  const [tab, setTab] = useState('audit');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterAction, setFilterAction] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'audit', label: 'Audit Logs', icon: Activity },
    { id: 'hallucination', label: 'AI Quality Control', icon: AlertTriangle },
    { id: 'roles', label: 'Roles & Permissions', icon: Users },
    { id: 'models', label: 'Models', icon: Database },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'cost', label: 'Cost', icon: DollarSign },
  ];

  useEffect(() => {
    if (user?.id) {
      if (tab === 'audit') {
        loadAuditLogs();
      } else if (tab === 'roles') {
        loadUserRoles();
      }
    }
  }, [tab, user]);

  async function loadAuditLogs() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          users:user_id (email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      if (data) {
        setAuditLogs(data);
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserRoles() {
    setLoading(true);
    try {
      // In a real implementation, this would query a user_roles table
      // For now, we'll show a placeholder structure
      setUserRoles([
        {
          id: '1',
          email: 'admin@tesa.com',
          role: 'Admin',
          permissions: ['all'],
          last_login: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'legal@tesa.com',
          role: 'Legal User',
          permissions: ['review', 'draft', 'copilot'],
          last_login: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error loading user roles:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = auditLogs.filter(log => {
    if (filterAction !== 'all' && log.action_type !== filterAction) return false;
    if (searchQuery && !log.action_type.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !log.resource_type.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getActionColor = (action: string) => {
    if (action.includes('delete') || action.includes('revoke')) return 'text-red-600';
    if (action.includes('create') || action.includes('grant')) return 'text-green-600';
    if (action.includes('update') || action.includes('modify')) return 'text-blue-600';
    return c.text.secondary;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${c.text.primary}`}>Admin Panel</h1>
        <p className={`text-sm ${c.text.secondary} mt-1`}>System administration, governance, and security monitoring</p>
      </div>

      <div className="flex gap-6">
        <aside className={`w-64 ${c.card.bg} rounded-lg border ${c.card.border} p-3`}>
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-1 ${
                  tab === t.id ? `bg-tesa-blue text-white` : `${c.text.primary} ${c.bg.hover}`
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{t.label}</span>
              </button>
            );
          })}
        </aside>

        <div className={`flex-1 ${c.card.bg} rounded-lg border ${c.card.border} p-6`}>
          {tab === 'audit' && (
            <div>
              <div className="mb-6">
                <h2 className={`text-xl font-semibold ${c.text.primary} mb-2`}>Audit Trail</h2>
                <p className={`text-sm ${c.text.secondary}`}>
                  Complete audit trail of all system activities for compliance and security monitoring
                </p>
              </div>

              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${c.text.muted}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by action or resource..."
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg ${c.input.bg} ${c.input.border} ${c.input.text}`}
                  />
                </div>
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className={`px-4 py-2 border rounded-lg ${c.input.bg} ${c.input.border} ${c.input.text}`}
                >
                  <option value="all">All Actions</option>
                  <option value="login">Login</option>
                  <option value="document_access">Document Access</option>
                  <option value="ai_query">AI Query</option>
                  <option value="export">Export</option>
                  <option value="delete">Delete</option>
                </select>
                <button className="px-4 py-2 bg-tesa-blue text-white rounded-lg hover:brightness-110 transition-all font-medium flex items-center gap-2">
                  <Download size={18} />
                  Export
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-tesa-blue"></div>
                  <p className={`mt-2 text-sm ${c.text.secondary}`}>Loading audit logs...</p>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <Activity size={48} className={`mx-auto mb-4 ${c.text.muted}`} />
                  <p className={`text-lg font-medium ${c.text.primary}`}>No audit logs found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`border ${c.border.primary} rounded-lg p-4 ${c.bg.hover} transition-colors`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`font-medium ${getActionColor(log.action_type)}`}>
                              {log.action_type.replace(/_/g, ' ').toUpperCase()}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${c.badge.info.bg} ${c.badge.info.text}`}>
                              {log.resource_type}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <Users size={12} className={c.text.muted} />
                              <span className={c.text.secondary}>{log.users?.email || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={12} className={c.text.muted} />
                              <span className={c.text.secondary}>
                                {new Date(log.created_at).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Shield size={12} className={c.text.muted} />
                              <span className={c.text.secondary}>{log.ip_address}</span>
                            </div>
                          </div>
                          {log.details && Object.keys(log.details).length > 0 && (
                            <div className={`mt-2 text-xs ${c.text.muted} font-mono`}>
                              {JSON.stringify(log.details, null, 2).substring(0, 100)}...
                            </div>
                          )}
                        </div>
                        <button className={`ml-4 p-2 ${c.bg.hover} rounded transition-colors`} title="View details">
                          <Eye size={16} className={c.text.secondary} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'hallucination' && (
            <div>
              <div className="mb-6">
                <h2 className={`text-xl font-semibold ${c.text.primary} mb-2`}>AI Quality Control & Hallucination Detection</h2>
                <p className={`text-sm ${c.text.secondary}`}>
                  Monitor AI response quality, detect hallucinations, and review flagged outputs
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={`p-4 ${c.bg.tertiary} rounded-lg`}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={20} className="text-green-600" />
                    <span className={`text-sm font-medium ${c.text.secondary}`}>High Quality</span>
                  </div>
                  <div className={`text-3xl font-bold ${c.text.primary}`}>94.2%</div>
                  <p className={`text-xs ${c.text.muted} mt-1`}>Responses with quality score &gt; 80</p>
                </div>
                <div className={`p-4 ${c.bg.tertiary} rounded-lg`}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={20} className="text-yellow-600" />
                    <span className={`text-sm font-medium ${c.text.secondary}`}>Flagged</span>
                  </div>
                  <div className={`text-3xl font-bold ${c.text.primary}`}>23</div>
                  <p className={`text-xs ${c.text.muted} mt-1`}>Potential hallucinations detected</p>
                </div>
                <div className={`p-4 ${c.bg.tertiary} rounded-lg`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={20} className="text-blue-600" />
                    <span className={`text-sm font-medium ${c.text.secondary}`}>Under Review</span>
                  </div>
                  <div className={`text-3xl font-bold ${c.text.primary}`}>7</div>
                  <p className={`text-xs ${c.text.muted} mt-1`}>Awaiting human validation</p>
                </div>
              </div>

              <div className={`border ${c.border.primary} rounded-lg p-6 mb-6`}>
                <h3 className={`font-semibold ${c.text.primary} mb-4`}>Detection Mechanisms</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${c.text.primary}`}>Confidence Score Threshold</span>
                    <span className={`text-sm ${c.badge.info.bg} ${c.badge.info.text} px-2 py-1 rounded`}>&lt; 70%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${c.text.primary}`}>Citation Validation</span>
                    <span className={`text-sm ${c.badge.success.bg} ${c.badge.success.text} px-2 py-1 rounded`}>Enabled</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${c.text.primary}`}>Legal Source Cross-Check</span>
                    <span className={`text-sm ${c.badge.success.bg} ${c.badge.success.text} px-2 py-1 rounded`}>Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${c.text.primary}`}>Semantic Consistency Check</span>
                    <span className={`text-sm ${c.badge.success.bg} ${c.badge.success.text} px-2 py-1 rounded`}>Active</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`font-semibold ${c.text.primary} mb-4`}>Recent Flagged Responses</h3>
                <p className={`text-sm ${c.text.muted} italic`}>Human-in-the-loop review queue</p>
              </div>
            </div>
          )}

          {tab === 'roles' && (
            <div>
              <div className="mb-6">
                <h2 className={`text-xl font-semibold ${c.text.primary} mb-2`}>Roles & Permissions (RBAC/ABAC)</h2>
                <p className={`text-sm ${c.text.secondary}`}>
                  Role-Based and Attribute-Based Access Control by module and contract type
                </p>
              </div>

              <div className="space-y-4">
                {userRoles.map((userRole) => (
                  <div
                    key={userRole.id}
                    className={`border ${c.border.primary} rounded-lg p-4`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${c.bg.tertiary} rounded-full flex items-center justify-center`}>
                          <Users size={20} className={c.text.secondary} />
                        </div>
                        <div>
                          <div className={`font-medium ${c.text.primary}`}>{userRole.email}</div>
                          <div className={`text-sm ${c.text.secondary}`}>{userRole.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className={`px-3 py-1.5 text-sm ${c.bg.tertiary} rounded hover:bg-opacity-80 transition-colors`}>
                          Edit
                        </button>
                        <button className={`p-1.5 ${c.bg.hover} rounded transition-colors`}>
                          {userRole.role === 'Admin' ? (
                            <Lock size={16} className="text-green-600" />
                          ) : (
                            <Unlock size={16} className={c.text.muted} />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {userRole.permissions.map((perm) => (
                        <span
                          key={perm}
                          className={`text-xs px-2 py-1 rounded ${c.badge.info.bg} ${c.badge.info.text}`}
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'models' && (
            <div>
              <h2 className={`text-xl font-semibold ${c.text.primary} mb-4`}>AI Models</h2>
              <div className="space-y-3">
                {[
                  { name: aiModels.default.name, status: 'active', usage: '1.2M tokens/day' },
                  { name: aiModels.turbo.name, status: 'active', usage: '800K tokens/day' },
                  { name: aiModels.embedding.name, status: 'active', usage: '2.5M tokens/day' },
                ].map((model) => (
                  <div key={model.name} className={`p-4 border ${c.card.border} rounded-lg flex justify-between`}>
                    <div>
                      <div className={`font-medium ${c.text.primary}`}>{model.name}</div>
                      <div className={`text-sm ${c.text.secondary}`}>{model.usage}</div>
                    </div>
                    <span className={`px-3 py-1 ${c.badge.success.bg} ${c.badge.success.text} rounded-full text-xs font-medium h-fit`}>
                      {model.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div>
              <h2 className={`text-xl font-semibold ${c.text.primary} mb-4`}>Security & Compliance</h2>
              <div className="space-y-4">
                <div className={`p-4 border ${c.border.primary} rounded-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${c.text.primary}`}>GDPR Compliance</span>
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <p className={`text-sm ${c.text.secondary}`}>All data encrypted at rest and in transit</p>
                </div>
                <div className={`p-4 border ${c.border.primary} rounded-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${c.text.primary}`}>Data Sovereignty</span>
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <p className={`text-sm ${c.text.secondary}`}>EU region deployment with data residency</p>
                </div>
                <div className={`p-4 border ${c.border.primary} rounded-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${c.text.primary}`}>Audit Retention</span>
                    <span className={`text-sm ${c.badge.info.bg} ${c.badge.info.text} px-2 py-1 rounded`}>7 years</span>
                  </div>
                  <p className={`text-sm ${c.text.secondary}`}>Full audit trail maintained for compliance</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'cost' && (
            <div>
              <h2 className={`text-xl font-semibold ${c.text.primary} mb-4`}>Cost Dashboard</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className={`p-4 border ${c.card.border} rounded-lg`}>
                  <div className={`text-3xl font-bold ${c.text.primary} mb-1`}>$2,450</div>
                  <div className={`text-sm ${c.text.secondary}`}>This Month</div>
                </div>
                <div className={`p-4 border ${c.card.border} rounded-lg`}>
                  <div className={`text-3xl font-bold ${c.text.primary} mb-1`}>12.5M</div>
                  <div className={`text-sm ${c.text.secondary}`}>Tokens Used</div>
                </div>
                <div className={`p-4 border ${c.card.border} rounded-lg`}>
                  <div className={`text-3xl font-bold ${c.text.primary} mb-1`}>$0.196</div>
                  <div className={`text-sm ${c.text.secondary}`}>Avg per 1K tokens</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
