'use client';

import { useState } from 'react';
import axios from 'axios';
import * as Icons from 'lucide-react';
import IconGallery from './IconSelector';
import IconSelector from './IconSelector';
import { toast } from 'sonner';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTemplateModal({ isOpen, onClose, onSuccess }: CreateTemplateModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tag: '',
    icon: 'LuDatabase',
  });

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.tag.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      await axios.post('/api/templates', {
        title: formData.title,
        description: formData.description,
        tag: formData.tag,
        icon: formData.icon,
        flow: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } }
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1a1d1f] rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-white mb-4">Create New Template</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Title *</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-[#0F1117] border border-white/10 text-white"
                placeholder="Template name"
                required
              />
            </div>
            
            <div>
              <label className="block text-white mb-2">Description *</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-[#0F1117] border border-white/10 text-white"
                placeholder="Template description"
                required
              />
            </div>
            
            <div>
              <label className="block text-white mb-2">Tag *</label>
              <input
                type="text"
                id="tag"
                value={formData.tag}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-[#0F1117] border border-white/10 text-white"
                placeholder="Template tag"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Icon</label>
              <IconSelector
              icon={formData.icon}
              onSelect={(iconName: string) => {
                setFormData({ 
                  ...formData, 
                  icon: iconName,
                });
              }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white hover:bg-white/10 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Create Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
