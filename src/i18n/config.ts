import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appTitle: 'Workflow Builder',
      dashboard: 'Dashboard',
      workflowProgress: 'Workflow Progress',
      workflowBuilder: 'Workflow Builder',
      language: 'Language',
      english: 'English',
      marathi: 'मराठी',
      
      // Dashboard
      workManagement: 'Work Management',
      addNewWork: 'Add New Work',
      workTitle: 'Work Title',
      description: 'Description',
      assignedTo: 'Assigned To',
      role: 'Role',
      status: 'Status',
      priority: 'Priority',
      dueDate: 'Due Date',
      actions: 'Actions',
      
      // Roles
      admin: 'Admin',
      clerk: 'Clerk',
      officer: 'Officer',
      developer: 'Developer',
      
      // Status
      pending: 'Pending',
      inProgress: 'In Progress',
      completed: 'Completed',
      
      // Priority
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      
      // Workflow
      createWorkflow: 'Create New Workflow',
      selectWork: 'Select Work',
      buildWorkflow: 'Build Workflow',
      workSelected: 'Work Selected',
      addStepsToWorkflow: 'Add Steps to Workflow',
      activateWorkflow: 'Activate Workflow',
      workflowActivated: 'Workflow Activated Successfully',
      workflowTitle: 'Workflow Title',
      duration: 'Duration (days)',
      addStep: 'Add Step',
      stepTitle: 'Step Title',
      stepDuration: 'Duration (hours)',
      progress: 'Progress',
      uploadPhoto: 'Upload Photo',
      captureLocation: 'Capture Location',
      completeStep: 'Complete Step',
      
      // Buttons
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      create: 'Create',
      update: 'Update',
      
      // Messages
      workCreated: 'Work created successfully',
      workUpdated: 'Work updated successfully',
      workDeleted: 'Work deleted successfully',
      workDuplicated: 'Work duplicated successfully',
      workflowCreated: 'Workflow created successfully',
      stepCompleted: 'Step completed successfully',
      locationCaptured: 'Location captured successfully',
      photoUploaded: 'Photo uploaded successfully',
    }
  },
  mr: {
    translation: {
      appTitle: 'वर्कफ्लो बिल्डर',
      dashboard: 'डॅशबोर्ड',
      workflowProgress: 'वर्कफ्लो प्रगती',
      workflowBuilder: 'वर्कफ्लो बिल्डर',
      language: 'भाषा',
      english: 'English',
      marathi: 'मराठी',
      
      // Dashboard
      workManagement: 'कार्य व्यवस्थापन',
      addNewWork: 'नवीन कार्य जोडा',
      workTitle: 'कार्याचे शीर्षक',
      description: 'वर्णन',
      assignedTo: 'नियुक्त केले',
      role: 'भूमिका',
      status: 'स्थिती',
      priority: 'प्राधान्य',
      dueDate: 'अंतिम तारीख',
      actions: 'क्रिया',
      
      // Roles
      admin: 'प्रशासक',
      clerk: 'लिपिक',
      officer: 'अधिकारी',
      developer: 'विकासक',
      
      // Status
      pending: 'प्रलंबित',
      inProgress: 'प्रगतीत',
      completed: 'पूर्ण',
      
      // Priority
      low: 'कमी',
      medium: 'मध्यम',
      high: 'उच्च',
      
      // Workflow
      createWorkflow: 'नवीन वर्कफ्लो तयार करा',
      selectWork: 'कार्य निवडा',
      buildWorkflow: 'वर्कफ्लो तयार करा',
      workSelected: 'कार्य निवडले',
      addStepsToWorkflow: 'वर्कफ्लोमध्ये पायऱ्या जोडा',
      activateWorkflow: 'वर्कफ्लो सक्रिय करा',
      workflowActivated: 'वर्कफ्लो यशस्वीरित्या सक्रिय केले',
      workflowTitle: 'वर्कफ्लो शीर्षक',
      duration: 'कालावधी (दिवस)',
      addStep: 'पायरी जोडा',
      stepTitle: 'पायरीचे शीर्षक',
      stepDuration: 'कालावधी (तास)',
      progress: 'प्रगती',
      uploadPhoto: 'फोटो अपलोड करा',
      captureLocation: 'स्थान कॅप्चर करा',
      completeStep: 'पायरी पूर्ण करा',
      
      // Buttons
      save: 'जतन करा',
      cancel: 'रद्द करा',
      edit: 'संपादित करा',
      delete: 'हटवा',
      view: 'पहा',
      create: 'तयार करा',
      update: 'अद्यतनित करा',
      
      // Messages
      workCreated: 'कार्य यशस्वीरित्या तयार केले',
      workUpdated: 'कार्य यशस्वीरित्या अद्यतनित केले',
      workDeleted: 'कार्य यशस्वीरित्या हटवले',
      workDuplicated: 'कार्य यशस्वीरित्या डुप्लिकेट केले',
      workflowCreated: 'वर्कफ्लो यशस्वीरित्या तयार केले',
      stepCompleted: 'पायरी यशस्वीरित्या पूर्ण केली',
      locationCaptured: 'स्थान यशस्वीरित्या कॅप्चर केले',
      photoUploaded: 'फोटो यशस्वीरित्या अपलोड केला',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'mr', // Default to Marathi
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;