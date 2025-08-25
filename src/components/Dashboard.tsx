import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Eye, Calendar, User, Flag, Copy } from 'lucide-react';
import { workOperations, Work } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [works, setWorks] = useState<Work[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    role: 'clerk' as const,
    status: 'pending' as const,
    priority: 'medium' as const,
    due_date: '',
  });

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    try {
      setLoading(true);
      const data = await workOperations.getAll();
      setWorks(data);
    } catch (error) {
      console.error('Error loading works:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingWork) {
        await workOperations.update(editingWork.id, formData);
      } else {
        await workOperations.create(formData);
      }
      await loadWorks();
      resetForm();
    } catch (error) {
      console.error('Error saving work:', error);
    }
  };

  const handleEdit = (work: Work) => {
    setEditingWork(work);
    setFormData({
      title: work.title,
      description: work.description,
      assigned_to: work.assigned_to,
      role: work.role,
      status: work.status,
      priority: work.priority,
      due_date: work.due_date.split('T')[0],
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this work? This will also delete all associated workflows and steps.')) {
      try {
        await workOperations.delete(id);
        await loadWorks();
      } catch (error) {
        console.error('Error deleting work:', error);
        alert('Error deleting work. Please try again.');
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await workOperations.duplicate(id);
      await loadWorks();
      alert('Work duplicated successfully with all workflows and steps!');
    } catch (error) {
      console.error('Error duplicating work:', error);
      alert('Error duplicating work. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assigned_to: '',
      role: 'clerk',
      status: 'pending',
      priority: 'medium',
      due_date: '',
    });
    setEditingWork(null);
    setShowForm(false);
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-gradient-to-r from-purple-500 to-pink-500',
      clerk: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      officer: 'bg-gradient-to-r from-green-500 to-teal-500',
      developer: 'bg-gradient-to-r from-orange-500 to-red-500',
    };
    return colors[role as keyof typeof colors] || colors.clerk;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-gradient-to-r from-yellow-400 to-orange-400',
      in_progress: 'bg-gradient-to-r from-blue-400 to-indigo-400',
      completed: 'bg-gradient-to-r from-green-400 to-emerald-400',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gradient-to-r from-gray-400 to-gray-500',
      medium: 'bg-gradient-to-r from-yellow-400 to-amber-400',
      high: 'bg-gradient-to-r from-red-400 to-pink-400',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/20">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {t('workManagement')}
            </h2>
            <p className="text-gray-600 mt-2">Manage and track all work assignments</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>{t('addNewWork')}</span>
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {editingWork ? t('edit') : t('addNewWork')}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('workTitle')}
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('description')}
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('assignedTo')}
                    </label>
                    <input
                      type="text"
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('role')}
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="admin">{t('admin')}</option>
                      <option value="clerk">{t('clerk')}</option>
                      <option value="officer">{t('officer')}</option>
                      <option value="developer">{t('developer')}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('status')}
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="pending">{t('pending')}</option>
                      <option value="in_progress">{t('inProgress')}</option>
                      <option value="completed">{t('completed')}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('priority')}
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="low">{t('low')}</option>
                      <option value="medium">{t('medium')}</option>
                      <option value="high">{t('high')}</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('dueDate')}
                    </label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {editingWork ? t('update') : t('save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Works Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('workTitle')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('assignedTo')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('role')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('priority')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dueDate')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {works.map((work) => (
                <tr key={work.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{work.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{work.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{work.assigned_to}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${getRoleColor(work.role)}`}>
                      {t(work.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(work.status)}`}>
                      {t(work.status.replace('_', ''))}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${getPriorityColor(work.priority)}`}>
                      <Flag className="w-3 h-3 mr-1" />
                      {t(work.priority)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      {new Date(work.due_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(work)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Edit work"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(work.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="Duplicate work with all workflows and steps"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(work.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete work and all associated workflows"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {works.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No works found</div>
            <p className="text-gray-500">Create your first work to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;