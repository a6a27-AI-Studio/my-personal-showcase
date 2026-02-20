import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDataClient } from '@/contexts/DataClientContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Edit, Trash2, Plus, Save, X, LogIn, Mail, MapPin, Phone, MessageCircle } from 'lucide-react';
import type { DeleteMode, Message } from '@/types';

export default function ContactPage() {
  const { user, loading: authLoading, signInWithGoogle, isAdmin } = useAuth();
  const isAuthenticated = !!user;
  const dataClient = useDataClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [isSaving, setIsSaving] = useState(false);

  const loadMessages = async () => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await dataClient.listMyMessages();
      setMessages(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [isAuthenticated, authLoading, dataClient]);

  const handleCreate = async () => {
    if (!formData.content.trim()) return;
    setIsSaving(true);
    try {
      const newMessage = await dataClient.createMyMessage({
        title: formData.title || undefined,
        content: formData.content,
      });
      setMessages([newMessage, ...messages]);
      setFormData({ title: '', content: '' });
      setIsCreating(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    setIsSaving(true);
    try {
      const updated = await dataClient.updateMyMessage(id, {
        title: formData.title || undefined,
        content: formData.content,
      });
      setMessages(messages.map((m) => (m.id === id ? updated : m)));
      setEditingId(null);
      setFormData({ title: '', content: '' });
    } finally {
      setIsSaving(false);
    }
  };

  const chooseAdminDeleteMode = (): DeleteMode | null => {
    const pick = window.prompt('管理員刪除選項：\n1 = 軟刪除\n2 = 真刪除\n其他 = 取消', '1');
    if (pick === '1') return 'soft';
    if (pick === '2') return 'hard';
    return null;
  };

  const handleDelete = async (id: string) => {
    try {
      let mode: DeleteMode = 'soft';
      if (isAdmin) {
        const selected = chooseAdminDeleteMode();
        if (!selected) return;
        mode = selected;
      }

      await dataClient.deleteMyMessage(id, { mode });

      if (mode === 'hard' || !isAdmin) {
        setMessages(messages.filter((m) => m.id !== id));
      } else {
        await loadMessages();
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    setIsSaving(true);
    try {
      const updated = await dataClient.replyMessage(id, { reply: replyText.trim() });
      setMessages(messages.map((m) => (m.id === id ? updated : m)));
      setReplyingId(null);
      setReplyText('');
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (message: Message) => {
    setEditingId(message.id);
    setFormData({ title: message.title || '', content: message.content });
    setIsCreating(false);
  };

  const startReplying = (message: Message) => {
    setReplyingId(message.id);
    setReplyText(message.adminReply || '');
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({ title: '', content: '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setReplyingId(null);
    setIsCreating(false);
    setReplyText('');
    setFormData({ title: '', content: '' });
  };

  return (
    <div className="container-page">
      <div className="section-header">
        <h1 className="text-primary mb-4">聯絡我</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          有專案想法？讓我們談談我能如何協助
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>取得聯繫</CardTitle>
              <CardDescription>
                我隨時歡迎討論新專案、創意想法或合作機會
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-accent/10"><Mail className="h-5 w-5 text-accent" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">電子郵件</p>
                  <a href="mailto:hello@example.com" className="font-medium hover:text-accent">hello@example.com</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-accent/10"><Phone className="h-5 w-5 text-accent" /></div>
                <div><p className="text-sm text-muted-foreground">電話</p><p className="font-medium">+1 (555) 123-4567</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-accent/10"><MapPin className="h-5 w-5 text-accent" /></div>
                <div><p className="text-sm text-muted-foreground">地點</p><p className="font-medium">San Francisco, CA</p></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              {isAdmin ? '全部留言（管理者）' : '我的留言'}
            </h2>
            {isAuthenticated && !isCreating && !editingId && (
              <Button onClick={startCreating} size="sm"><Plus className="mr-2 h-4 w-4" />新留言</Button>
            )}
          </div>

          {!isAuthenticated && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">請登入後留言。您的留言僅對您可見</p>
                <Button onClick={() => signInWithGoogle()}><LogIn className="mr-2 h-4 w-4" />使用 Google 登入</Button>
              </CardContent>
            </Card>
          )}

          {isAuthenticated && (
            <>
              {isCreating && (
                <Card>
                  <CardHeader><CardTitle>新留言</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <Input placeholder="主題（選填）" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                    <Textarea placeholder="您的留言..." rows={4} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
                    <div className="flex gap-2">
                      <Button onClick={handleCreate} disabled={isSaving || !formData.content.trim()}><Save className="mr-2 h-4 w-4" />{isSaving ? '儲存中...' : '儲存'}</Button>
                      <Button variant="outline" onClick={cancelEdit}><X className="mr-2 h-4 w-4" />取消</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">載入中...</div>
              ) : messages.length === 0 && !isCreating ? (
                <Card><CardContent className="pt-6 text-center text-muted-foreground">{isAdmin ? '目前沒有任何使用者留言' : '尚無留言。點擊「新留言」開始'}</CardContent></Card>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <Card key={message.id} className={message.deletedAt ? 'opacity-70' : ''}>
                      {editingId === message.id ? (
                        <CardContent className="pt-6 space-y-4">
                          <Input placeholder="Subject (optional)" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                          <Textarea rows={4} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
                          <div className="flex gap-2">
                            <Button onClick={() => handleUpdate(message.id)} disabled={isSaving}><Save className="mr-2 h-4 w-4" />{isSaving ? '儲存中...' : '儲存'}</Button>
                            <Button variant="outline" onClick={cancelEdit}><X className="mr-2 h-4 w-4" />取消</Button>
                          </div>
                        </CardContent>
                      ) : (
                        <>
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div>
                                {message.title && <CardTitle className="text-lg">{message.title}</CardTitle>}
                                <CardDescription>{new Date(message.createdAt).toLocaleDateString()}</CardDescription>
                                {message.deletedAt && <p className="text-xs text-muted-foreground mt-1">已軟刪除</p>}
                              </div>
                              <div className="flex gap-1">
                                {!message.deletedAt && (
                                  <Button variant="ghost" size="icon" onClick={() => startEditing(message)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                {isAdmin && !message.deletedAt && (
                                  <Button variant="ghost" size="icon" onClick={() => startReplying(message)}>
                                    <MessageCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(message.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-muted-foreground whitespace-pre-wrap">{message.content}</p>

                            {message.adminReply && (
                              <div className="rounded-md border bg-muted/40 p-3">
                                <p className="text-sm font-medium mb-1">管理員回覆</p>
                                <p className="text-sm whitespace-pre-wrap">{message.adminReply}</p>
                              </div>
                            )}

                            {isAdmin && replyingId === message.id && (
                              <div className="space-y-2">
                                <Textarea rows={3} placeholder="輸入管理員回覆..." value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                                <div className="flex gap-2">
                                  <Button onClick={() => handleReply(message.id)} disabled={isSaving || !replyText.trim()}>
                                    <Save className="mr-2 h-4 w-4" />{isSaving ? '儲存中...' : '送出回覆'}
                                  </Button>
                                  <Button variant="outline" onClick={cancelEdit}>取消</Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
