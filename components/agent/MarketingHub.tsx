
'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getMarketingPosts, createMarketingPost } from '@/lib/mockDb';
import { generateMarketingContent } from '@/lib/gemini';

export const MarketingHub = () => {
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState(getMarketingPosts());
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const generated = await generateMarketingContent('social post', 'Bail bonds services open 24/7');
    setContent(generated);
    setLoading(false);
  };

  const handlePost = () => {
    createMarketingPost({
      platform: 'Facebook',
      content: content,
      status: 'Scheduled',
      scheduledFor: new Date().toISOString()
    });
    setPosts(getMarketingPosts());
    alert("Post Scheduled!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Content Creator">
        <textarea 
          className="w-full p-4 border rounded h-32 mb-4" 
          placeholder="Enter post content..." 
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleGenerate} disabled={loading}>
            {loading ? 'AI Generating...' : 'Generate with AI'}
          </Button>
          <Button onClick={handlePost} disabled={!content}>Schedule Post</Button>
        </div>
      </Card>

      <Card title="Scheduled Posts">
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="p-3 border rounded bg-slate-50">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{post.platform}</span>
                <span>{post.status}</span>
              </div>
              <p className="text-sm">{post.content}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
