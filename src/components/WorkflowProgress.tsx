import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, MapPin, Camera, CheckCircle, Play, Pause, TrendingUp, Edit, ArrowLeft, Upload, X, Save, Eye } from 'lucide-react';
import { workflowOperations, workOperations, storageOperations, Workflow, WorkflowStep } from '../lib/supabase';

const WorkflowProgress: React.FC = () => {
  const { t } = useTranslation();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any | null>(null);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const [stepForm, setStepForm] = useState({
    status: 'pending' as const,
    completion_photos: [] as string[],
    location_data: null as any,
  });

  useEffect(() => {
    loadWorkflows();
    initializeStorage();
  }, []);

  const initializeStorage = async () => {
    try {
      await storageOperations.createBucket();
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  };

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await workflowOperations.getAll();
      // Show active and completed workflows
      setWorkflows(data.filter((workflow: any) => workflow.status !== 'draft'));
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWorkflow = (workflow: any) => {
    setSelectedWorkflow(workflow);
  };

  const handleBackToList = () => {
    setSelectedWorkflow(null);
    setEditingStep(null);
    loadWorkflows(); // Refresh data when going back
  };

  const handleEditStep = (step: WorkflowStep) => {
    setEditingStep(step);
    setStepForm({
      status: step.status,
      completion_photos: step.completion_photos || [],
      location_data: step.location_data,
    });
  };

  const handleSaveStep = async () => {
    if (!editingStep) return;

    try {
      const updates: Partial<WorkflowStep> = {
        status: stepForm.status,
        completion_photos: stepForm.completion_photos,
        location_data: stepForm.location_data,
      };

      if (stepForm.status === 'completed' && editingStep.status !== 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      await workflowOperations.updateStep(editingStep.id, updates);
      
      // Refresh the selected workflow
      const updatedWorkflows = await workflowOperations.getAll();
      const updatedWorkflow = updatedWorkflows.find((w: any) => w.id === selectedWorkflow?.id);
      setSelectedWorkflow(updatedWorkflow);
      
      setEditingStep(null);
      alert('Step updated successfully!');
    } catch (error) {
      console.error('Error updating step:', error);
      alert('Error updating step. Please try again.');
    }
  };

  const handleCaptureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
          };
          setStepForm({ ...stepForm, location_data: locationData });
          alert('Location captured successfully!');
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Error capturing location. Please try again.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Simulate photo upload (in real app, upload to storage)
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setStepForm({
        ...stepForm,
        completion_photos: [...stepForm.completion_photos, ...newPhotos]
      });
    }
  };

  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = stepForm.completion_photos.filter((_, i) => i !== index);
    setStepForm({ ...stepForm, completion_photos: updatedPhotos });
  };

  const handleChangeWorkflowStatus = async (workflowId: string, newStatus: string) => {
    try {
      // Update workflow status in database
      await workflowOperations.updateWorkflow(workflowId, { status: newStatus });
      
      // If workflow is completed, update associated work status
      if (newStatus === 'completed' && selectedWorkflow) {
        // Extract work title from workflow title
        const workTitle = selectedWorkflow.title.replace('Workflow for: ', '');
        const works = await workOperations.getAll();
        const associatedWork = works.find(work => work.title === workTitle);
        
        if (associatedWork) {
          await workOperations.update(associatedWork.id, { status: 'completed' });
        }
      }
      
      // Refresh workflows
      await loadWorkflows();
      
      // Update selected workflow
      const updatedWorkflows = await workflowOperations.getAll();
      const updatedWorkflow = updatedWorkflows.find((w: any) => w.id === workflowId);
      setSelectedWorkflow(updatedWorkflow);
      
      alert('Workflow status updated successfully!');
    } catch (error) {
      console.error('Error updating workflow status:', error);
      alert('Error updating workflow status. Please try again.');
    }
  };

  const getProgressPercentage = (steps: WorkflowStep[]) => {
    if (!steps || steps.length === 0) return 0;
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gradient-to-r from-gray-400 to-gray-500',
      active: 'bg-gradient-to-r from-blue-400 to-indigo-400',
      completed: 'bg-gradient-to-r from-green-400 to-emerald-400',
      pending: 'bg-gradient-to-r from-yellow-400 to-orange-400',
      in_progress: 'bg-gradient-to-r from-purple-400 to-pink-400',
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Single Workflow Detail View
  if (selectedWorkflow) {
    return (
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToList}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {selectedWorkflow.title}
                </h2>
                <p className="text-gray-600 mt-2">{selectedWorkflow.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedWorkflow.status}
                onChange={(e) => handleChangeWorkflowStatus(selectedWorkflow.id, e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {getProgressPercentage(selectedWorkflow.workflow_steps)}%
              </div>
              <div className="text-gray-600">Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {selectedWorkflow.workflow_steps?.length || 0}
              </div>
              <div className="text-gray-600">Total Steps</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {selectedWorkflow.workflow_steps?.filter((s: WorkflowStep) => s.status === 'completed').length || 0}
              </div>
              <div className="text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {selectedWorkflow.duration}
              </div>
              <div className="text-gray-600">Days</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage(selectedWorkflow.workflow_steps)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="space-y-4">
          {selectedWorkflow.workflow_steps?.map((step: WorkflowStep, index: number) => (
            <div
              key={step.id}
              className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                step.status === 'completed'
                  ? 'bg-green-50 border-green-200'
                  : step.status === 'in_progress'
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4 flex-1">
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg">{step.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(step.status)}`}>
                    {t(step.status.replace('_', ''))}
                  </span>
                </div>
                <button
                  onClick={() => handleEditStep(step)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200 ml-4"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 mr-2" />
                  <span>{step.duration} hours</span>
                </div>
                {step.location_data && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 mr-2" />
                    <span>Location captured</span>
                  </div>
                )}
                {step.completion_photos && step.completion_photos.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Camera className="w-3 h-3 mr-2" />
                    <span>{step.completion_photos.length} photos</span>
                  </div>
                )}
                {step.completed_at && (
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3 mr-2" />
                    <span>{new Date(step.completed_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Step Edit Modal */}
        {editingStep && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Edit Step: {editingStep.title}
                  </h3>
                  <button
                    onClick={() => setEditingStep(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={stepForm.status}
                      onChange={(e) => setStepForm({ ...stepForm, status: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCaptureLocation}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>Capture Location</span>
                      </button>
                      {stepForm.location_data && (
                        <div className="flex-1 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                          📍 {stepForm.location_data.address || `${stepForm.location_data.latitude}, ${stepForm.location_data.longitude}`}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Photos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Completion Photos
                    </label>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          disabled={uploadingPhotos}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        />
                        {uploadingPhotos && (
                          <div className="flex items-center space-x-2 text-blue-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-sm">Uploading...</span>
                          </div>
                        )}
                      </div>
                      
                      {stepForm.completion_photos.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {stepForm.completion_photos.map((photo, index) => (
                            <div key={index} className="relative">
                              <img
                                src={photo}
                                alt={`Completion photo ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkM5Ljc5IDEzLjc5IDkuNzkgMTAuMjEgMTIgOEMxNC4yMSAxMC4yMSAxNC4yMSAxMy43OSAxMiAxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                                }}
                              />
                              <button
                                onClick={() => handleRemovePhoto(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Supported formats: PNG, JPEG, JPG, GIF, WebP (Max 5MB per file)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
                  <button
                    onClick={() => setEditingStep(null)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveStep}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Workflow List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/20">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {t('workflowProgress')}
            </h2>
            <p className="text-gray-600 mt-2">Select a workflow to track progress and manage steps</p>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-4 border border-white/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workflows List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkflows.map((workflow) => (
          <div
            key={workflow.id}
            onClick={() => handleSelectWorkflow(workflow)}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/20 card-hover cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{workflow.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{workflow.description}</p>
              </div>
              <Eye className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
            </div>

            <div className="space-y-3">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">
                    {getProgressPercentage(workflow.workflow_steps)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage(workflow.workflow_steps)}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">
                    {workflow.workflow_steps?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500">Steps</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">
                    {workflow.workflow_steps?.filter((s: WorkflowStep) => s.status === 'completed').length || 0}
                  </div>
                  <div className="text-xs text-gray-500">Done</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">
                    {workflow.duration}
                  </div>
                  <div className="text-xs text-gray-500">Days</div>
                </div>
              </div>

              {/* Status */}
              <div className="flex justify-between items-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(workflow.status)}`}>
                  {t(workflow.status)}
                </span>
                <div className="text-xs text-gray-500">
                  {new Date(workflow.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredWorkflows.length === 0 && workflows.length > 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No workflows match your search</div>
          <p className="text-gray-500">Try adjusting your search terms or filters</p>
        </div>
      )}

      {workflows.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No workflows found</div>
          <p className="text-gray-500">Create workflows in Workflow Builder to track progress here</p>
        </div>
      )}
    </div>
  );
};

export default WorkflowProgress;