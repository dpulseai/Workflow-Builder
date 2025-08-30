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
      serial_no: 'Serial No',
      taluka: 'Taluka',
      year: 'Year',
      work_name: 'Work Name',
      department: 'Department',
      approval_amount : 'Approval Amount',

      admin_approval_no: 'Admin Approval No',
      admin_approval_date: 'Admin Approval Date',
      admin_approval_amount: 'Admin Approval Amount',

      tech_approval_no: 'Tech Approval No',
      tech_approval_date: 'Tech Approval Date',
      tech_approval_amount: 'Tech Approval Amount',

      agreement_approval_no: 'Agreement Approval No',
      agreement_approval_date: 'Agreement Approval Date',
      agreement_approval_amount: 'Agreement Approval Amount',

      duration: 'Duration',
      contractor_name: 'Contractor Name',
      current_status: 'Current Status',
      delay: 'Delay',
      expected_completion: 'Expected Completion Date',
      note: 'Note',

      priority: "Priority",
      selectOption: "Select an option",
      low: "Low",
      medium: "Medium",
      high: "High",
      pending: "Pending",
      in_progress: "In Progress",
      completed: "Completed",
      // workTitle: 'Work Title',
      // description: 'Description',
      // assignedTo: 'Assigned To',
      // role: 'Role',
      // status: 'Status',
      // priority: 'Priority',
      // dueDate: 'Due Date',
      // actions: 'Actions',

      //cards
      completion: 'Completion',
      activeStages: 'ACTIVE STAGES',
      days: "days",
      cardInProgress: "In Progress",
      cardPending: "Pending",

      // Roles
      admin: 'Admin',
      clerk: 'Clerk',
      officer: 'Officer',
      developer: 'Developer',


      // Workflow
      createWorkflow: 'Create New Workflow',
      selectWork: 'Select Work',
      buildWorkflow: 'Build Workflow',
      workSelected: 'Work Selected',
      addStepsToWorkflow: 'Add Steps to Workflow',
      activateWorkflow: 'Activate Workflow',
      workflowActivated: 'Workflow Activated Successfully',
      workflowTitle: 'Workflow Title',
      workDuration: 'Duration (days)',
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

      serial_no: 'अनुक्रमांक',
      taluka: 'तालुका',
      year: 'वर्ष',
      work_name: 'कामाचे नाव',
      department: 'विभाग',
      approval_amount : 'मंजुरी रक्कम',

      admin_approval_no: 'प्रशासनिक मंजुरी क्रमांक',
      admin_approval_date: 'प्रशासनिक मंजुरी दिनांक',
      admin_approval_amount: 'प्रशासनिक मंजुरी रक्कम',

      tech_approval_no: 'तांत्रिक मंजुरी क्रमांक',
      tech_approval_date: 'तांत्रिक मंजुरी दिनांक',
      tech_approval_amount: 'तांत्रिक मंजुरी रक्कम',

      agreement_approval_no: 'करार मंजुरी क्रमांक',
      agreement_approval_date: 'करार मंजुरी दिनांक',
      agreement_approval_amount: 'करार मंजुरी रक्कम',

      workDuration: 'कालावधी',
      contractor_name: 'कंत्राटदाराचे नाव',
      current_status: 'सध्याची स्थिती',
      delay: 'उशीर',
      expected_completion: 'अपेक्षित पूर्णता दिनांक',
      note: 'नोंद',

      priority: "प्राधान्य",
      selectOption: "पर्याय निवडा",
      low: "कमी",
      medium: "मध्यम",
      high: "जास्त",
      pending: "प्रलंबित",
      in_progress: "सुरू आहे",
      completed: "पूर्ण",

      // workTitle: 'कार्याचे शीर्षक',
      // description: 'वर्णन',
      // assignedTo: 'नियुक्त केले',
      // role: 'भूमिका',
      // status: 'स्थिती',
      // priority: 'प्राधान्य',
      // dueDate: 'अंतिम तारीख',
      // actions: 'क्रिया',

      //cards
      completion: 'पूर्णत्व',
      activeStages: 'सद्यस्थिती टप्पे',
      days: "दिवस",
      inProgress: "प्रगतीमध्ये",
      cardPending: "प्रलंबित",

      // Roles
      admin: 'प्रशासक',
      clerk: 'लिपिक',
      officer: 'अधिकारी',
      developer: 'विकासक',


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