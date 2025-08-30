import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Eye, Copy, Clock, CheckCircle, Layers } from 'lucide-react';
import { workOperations, Work } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [works, setWorks] = useState<Work[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [viewingWork, setViewingWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    taluka: '',
    year: '',
    work_name: '',
    department: '',
    admin_approval_no: '',
    admin_approval_date: '',
    admin_approval_amount: '',
    tech_approval_no: '',
    tech_approval_date: '',
    tech_approval_amount: '',
    agreement_approval_no: '',
    agreement_approval_date: '',
    agreement_approval_amount: '',
    duration: '',
    contractor_name: '',
    priority: '',
    current_status: '',
    delay: '',
    expected_completion: '',
    note: '',
  });

  // Status & Priority filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  // Dynamic status card counts
  const completedStages = works.filter(w => w.current_status === 'completed').length;
  const inProgress = works.filter(w => w.current_status === 'in_progress').length;
  const pending = works.filter(w => w.current_status === 'pending').length;

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
      toast.error('Error loading works');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const requiredFields = [
      'taluka',
      'work_name',
      'department',
      'admin_approval_no',
      'admin_approval_date',
    ];
    for (let field of requiredFields) {
      if (!(formData as any)[field]) {
        toast.error(`${t(field)} is required`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingWork) {
        await workOperations.update(editingWork.id, formData);
        toast.success('Work updated successfully');
      } else {
        await workOperations.create(formData);
        toast.success('Work created successfully');
      }
      await loadWorks();
      resetForm();
    } catch (error) {
      console.error('Error saving work:', error);
      toast.error('Error saving work');
    }
  };

  const handleEdit = (work: Work) => {
    setEditingWork(work);
    setFormData({
      taluka: work.taluka || '',
      year: work.year || '',
      work_name: work.work_name || '',
      department: work.department || '',
      admin_approval_no: work.admin_approval_no || '',
      admin_approval_date: work.admin_approval_date || '',
      admin_approval_amount: work.admin_approval_amount || '',
      tech_approval_no: work.tech_approval_no || '',
      tech_approval_date: work.tech_approval_date || '',
      tech_approval_amount: work.tech_approval_amount || '',
      agreement_approval_no: work.agreement_approval_no || '',
      agreement_approval_date: work.agreement_approval_date || '',
      agreement_approval_amount: work.agreement_approval_amount || '',
      duration: work.duration || '',
      contractor_name: work.contractor_name || '',
      current_status: work.current_status || '',
      priority: work.priority || '',
      delay: work.delay || '',
      expected_completion: work.expected_completion || '',
      note: work.note || '',
    });
    setShowForm(true);
  };

  const handleView = (work: Work) => {
    setViewingWork(work);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this work?')) {
      try {
        await workOperations.delete(id);
        await loadWorks();
        toast.success('Work deleted successfully');
      } catch (error) {
        console.error('Error deleting work:', error);
        toast.error('Error deleting work');
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await workOperations.duplicate(id);
      await loadWorks();
      toast.success('Work duplicated successfully!');
    } catch (error) {
      console.error('Error duplicating work:', error);
      toast.error('Error duplicating work');
    }
  };

  const resetForm = () => {
    setFormData({
      taluka: '',
      year: '',
      work_name: '',
      department: '',
      admin_approval_no: '',
      admin_approval_date: '',
      admin_approval_amount: '',
      tech_approval_no: '',
      tech_approval_date: '',
      tech_approval_amount: '',
      agreement_approval_no: '',
      agreement_approval_date: '',
      agreement_approval_amount: '',
      duration: '',
      contractor_name: '',
      current_status: '',
      priority: '',
      delay: '',
      expected_completion: '',
      note: '',
    });
    setEditingWork(null);
    setShowForm(false);
  };

  // Filter works for table display
  const filteredWorks = works.filter((w) => {
    const statusMatch = statusFilter === 'all' || w.current_status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || w.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Cards Row */}
      <div className="w-full flex flex-row justify-center items-center gap-8 mb-2">
        {/* Completed, In Progress, Pending cards */}
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-xs bg-white/80 rounded-2xl shadow-lg p-6 flex items-center space-x-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-gray-500 text-sm font-semibold">{t('completion')}</div>
              <div className="text-2xl font-bold text-green-700 mt-1">
                {completedStages} {t('completion')}
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-xs bg-white/80 rounded-2xl shadow-lg p-6 flex items-center space-x-4">
            <Clock className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-gray-500 text-sm font-semibold">{t('cardInProgress')}</div>
              <div className="text-2xl font-bold text-blue-700 mt-1">
                {inProgress} {t('inProgress')}
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-xs bg-white/80 rounded-2xl shadow-lg p-6 flex items-center space-x-4">
            <Layers className="w-8 h-8 text-yellow-600" />
            <div>
              <div className="text-gray-500 text-sm font-semibold">{t('cardPending')}</div>
              <div className="text-2xl font-bold text-yellow-700 mt-1">
                {pending} {t('pending')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-emerald-600">{t('workManagement')}</h2>
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

      {/* Filters */}
      <div className="flex flex-row items-center gap-6 mb-4">
        <div className="flex flex-row items-center gap-2">
          <label className="font-medium text-gray-700">{t('Filter by Status')}:</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('All')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="in_progress">{t('inProgress')}</option>
            <option value="completed">{t('completion')}</option>
          </select>
        </div>
        <div className="flex flex-row items-center gap-2">
          <label className="font-medium text-gray-700">{t('Filter by Priority')}:</label>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('All')}</option>
            <option value="low">{t('low')}</option>
            <option value="medium">{t('medium')}</option>
            <option value="high">{t('high')}</option>
          </select>
        </div>
      </div>

      {/* Works Table */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-medium">{t('Sr. No')}</th>
                <th className="px-4 py-4 text-left text-xs font-medium">{t('taluka')}</th>
                <th className="px-4 py-4 text-left text-xs font-medium">{t('year')}</th>
                <th className="px-4 py-4 text-left text-xs font-medium">{t('work_name')}</th>
                <th className="px-4 py-4 text-left text-xs font-medium">{t('department')}</th>
                <th className="px-4 py-4 text-left text-xs font-medium">{t('approval_amount')}</th>
                <th className="px-4 py-4 text-left text-xs font-medium">{t('contractor_name')}</th>
                <th className="px-4 py-4 text-left text-xs font-medium">{t('delay')}</th>
                <th className="px-4 py-4 text-left text-xs font-medium">{t('note')}</th>
                <th className="px-4 py-4 text-left text-xs font-medium">{t('priority')}</th>
                <th className="px-4 py-4 text-left text-xs font-medium">{t('status')}</th>
                <th className="px-4 py-4 text-left text-xs font-medium">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredWorks.map((work, index) => (
                <tr key={work.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm">{index + 1}</td>
                  <td className="px-4 py-4 text-sm">{work.taluka}</td>
                  <td className="px-4 py-4 text-sm">{work.year}</td>
                  <td className="px-4 py-4 text-sm">{work.work_name}</td>
                  <td className="px-4 py-4 text-sm">{work.department}</td>
                  <td className="px-4 py-4 text-sm">{work.agreement_approval_amount}</td>
                  <td className="px-4 py-4 text-sm">{work.contractor_name}</td>
                  <td className="px-4 py-4 text-sm">{work.delay}</td>
                  <td className="px-4 py-4 text-sm">{work.note}</td>
                  <td className="px-4 py-4 text-sm">
                    {work.priority ? (
                      <span
                        className={`px-4 py-1 rounded-full text-xs font-semibold ${work.priority === 'low'
                          ? 'bg-green-100 text-green-700'
                          : work.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                          }`}
                      >
                        {t(work.priority)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {work.current_status ? (
                      <span
                        className={`px-4 py-1 rounded-full text-xs font-semibold ${work.current_status === 'pending'
                          ? 'bg-gray-100 text-gray-700'
                          : work.current_status === 'in_progress'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                          }`}
                      >
                        {t(work.current_status)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-2 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(work)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        title="View work"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(work)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit work"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(work.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Duplicate work"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(work.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete work"
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
        {filteredWorks.length === 0 && (
          <div className="text-center py-12 text-gray-500">No works found</div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-6 text-blue-600">
                {editingWork ? t('edit') : t('addNewWork')}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(formData).map((field) => {
                  const isRequired = [
                    'taluka',
                    'work_name',
                    'department',
                    'admin_approval_no',
                    'admin_approval_date',
                  ].includes(field);
                  if (field === 'priority' || field === 'current_status') {
                    return (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t(field)} {isRequired && <span className="text-red-500">*</span>}
                        </label>
                        <select
                          required={isRequired}
                          value={(formData as any)[field]}
                          onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">{t('selectOption')}</option>
                          {field === 'priority' && (
                            <>
                              <option value="low">{t('low')}</option>
                              <option value="medium">{t('medium')}</option>
                              <option value="high">{t('high')}</option>
                            </>
                          )}
                          {field === 'current_status' && (
                            <>
                              <option value="pending">{t('pending')}</option>
                              <option value="in_progress">{t('in_progress')}</option>
                              <option value="completed">{t('completed')}</option>
                            </>
                          )}
                        </select>
                      </div>
                    );
                  }
                  return (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t(field)} {isRequired && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type={
                          field.includes('date') || field === 'expected_completion'
                            ? 'date'
                            : field.includes('amount')
                              ? 'number'
                              : 'text'
                        }
                        required={isRequired}
                        value={(formData as any)[field]}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  );
                })}
                <div className="md:col-span-2 flex justify-end space-x-4 pt-6 border-t">
                  <button type="button" onClick={resetForm} className="btn-secondary">
                    {t('cancel')}
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingWork ? t('update') : t('save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingWork && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6">
            <h3 className="text-2xl font-bold mb-6 text-emerald-600">{t('view')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(formData).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t(field)}</label>
                  <div className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700">
                    {String((viewingWork as any)[field] || '-')}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewingWork(null)}
                className="btn-secondary"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
