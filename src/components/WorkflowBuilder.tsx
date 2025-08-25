import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Clock, User, Flag, Calendar, ArrowRight, CheckCircle, Settings } from 'lucide-react';
import { workOperations, workflowOperations, Work } from '../lib/supabase';

const WorkflowBuilder: React.FC = () => {
  const { t } = useTranslation();
  const [works, setWorks] = useState<Work[]>([]);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [steps, setSteps] = useState<Array<{
    title: string;
    description: string;
    duration: number;
    order: number;
  }>>([]);
  const [showStepForm, setShowStepForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stepForm, setStepForm] = useState({
    title: '',
    description: '',
    duration: 1,
  });

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    try {
      setLoading(true);
      const data = await workOperations.getAll();
      // Filter works that can have workflows (max 2 workflows per work)
      setWorks(data.filter(work => work.status !== 'completed'));
    } catch (error) {
      console.error('Error loading works:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWork = (work: Work) => {
    setSelectedWork(work);
    setSteps([]);
  };

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    const newStep = {
      ...stepForm,
      order: steps.length,
    };
    setSteps([...steps, newStep]);
    setStepForm({ title: '', description: '', duration: 1 });
    setShowStepForm(false);
  };

  const handleRemoveStep = (index: number) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    // Reorder remaining steps
    const reorderedSteps = updatedSteps.map((step, i) => ({ ...step, order: i }));
    setSteps(reorderedSteps);
  };

  const handleActivateWorkflow = async () => {
    if (!selectedWork || steps.length === 0) return;

    try {
      // Create workflow
      const workflow = await workflowOperations.create({
        title: `Workflow for: ${selectedWork.title}`,
        description: `Workflow created for work: ${selectedWork.description}`,
        duration: Math.ceil(steps.reduce((total, step) => total + step.duration, 0) / 24), // Convert hours to days
        status: 'active',
      });

      // Add steps to workflow
      for (const step of steps) {
        await workflowOperations.addStep({
          workflow_id: workflow.id,
          title: step.title,
          description: step.description,
          duration: step.duration,
          order: step.order,
          status: 'pending',
          completion_photos: [],
          location_data: null,
          completed_at: null,
        });
      }

      // Update work status to in_progress
      await workOperations.update(selectedWork.id, { status: 'in_progress' });

      alert(t('workflowActivated'));
      setSelectedWork(null);
      setSteps([]);
      await loadWorks();
    } catch (error) {
      console.error('Error activating workflow:', error);
    }
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

  const filteredWorks = works.filter(work =>
    work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    work.assigned_to.toLowerCase().includes(searchTerm.toLowerCase()) ||
    work.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              {t('workflowBuilder')}
            </h2>
            <p className="text-gray-600 mt-2">Select work and build workflow with custom steps</p>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Work Selection Panel */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-4 border border-white/20">
          <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {t('selectWork')}
          </h3>
          
          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search works..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          {selectedWork ? (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3 border-2 border-emerald-200 mb-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-emerald-900 text-sm">{selectedWork.title}</h4>
                <button
                  onClick={() => setSelectedWork(null)}
                  className="text-emerald-600 hover:text-emerald-800 text-xs"
                >
                  Change
                </button>
              </div>
              <p className="text-emerald-700 text-xs mb-2 line-clamp-2">{selectedWork.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${getRoleColor(selectedWork.role)}`}>
                  {t(selectedWork.role)}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(selectedWork.status)}`}>
                  {t(selectedWork.status.replace('_', ''))}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${getPriorityColor(selectedWork.priority)}`}>
                  <Flag className="w-2 h-2 mr-1" />
                  {t(selectedWork.priority)}
                </span>
              </div>
              <div className="flex items-center mt-2 text-xs text-emerald-600">
                <User className="w-3 h-3 mr-1" />
                {selectedWork.assigned_to}
                <Calendar className="w-3 h-3 ml-3 mr-1" />
                {new Date(selectedWork.due_date).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredWorks.map((work) => (
                <div
                  key={work.id}
                  onClick={() => handleSelectWork(work)}
                  className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:from-emerald-50 hover:to-teal-50 hover:border-emerald-200 cursor-pointer transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 text-sm truncate flex-1 mr-2">{work.title}</h4>
                    <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{work.description}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${getRoleColor(work.role)}`}>
                      {t(work.role)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${getPriorityColor(work.priority)}`}>
                      {t(work.priority)}
                    </span>
                  </div>
                </div>
              ))}
              
              {filteredWorks.length === 0 && works.length > 0 && (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">No works match your search</p>
                </div>
              )}
              
              {works.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No available works found</p>
                  <p className="text-sm mt-1">Create work in Dashboard first</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Workflow Builder Panel */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t('buildWorkflow')}
            </h3>
            {selectedWork && (
              <button
                onClick={() => setShowStepForm(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t('addStep')}</span>
              </button>
            )}
          </div>

          {!selectedWork ? (
            <div className="text-center py-12 text-gray-500">
              <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Select a work to start building workflow</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Steps List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {index + 1}
                        </span>
                        <h4 className="font-medium text-purple-900">{step.title}</h4>
                      </div>
                      <button
                        onClick={() => handleRemoveStep(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-sm text-purple-700 mb-2">{step.description}</p>
                    <div className="flex items-center text-xs text-purple-600">
                      <Clock className="w-3 h-3 mr-1" />
                      {step.duration} hours
                    </div>
                  </div>
                ))}
              </div>

              {steps.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No steps added yet</p>
                  <p className="text-sm mt-1">Add steps to build your workflow</p>
                </div>
              )}

              {/* Workflow Summary */}
              {steps.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-4 border border-indigo-200">
                  <h4 className="font-medium text-indigo-900 mb-2">Workflow Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-indigo-700 mb-2">
                    <span>Total Steps: {steps.length}</span>
                    <span>Total Duration: {steps.reduce((total, step) => total + step.duration, 0)} hours</span>
                    <span>Estimated Days: {Math.ceil(steps.reduce((total, step) => total + step.duration, 0) / 8)}</span>
                    <span>Work: {selectedWork.title}</span>
                  </div>
                  <button
                    onClick={handleActivateWorkflow}
                    className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>{t('activateWorkflow')}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Step Form Modal */}
      {showStepForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t('addStep')}
              </h3>
              
              <form onSubmit={handleAddStep} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('stepTitle')}
                  </label>
                  <input
                    type="text"
                    value={stepForm.title}
                    onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('description')}
                  </label>
                  <textarea
                    value={stepForm.description}
                    onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('stepDuration')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={stepForm.duration}
                    onChange={(e) => setStepForm({ ...stepForm, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowStepForm(false)}
                    className="btn-secondary"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {t('addStep')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowBuilder;