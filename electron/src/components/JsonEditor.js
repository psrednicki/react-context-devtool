import React, { useState, useRef } from 'react';

const JsonEditor = ({ 
  value = '', 
  placeholder = '', 
  readOnly = false, 
  onSubmit,
  submitLabel = 'Submit'
}) => {
  const [content, setContent] = useState(value);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Validate JSON if not empty
    if (newContent.trim()) {
      try {
        JSON.parse(newContent);
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    } else {
      setError(null);
    }
  };

  const handleSubmit = () => {
    if (error || !content.trim()) return;
    
    try {
      const parsed = JSON.parse(content);
      onSubmit?.(parsed);
      if (!readOnly) {
        setContent('');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleKeyDown = (e) => {
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newContent);
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
    
    // Handle Ctrl+Enter for submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && onSubmit) {
      handleSubmit();
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(content);
      const formatted = JSON.stringify(parsed, null, 2);
      setContent(formatted);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const clearContent = () => {
    setContent('');
    setError(null);
  };

  return (
    <div className="json-editor">
      <div className="editor-header">
        <div className="editor-actions">
          {!readOnly && (
            <>
              <button 
                onClick={formatJson}
                disabled={!content.trim() || !!error}
                className="btn btn-sm"
                title="Format JSON (Ctrl+Shift+F)"
              >
                Format
              </button>
              <button 
                onClick={clearContent}
                className="btn btn-sm"
                title="Clear content"
              >
                Clear
              </button>
            </>
          )}
        </div>
        
        {error && (
          <div className="editor-error">
            <span className="error-icon">⚠</span>
            <span className="error-message">{error}</span>
          </div>
        )}
      </div>
      
      <div className="editor-content">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`json-textarea ${error ? 'error' : ''} ${readOnly ? 'readonly' : ''}`}
          spellCheck={false}
        />
        
        <div className="editor-gutter">
          {content.split('\n').map((_, index) => (
            <div key={index} className="line-number">
              {index + 1}
            </div>
          ))}
        </div>
      </div>
      
      {onSubmit && !readOnly && (
        <div className="editor-footer">
          <button
            onClick={handleSubmit}
            disabled={!!error || !content.trim()}
            className="btn btn-primary"
          >
            {submitLabel}
          </button>
          <div className="editor-hint">
            Press Ctrl+Enter to submit
          </div>
        </div>
      )}
    </div>
  );
};

export default JsonEditor;