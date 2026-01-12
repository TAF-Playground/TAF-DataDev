'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileItem, getAllProjects, getDirectoryProjects, getDirectory } from '@/lib/api/files';
import { useEditor } from '@/hooks/useEditor';

interface ProjectsListProps {
  directoryId?: string;
  directoryName?: string;
}

export function ProjectsList({ directoryId, directoryName }: ProjectsListProps) {
  const router = useRouter();
  const { setSelectedFile, setViewMode } = useEditor();
  const [projects, setProjects] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDirectoryName, setCurrentDirectoryName] = useState<string>('');

  useEffect(() => {
    loadProjects();
  }, [directoryId]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      if (directoryId) {
        const [dirData, projectsData] = await Promise.all([
          getDirectory(directoryId),
          getDirectoryProjects(directoryId),
        ]);
        setProjects(projectsData);
        setCurrentDirectoryName(dirData?.name || directoryName || '目录详情');
      } else {
        const data = await getAllProjects();
        setProjects(data);
        setCurrentDirectoryName('工作目录');
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    setSelectedFile(projectId);
    setViewMode('editor');
    router.push(`/editor?project=${projectId}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 bg-gray-800">
        <h1 className="text-xl font-bold text-white mb-1">
          {currentDirectoryName}
        </h1>
        <p className="text-gray-400 text-sm">
          {directoryId ? '目录下的项目列表' : '所有项目列表'}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="text-center py-12 text-gray-400">加载中...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">当前没有项目</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-750 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    项目名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    创建人
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    需求方
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    创建时间
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => handleProjectClick(project.id)}
                    className="hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {project.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {project.projectDetails?.creator || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {project.projectDetails?.requester || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {formatDate(project.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

