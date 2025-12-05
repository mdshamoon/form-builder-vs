/**
 * Main App Component
 */

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from './stores/appStore';
import { TemplateSelector } from './components/TemplateSelector';
import { TemplateCanvas } from './components/TemplateCanvas';
import { PreviewCanvas } from './components/PreviewCanvas';
import { FieldEditorPopup } from './components/FieldEditorPopup';
import { Toolbar } from './components/Toolbar';
import { TemplateBuilder } from './components/TemplateBuilder';
import { LoginForm } from './components/LoginForm';
import { submissionsApi, authApi, templatesApi, pdfApi } from './services/api';
import { useQuery } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function FormView() {
  const {
    selectedTemplate,
    setSelectedTemplate,
    selectedFieldId,
    formData,
    setFormData,
    clearFormData,
    setIsMobile,
    currentUser,
    logout,
    isPreviewMode,
    setPreviewMode,
  } = useAppStore();
  const navigate = useNavigate();
  const [showLoginForm, setShowLoginForm] = useState(false);

  // Load draft for selected template
  useEffect(() => {
    if (!selectedTemplate) return;

    const loadDraft = async () => {
      try {
        // Get all submissions for this template
        const submissions = await submissionsApi.list({ template_id: selectedTemplate.id });
        // Find the most recent draft
        const draft = submissions
          .filter((s: any) => s.is_draft)
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        if (draft && draft.form_data) {
          // Ask user if they want to resume the draft
          if (window.confirm('You have a saved draft for this form. Would you like to resume it?')) {
            setFormData(draft.form_data);
          }
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    };

    loadDraft();
  }, [selectedTemplate, setFormData]);

  // Detect mobile/desktop
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);

  // Detect mobile/desktop on mount
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, [setIsMobile]);

  // Get selected field
  const selectedField = selectedTemplate?.fields.find((f) => f.id === selectedFieldId) || null;

  // Handlers
  const handleBack = () => {
    if (selectedTemplate) {
      if (window.confirm('Are you sure you want to go back? Unsaved changes will be lost.')) {
        setSelectedTemplate(null);
        clearFormData();
      }
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedTemplate) return;

    try {
      await submissionsApi.create({
        template_id: selectedTemplate.id,
        form_data: formData,
        is_draft: true,
      });
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Failed to save draft:', error);
      alert('Failed to save draft. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!selectedTemplate) return;

    // Validate required fields
    const missingFields = selectedTemplate.fields
      .filter((field) => field.required && !formData[field.id]?.trim())
      .map((field) => field.label);

    if (missingFields.length > 0) {
      alert(`Please fill in required fields:\n- ${missingFields.join('\n- ')}`);
      return;
    }

    try {
      await submissionsApi.create({
        template_id: selectedTemplate.id,
        form_data: formData,
        is_draft: false,
      });
      alert('Form submitted successfully!');
      setSelectedTemplate(null);
      clearFormData();
    } catch (error) {
      console.error('Failed to submit form:', error);
      alert('Failed to submit form. Please try again.');
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedTemplate) return;

    try {
      const filename = `${selectedTemplate.name.replace(/\s+/g, '_')}.pdf`;
      await pdfApi.downloadPdf(selectedTemplate.id, formData, filename);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Back/Home button */}
          {selectedTemplate ? (
            <button
              onClick={handleBack}
              className="btn-touch flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline font-semibold text-gray-900">Format Forge</span>
            </div>
          )}

          {/* Center: Title */}
          <h1 className="font-semibold text-gray-900 truncate text-center flex-1">
            {selectedTemplate?.name || 'Template Form Builder'}
          </h1>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {!selectedTemplate && (
              <>
                {currentUser ? (
                  <>
                    {currentUser.is_admin && (
                      <button
                        onClick={() => navigate('/builder')}
                        className="btn-touch flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="hidden sm:inline">New Template</span>
                      </button>
                    )}
                    <button
                      onClick={logout}
                      className="btn-touch flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 transition"
                      title="Logout"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="hidden sm:inline text-sm">{currentUser.email}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowLoginForm(true)}
                    className="btn-touch flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Login</span>
                  </button>
                )}
              </>
            )}
            {selectedTemplate && (
              <>
                <button
                  onClick={() => setPreviewMode(!isPreviewMode)}
                  className="btn-touch flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
                  title={isPreviewMode ? "Edit mode" : "Preview mode"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isPreviewMode ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                  <span className="hidden sm:inline">{isPreviewMode ? "Edit" : "Preview"}</span>
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="btn-touch flex items-center gap-2 px-3 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition shadow-sm"
                  title="Download PDF"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">PDF</span>
                </button>
                <button
                  onClick={handleSaveDraft}
                  className="hidden sm:flex btn-touch items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Draft
                </button>
                <button
                  onClick={handleSubmit}
                  className="btn-touch flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Submit
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {selectedTemplate ? (
          isPreviewMode ? (
            <PreviewCanvas template={selectedTemplate} />
          ) : (
            <TemplateCanvas template={selectedTemplate} />
          )
        ) : (
          <TemplateSelector />
        )}
      </div>

      {/* Field editor popup - only show in edit mode */}
      {selectedTemplate && !isPreviewMode && <FieldEditorPopup field={selectedField} />}

      {/* Login form */}
      {showLoginForm && <LoginForm onClose={() => setShowLoginForm(false)} />}
    </div>
  );
}

function BuilderView() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const { currentUser } = useAppStore();

  // Load template if editing
  const { data: template, isLoading } = useQuery({
    queryKey: ['template', templateId],
    queryFn: () => templatesApi.get(templateId!),
    enabled: !!templateId,
  });

  // Check if user is admin
  useEffect(() => {
    if (!currentUser || !currentUser.is_admin) {
      alert('Only admins can create templates. Please login as admin.');
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser || !currentUser.is_admin) {
    return null;
  }

  if (templateId && isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <TemplateBuilder
      template={template}
      onComplete={() => {
        navigate('/');
      }}
    />
  );
}

function AppContent() {
  const { setIsMobile, setCurrentUser } = useAppStore();

  // Check for existing auth token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      authApi.getCurrentUser()
        .then(user => setCurrentUser(user))
        .catch(() => {
          // Token invalid, remove it
          localStorage.removeItem('auth_token');
        });
    }
  }, [setCurrentUser]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FormView />} />
        <Route path="/builder" element={<BuilderView />} />
        <Route path="/builder/:templateId" element={<BuilderView />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
