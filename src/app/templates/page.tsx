"use client"

import { useEffect, useState } from 'react';
import * as LucideIcons from "lucide-react";
import UserButton from '@/components/clerk-components/UserButton';
import axios from 'axios';
import { Diagram } from '@/lib/model/draw.model';
import CreateTemplateModal from '@/components/CreateTemplateModal';
import DynamicReactIcons from '@/components/DynamicIcons';
import Link from 'next/link';

const Templates = () => {
  const [templates, setTemplates] = useState<Diagram[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = () => {
    setLoading(true);
    axios("/api/templates", {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => {
      setTemplates(res.data.diagrams)
      setLoading(false);
    })
      .catch((err) => {
        console.log(err)
        setLoading(false);
      })
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div className="min-h-screen bg-[#0F1117]">
      <nav className="h-16 border-b border-white/10 flex items-center justify-between px-8">
        <h1 className="text-2xl font-bold text-white">Templates</h1>
        <UserButton />
      </nav>

      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-white">All Templates</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Skeleton loading cards
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#1a1d1f] rounded-xl p-6 border border-white/10 animate-pulse">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 bg-[#0F1117] rounded-xl"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500/20"></div>
                    <div className="w-16 h-4 bg-[#0F1117] rounded"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="w-3/4 h-6 bg-[#0F1117] rounded"></div>
                  <div className="w-1/2 h-4 bg-[#0F1117] rounded"></div>
                </div>
              </div>
            ))
          ) : (
            templates?.map((template) => (
              <Link
                href={`/diagram/${template._id}`}
                key={template._id}
                className="bg-[#1a1d1f] rounded-xl p-6 border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer group hover:shadow-lg hover:shadow-blue-500/5"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="text-white p-3 bg-[#0F1117] rounded-xl border border-white/5 group-hover:border-blue-500/20">
                    <DynamicReactIcons iconName={template.icon}/>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500/50"></div>
                    <div className="text-xs text-white/50">Template</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-500 transition-colors">
                    {template.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="text-white/60 text-sm">
                      {/* @ts-ignore */}
                      {template.tag?.title || 'No Tag'}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchTemplates}
      />
    </div>
  );
};

export default Templates;