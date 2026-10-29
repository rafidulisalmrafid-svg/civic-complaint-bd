import React, { useState, useEffect, useRef } from 'react';
import { Send, Shield, User, Clock, CheckCheck, MessageSquare, AlertCircle } from 'lucide-react';

export default function AdminOfficerChat({ complaintId, trackingId, initialMessages = [], currentUser = null }) {
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Live Polling every 5 seconds for new messages
    useEffect(() => {
        if (!complaintId) return;

        const interval = setInterval(() => {
            fetch(`/api/chat/messages?complaint_id=${complaintId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && Array.isArray(data.messages)) {
                        setMessages(data.messages);
                    }
                })
                .catch(() => {});
        }, 5000);

        return () => clearInterval(interval);
    }, [complaintId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const text = newMessage.trim();
        if (!text || isSending) return;

        setIsSending(true);
        setErrorMsg('');

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    complaint_id: complaintId,
                    message: text,
                }),
            });

            const data = await res.json();
            if (data.success && data.message) {
                setMessages(prev => [...prev, data.message]);
                setNewMessage('');
            } else {
                setErrorMsg(data.message || 'বার্তা পাঠাতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
            }
        } catch (err) {
            setErrorMsg('সার্ভারের সাথে সংযোগে সমস্যা হয়েছে।');
        } finally {
            setIsSending(false);
        }
    };

    const isCurrentAdmin = currentUser?.role === 'main_admin';

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
            {/* Chat Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold flex items-center gap-2">
                            <span>প্রশাসনিক অভ্যন্তরীণ চ্যাট</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-emerald-400 border border-slate-700">
                                #{trackingId}
                            </span>
                        </h4>
                        <p className="text-[10px] text-slate-400">অ্যাডমিন ও দায়িত্বপ্রাপ্ত কর্মকর্তার মধ্যে দ্বিমুখী যোগাযোগ</p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>সরাসরি সংযোগ সক্রিয়</span>
                </div>
            </div>

            {/* Messages Thread */}
            <div className="p-4 overflow-y-auto space-y-3 max-h-72 min-h-48 bg-slate-50/50">
                {messages.length > 0 ? (
                    messages.map((msg) => {
                        const isFromMe = currentUser ? msg.sender_id === currentUser.id : false;
                        const senderIsAdmin = msg.sender?.role === 'main_admin';

                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${isFromMe ? 'items-end' : 'items-start'}`}
                            >
                                <div className="flex items-center gap-1.5 mb-1 px-1">
                                    {senderIsAdmin ? (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                            <Shield className="w-2.5 h-2.5" /> সুপার অ্যাডমিন
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                                            <User className="w-2.5 h-2.5" /> {msg.sender?.name || 'দায়িত্বপ্রাপ্ত কর্মকর্তা'}
                                        </span>
                                    )}
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5" />
                                        {new Date(msg.created_at).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                <div
                                    className={`px-3.5 py-2.5 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-2xs ${
                                        isFromMe
                                            ? 'bg-emerald-700 text-white rounded-tr-xs'
                                            : senderIsAdmin
                                            ? 'bg-purple-900 text-white rounded-tl-xs'
                                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap">{msg.message}</p>
                                </div>

                                {isFromMe && (
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 px-1">
                                        {msg.is_read ? (
                                            <span className="text-emerald-600 flex items-center gap-0.5 font-medium">
                                                <CheckCheck className="w-3 h-3" /> পঠিত হয়েছে
                                            </span>
                                        ) : (
                                            <span>ডেলিভার্ড</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="py-8 text-center text-slate-400 space-y-1">
                        <MessageSquare className="w-6 h-6 mx-auto opacity-30" />
                        <p className="text-xs">এখনও কোনো অভ্যন্তরীণ বার্তা আদান-প্রদান করা হয়নি।</p>
                        <p className="text-[11px] text-slate-400">
                            {isCurrentAdmin 
                                ? 'কর্মকর্তাকে কোনো নির্দেশনা দিতে নিচের বক্সে লিখুন।' 
                                : 'অ্যাডমিনের কাছে কোনো প্রশ্ন বা তথ্যের জন্য নিচের বক্সে লিখুন।'}
                        </p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Error banner if any */}
            {errorMsg && (
                <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={
                        isCurrentAdmin 
                            ? 'কর্মকর্তার উদ্দেশ্যে অভ্যন্তরীণ নির্দেশনা বা প্রশ্ন লিখুন...' 
                            : 'অ্যাডমিনের উদ্দেশ্যে প্রতিবেদন বা আপডেট বার্তা লিখুন...'
                    }
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    disabled={isSending}
                />
                <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
                >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSending ? 'পাঠানো হচ্ছে...' : 'পাঠান'}</span>
                </button>
            </form>
        </div>
    );
}
