import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BlogPost } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  X
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BlogAdmin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts-admin'],
    queryFn: () => BlogPost.findMany({ includeUnpublished: true, limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => BlogPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts-admin'] });
      setIsCreating(false);
      setEditingPost(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => BlogPost.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts-admin'] });
      setEditingPost(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => BlogPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts-admin'] });
    }
  });

  const filteredPosts = posts.filter(post =>
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = (formData) => {
    if (editingPost?.id) {
      updateMutation.mutate({ id: editingPost.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600">Create and manage blog content</p>
        </div>
        <Button onClick={() => { setIsCreating(true); setEditingPost({}); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Posts List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No blog posts yet</p>
            <Button className="mt-4" onClick={() => { setIsCreating(true); setEditingPost({}); }}>
              Create your first post
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{post.title}</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">{post.excerpt}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-1 bg-gray-100 rounded text-sm">
                      {post.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      post.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {post.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {post.created_at ? format(new Date(post.created_at), 'MMM d, yyyy') : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingPost(post)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (window.confirm('Delete this post?')) {
                            deleteMutation.mutate(post.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit/Create Modal */}
      <Dialog open={!!editingPost} onOpenChange={() => { setEditingPost(null); setIsCreating(false); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Create New Post' : 'Edit Post'}</DialogTitle>
          </DialogHeader>
          {editingPost && (
            <PostForm
              post={editingPost}
              onSave={handleSave}
              onCancel={() => { setEditingPost(null); setIsCreating(false); }}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PostForm({ post, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    title: post.title || '',
    slug: post.slug || '',
    excerpt: post.excerpt || '',
    content: post.content || '',
    category: post.category || '',
    image_url: post.image_url || '',
    published: post.published || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          onBlur={() => !formData.slug && generateSlug()}
          required
        />
      </div>

      <div>
        <Label htmlFor="slug">Slug</Label>
        <div className="flex gap-2">
          <Input
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
          />
          <Button type="button" variant="outline" onClick={generateSlug}>
            Generate
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="e.g., News, Tips, Events"
        />
      </div>

      <div>
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          placeholder="https://..."
        />
      </div>

      <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          name="excerpt"
          value={formData.excerpt}
          onChange={handleChange}
          rows={2}
          placeholder="Brief summary of the post"
        />
      </div>

      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows={10}
          placeholder="Full post content (supports markdown)"
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="published"
          name="published"
          checked={formData.published}
          onChange={handleChange}
          className="rounded"
        />
        <Label htmlFor="published" className="cursor-pointer">Published</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Post'}
        </Button>
      </div>
    </form>
  );
}
