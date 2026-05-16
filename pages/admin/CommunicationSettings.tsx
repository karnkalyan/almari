import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Bell, Save, Plus, Trash2, ShieldCheck, Server, RefreshCw, Smartphone } from 'lucide-react';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

export const CommunicationSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'smtp' | 'sms' | 'recipients' | 'email-templates' | 'sms-templates' | 'notifications'>('smtp');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({});

  const loadSettings = async (tab: string) => {
    try {
      const endpointMap: any = {
        'smtp': 'smtp',
        'sms': 'sms-gateways',
        'recipients': 'notification-recipients',
        'email-templates': 'email-templates',
        'sms-templates': 'sms-templates',
        'notifications': 'notification-events'
      };
      const result = await apiService.getAdvancedSettings(endpointMap[tab]);
      setData(result || (['sms', 'recipients', 'email-templates', 'sms-templates', 'notifications'].includes(tab) ? [] : {}));
    } catch (error) {
      toast.error('Failed to load settings');
    }
  };

  useEffect(() => {
    loadSettings(activeTab);
  }, [activeTab]);

  const saveSettings = async (endpoint: string, payload: any) => {
    setLoading(true);
    try {
      await apiService.updateAdvancedSettings(endpoint, payload);
      toast.success('Settings saved successfully');
      loadSettings(activeTab);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'smtp':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">SMTP Server Configuration</h2>
              <button onClick={() => toast.success('Test email sent to ' + data.senderEmail)} className="px-4 py-2 bg-gray-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all">Send Test Email</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">SMTP Host</label>
                <input className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-gray-50 font-bold text-sm outline-none" placeholder="smtp.gmail.com" value={data.host || ''} onChange={e => setData({ ...data, host: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Port</label>
                <input className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-gray-50 font-bold text-sm outline-none" type="number" placeholder="587" value={data.port || ''} onChange={e => setData({ ...data, port: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Username</label>
                <input className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-gray-50 font-bold text-sm outline-none" placeholder="Username" value={data.username || ''} onChange={e => setData({ ...data, username: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Password</label>
                <input className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-gray-50 font-bold text-sm outline-none" type="password" placeholder="Password" value={data.password || ''} onChange={e => setData({ ...data, password: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Encryption</label>
                <select className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-gray-50 font-bold text-sm outline-none" value={data.encryption || 'tls'} onChange={e => setData({ ...data, encryption: e.target.value })}>
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Sender Email</label>
                <input className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-gray-50 font-bold text-sm outline-none" placeholder="noreply@clinedaraz.com" value={data.senderEmail || ''} onChange={e => setData({ ...data, senderEmail: e.target.value })} />
              </div>
            </div>
            <button onClick={() => saveSettings('smtp', data)} disabled={loading} className="px-8 py-4 bg-[var(--brand-primary)] text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"><Save size={16} /> Save Configuration</button>
          </div>
        );
      case 'sms':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800">SMS Gateway Configuration</h2>
            <div className="space-y-4">
              {(Array.isArray(data) ? data : []).map((gateway: any, idx: number) => (
                <div key={idx} className="p-8 border border-gray-100 rounded-[2rem] bg-gray-50/50 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <Smartphone size={18} className="text-slate-400" />
                      </div>
                      <span className="font-bold text-slate-800">{gateway.providerName || 'New Gateway'}</span>
                    </div>
                    <button onClick={() => saveSettings(`sms-gateways/delete/${gateway.id}`, {})} className="text-red-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select className="h-12 px-4 border border-gray-200 rounded-xl bg-white font-bold text-sm outline-none" value={gateway.providerName || ''} onChange={e => { const n = [...data]; n[idx].providerName = e.target.value; setData(n); }}>
                      <option value="">Select Provider</option>
                      <option value="Aakash SMS">Aakash SMS (Nepal)</option>
                      <option value="Sparrow SMS">Sparrow SMS (Nepal)</option>
                      <option value="Twilio">Twilio</option>
                      <option value="Custom">Custom HTTP API</option>
                    </select>
                    <input className="h-12 px-4 border border-gray-200 rounded-xl bg-white font-bold text-sm outline-none" placeholder="API Key / Token" value={gateway.apiKey || ''} onChange={e => { const n = [...data]; n[idx].apiKey = e.target.value; setData(n); }} />
                    <input className="h-12 px-4 border border-gray-200 rounded-xl bg-white font-bold text-sm outline-none" placeholder="Gateway URL" value={gateway.gatewayUrl || ''} onChange={e => { const n = [...data]; n[idx].gatewayUrl = e.target.value; setData(n); }} />
                    <input className="h-12 px-4 border border-gray-200 rounded-xl bg-white font-bold text-sm outline-none" placeholder="Sender ID / Number" value={gateway.senderId || ''} onChange={e => { const n = [...data]; n[idx].senderId = e.target.value; setData(n); }} />
                  </div>
                  <button onClick={() => saveSettings(`sms-gateways/${gateway.id || 'new'}`, gateway)} disabled={loading} className="px-6 py-3 bg-white border border-gray-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2"><Save size={14} /> Update Gateway</button>
                </div>
              ))}
              <button onClick={() => setData([...data, { providerName: '', apiKey: '', gatewayUrl: '', senderId: '' }])} className="w-full py-6 border-2 border-dashed border-gray-200 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] text-gray-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all flex justify-center items-center gap-2"><Plus size={16} /> Add SMS Gateway</button>
            </div>
          </div>
        );
      case 'recipients':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800">Admin Notification Recipients</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Admin Emails</h3>
                  <button onClick={() => setData({ ...data, emails: [...(data.emails || []), ''] })} className="p-1.5 bg-gray-50 rounded-lg text-slate-400 hover:text-slate-800 transition-all"><Plus size={14} /></button>
                </div>
                {(data.emails || []).map((email: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <input className="flex-1 h-12 px-4 border border-gray-200 rounded-xl bg-gray-50 font-bold text-sm outline-none" placeholder="admin@example.com" value={email} onChange={e => { const n = [...data.emails]; n[i] = e.target.value; setData({ ...data, emails: n }); }} />
                    <button onClick={() => { const n = [...data.emails]; n.splice(i, 1); setData({ ...data, emails: n }); }} className="p-3 text-red-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Admin SMS Numbers</h3>
                  <button onClick={() => setData({ ...data, numbers: [...(data.numbers || []), ''] })} className="p-1.5 bg-gray-50 rounded-lg text-slate-400 hover:text-slate-800 transition-all"><Plus size={14} /></button>
                </div>
                {(data.numbers || []).map((num: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <input className="flex-1 h-12 px-4 border border-gray-200 rounded-xl bg-gray-50 font-bold text-sm outline-none" placeholder="+977 98XXXXXXXX" value={num} onChange={e => { const n = [...data.numbers]; n[i] = e.target.value; setData({ ...data, numbers: n }); }} />
                    <button onClick={() => { const n = [...data.numbers]; n.splice(i, 1); setData({ ...data, numbers: n }); }} className="p-3 text-red-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => saveSettings('notification-recipients', data)} disabled={loading} className="px-8 py-4 bg-[var(--brand-primary)] text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center gap-2 shadow-lg"><Save size={16} /> Save Recipients</button>
          </div>
        );
      case 'notifications':
        const events = [
          { id: 'new_order', label: 'New Order Received', desc: 'Notify when a customer places a new order.' },
          { id: 'order_status', label: 'Order Status Changed', desc: 'Notify customer when order status updates.' },
          { id: 'new_user', label: 'New Registration', desc: 'Notify admin when a new user registers.' },
          { id: 'contact_form', label: 'Contact Submission', desc: 'Notify admin of new contact messages.' },
          { id: 'refund_request', label: 'Refund Requested', desc: 'Notify admin when a refund is requested.' },
          { id: 'product_review', label: 'New Product Review', desc: 'Notify admin when a review is submitted.' },
          { id: 'payment_failure', label: 'Payment Failure', desc: 'Notify admin/user of failed payments.' }
        ];
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800">Event-Wise Rules</h2>
            <div className="space-y-4">
              {events.map((event) => {
                const setting = (Array.isArray(data) ? data : []).find((d: any) => d.event === event.id) || { event: event.id, adminEmail: false, customerEmail: false, adminSms: false, customerSms: false, enabled: true };
                return (
                  <div key={event.id} className="p-6 border border-gray-100 rounded-[2rem] bg-gray-50/50 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                    <div className="max-w-md">
                      <div className="flex items-center gap-3 mb-1">
                        <div className={`w-2 h-2 rounded-full ${setting.enabled ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                        <h3 className="font-bold text-slate-800 text-sm">{event.label}</h3>
                      </div>
                      <p className="text-xs text-gray-500">{event.desc}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-4 border-r border-gray-200 pr-6">
                         <label className="flex items-center gap-2 cursor-pointer group">
                           <input type="checkbox" checked={setting.adminEmail} onChange={e => { const n = [...data]; const idx = n.findIndex(x => x.event === event.id); if(idx >= 0) n[idx].adminEmail = e.target.checked; else n.push({...setting, adminEmail: e.target.checked}); setData(n); }} className="w-4 h-4 rounded text-[var(--brand-primary)]" />
                           <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-slate-600 transition-colors">Admin Mail</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer group">
                           <input type="checkbox" checked={setting.adminSms} onChange={e => { const n = [...data]; const idx = n.findIndex(x => x.event === event.id); if(idx >= 0) n[idx].adminSms = e.target.checked; else n.push({...setting, adminSms: e.target.checked}); setData(n); }} className="w-4 h-4 rounded text-[var(--brand-primary)]" />
                           <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-slate-600 transition-colors">Admin SMS</span>
                         </label>
                      </div>
                      <div className="flex items-center gap-4">
                         <label className="flex items-center gap-2 cursor-pointer group">
                           <input type="checkbox" checked={setting.customerEmail} onChange={e => { const n = [...data]; const idx = n.findIndex(x => x.event === event.id); if(idx >= 0) n[idx].customerEmail = e.target.checked; else n.push({...setting, customerEmail: e.target.checked}); setData(n); }} className="w-4 h-4 rounded text-[var(--brand-primary)]" />
                           <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-slate-600 transition-colors">User Mail</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer group">
                           <input type="checkbox" checked={setting.customerSms} onChange={e => { const n = [...data]; const idx = n.findIndex(x => x.event === event.id); if(idx >= 0) n[idx].customerSms = e.target.checked; else n.push({...setting, customerSms: e.target.checked}); setData(n); }} className="w-4 h-4 rounded text-[var(--brand-primary)]" />
                           <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-slate-600 transition-colors">User SMS</span>
                         </label>
                      </div>
                      <button onClick={() => saveSettings('notification-events', setting)} className="p-2 bg-white border border-gray-200 rounded-xl text-slate-400 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-all"><Save size={16} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'email-templates':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800">Email Template Management</h2>
            <div className="space-y-6">
              {(Array.isArray(data) ? data : []).map((template: any, idx: number) => (
                <div key={idx} className="p-8 border border-gray-100 rounded-[2rem] bg-gray-50/50 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Template Name</label>
                      <input className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-white font-bold text-sm outline-none" value={template.name || ''} onChange={e => { const n = [...data]; n[idx].name = e.target.value; setData(n); }} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Subject Line</label>
                      <input className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-white font-bold text-sm outline-none" value={template.subject || ''} onChange={e => { const n = [...data]; n[idx].subject = e.target.value; setData(n); }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Message Body (HTML Supported)</label>
                      <div className="text-[9px] font-bold text-gray-400">PLACEHOLDERS: {'{customer_name}'}, {'{order_id}'}, {'{total}'}, {'{store_name}'}</div>
                    </div>
                    <textarea className="w-full p-6 border border-gray-200 rounded-[1.5rem] bg-white font-medium text-sm outline-none min-h-[300px] leading-relaxed" value={template.body || ''} onChange={e => { const n = [...data]; n[idx].body = e.target.value; setData(n); }} />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => saveSettings('email-templates', template)} className="px-6 py-3 bg-[var(--brand-primary)] text-white font-bold rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg"><Save size={16} /> Save Template</button>
                    <button onClick={() => toast.success('Preview opened')} className="px-6 py-3 bg-white border border-gray-200 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-widest">Preview Mode</button>
                  </div>
                </div>
              ))}
              <button onClick={() => setData([...data, { name: '', subject: '', body: '' }])} className="w-full py-6 border-2 border-dashed border-gray-200 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] text-gray-400 hover:text-[var(--brand-primary)] transition-all flex justify-center items-center gap-2"><Plus size={16} /> New Email Template</button>
            </div>
          </div>
        );
      case 'sms-templates':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800">SMS Template Management</h2>
            <div className="space-y-6">
              {(Array.isArray(data) ? data : []).map((template: any, idx: number) => (
                <div key={idx} className="p-8 border border-gray-100 rounded-[2rem] bg-gray-50/50 space-y-4">
                  <input className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-white font-bold text-sm outline-none" placeholder="Event Name" value={template.name || ''} onChange={e => { const n = [...data]; n[idx].name = e.target.value; setData(n); }} />
                  <textarea className="w-full p-4 border border-gray-200 rounded-xl bg-white font-medium text-sm outline-none min-h-[100px]" placeholder="SMS content..." value={template.body || ''} onChange={e => { const n = [...data]; n[idx].body = e.target.value; setData(n); }} />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-400 font-bold">CHARS: {template.body?.length || 0} / 160 (1 SMS)</span>
                    <button onClick={() => saveSettings('sms-templates', template)} className="px-4 py-2 bg-[var(--brand-primary)] text-white font-bold rounded-xl text-[10px] uppercase tracking-widest shadow-md">Save</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div>
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--brand-primary)]/10 flex items-center justify-center text-[var(--brand-primary)]">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none uppercase">Notification Hub</h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Centralized Email & SMS orchestration engine</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-100 overflow-x-auto pb-4 no-scrollbar">
        {[
          { id: 'smtp', label: 'SMTP Config', icon: Server },
          { id: 'sms', label: 'SMS Gateways', icon: Smartphone },
          { id: 'recipients', label: 'Recipients', icon: ShieldCheck },
          { id: 'notifications', label: 'Event Rules', icon: RefreshCw },
          { id: 'email-templates', label: 'Email Templates', icon: Mail },
          { id: 'sms-templates', label: 'SMS Templates', icon: MessageSquare },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-white border border-gray-100 text-gray-400 hover:bg-gray-50'}`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10">
        {renderTab()}
      </div>
    </div>
  );
};
