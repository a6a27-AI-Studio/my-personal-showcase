import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDataClient } from '@/contexts/DataClientContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Edit, Trash2, Plus, Save, X, LogIn, Mail, MapPin, Phone } from 'lucide-react';
import type { Message } from '@/types';

export default function ContactPage() {
  const { user, isAuthenticated, login } = useAuth();
  const dataClient = useDataClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [isSaving, setIsSaving] = useState(false);

  const loadMessages = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await dataClient.listMyMessages();
      setMessages(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [isAuthenticated, dataClient]);

  const handleCreate = async () => {
    if (!formData.content.trim()) return;
    setIsSaving(true);
    try {
      const newMessage = await dataClient.createMyMessage({
        title: formData.title || undefined,
        content: formData.content,
      });
      setMessages([...messages, newMessage]);
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

  const handleDelete = async (id: string) => {
    try {
      await dataClient.deleteMyMessage(id);
      setMessages(messages.filter((m) => m.id !== id));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const startEditing = (message: Message) => {
    setEditingId(message.id);
    setFormData({ title: message.title || '', content: message.content });
    setIsCreating(false);
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({ title: '', content: '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({ title: '', content: '' });
  };

  return (
    <div className="container-page">
      <div className="section-header">
        <h1 className="text-primary mb-4">Contact</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Have a project in mind? Let's talk about how I can help.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
              <CardDescription>
                I'm always open to discussing new projects, creative ideas, or opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Mail className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href="mailto:hello@example.com" className="font-medium hover:text-accent">
                    hello@example.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Phone className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-accent/10">
                  <MapPin className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">San Francisco, CA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messages Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              My Messages
            </h2>
            {isAuthenticated && !isCreating && !editingId && (
              <Button onClick={startCreating} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Message
              </Button>
            )}
          </div>

          {/* Guest View */}
          {!isAuthenticated && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Please log in to leave a message. Your messages are private and only visible to you.
                </p>
                <Button onClick={() => login('user')}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login as User
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Authenticated View */}
          {isAuthenticated && (
            <>
              {/* Create Form */}
              {isCreating && (
                <Card>
                  <CardHeader>
                    <CardTitle>New Message</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Subject (optional)"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                    <Textarea
                      placeholder="Your message..."
                      rows={4}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleCreate} disabled={isSaving || !formData.content.trim()}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button variant="outline" onClick={cancelEdit}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Messages List */}
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : messages.length === 0 && !isCreating ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    You haven't left any messages yet. Click "New Message" to start.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <Card key={message.id}>
                      {editingId === message.id ? (
                        <CardContent className="pt-6 space-y-4">
                          <Input
                            placeholder="Subject (optional)"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          />
                          <Textarea
                            rows={4}
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          />
                          <div className="flex gap-2">
                            <Button onClick={() => handleUpdate(message.id)} disabled={isSaving}>
                              <Save className="mr-2 h-4 w-4" />
                              {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button variant="outline" onClick={cancelEdit}>
                              <X className="mr-2 h-4 w-4" />
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      ) : (
                        <>
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div>
                                {message.title && (
                                  <CardTitle className="text-lg">{message.title}</CardTitle>
                                )}
                                <CardDescription>
                                  {new Date(message.createdAt).toLocaleDateString()}
                                </CardDescription>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => startEditing(message)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(message.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground">{message.content}</p>
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
