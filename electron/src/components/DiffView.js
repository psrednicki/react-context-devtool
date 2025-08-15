import React from 'react';

const DiffView = ({ oldValue, newValue }) => {
  const generateDiff = (oldObj, newObj, path = '') => {
    const changes = [];
    
    const oldKeys = oldObj ? Object.keys(oldObj) : [];
    const newKeys = newObj ? Object.keys(newObj) : [];
    const allKeys = [...new Set([...oldKeys, ...newKeys])];
    
    allKeys.forEach(key => {
      const currentPath = path ? `${path}.${key}` : key;
      const oldVal = oldObj?.[key];
      const newVal = newObj?.[key];
      
      if (oldVal === undefined && newVal !== undefined) {
        // Added
        changes.push({
          type: 'added',
          path: currentPath,
          value: newVal
        });
      } else if (oldVal !== undefined && newVal === undefined) {
        // Removed
        changes.push({
          type: 'removed',
          path: currentPath,
          value: oldVal
        });
      } else if (oldVal !== newVal) {
        if (typeof oldVal === 'object' && typeof newVal === 'object' && 
            oldVal !== null && newVal !== null && 
            !Array.isArray(oldVal) && !Array.isArray(newVal)) {
          // Nested object - recurse
          changes.push(...generateDiff(oldVal, newVal, currentPath));
        } else {
          // Modified
          changes.push({
            type: 'modified',
            path: currentPath,
            oldValue: oldVal,
            newValue: newVal
          });
        }
      }
    });
    
    return changes;
  };

  const formatValue = (value) => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getChangeIcon = (type) => {
    switch (type) {
      case 'added': return '+';
      case 'removed': return '-';
      case 'modified': return '~';
      default: return '?';
    }
  };

  const getChangeClass = (type) => {
    switch (type) {
      case 'added': return 'diff-added';
      case 'removed': return 'diff-removed';
      case 'modified': return 'diff-modified';
      default: return 'diff-unknown';
    }
  };

  if (!oldValue && !newValue) {
    return (
      <div className="diff-view">
        <div className="diff-empty">
          No data to compare
        </div>
      </div>
    );
  }

  const changes = generateDiff(oldValue, newValue);

  if (changes.length === 0) {
    return (
      <div className="diff-view">
        <div className="diff-no-changes">
          <span className="diff-icon">✓</span>
          No changes detected
        </div>
      </div>
    );
  }

  return (
    <div className="diff-view">
      <div className="diff-header">
        <h4>State Changes ({changes.length})</h4>
        <div className="diff-legend">
          <span className="diff-legend-item diff-added">+ Added</span>
          <span className="diff-legend-item diff-removed">- Removed</span>
          <span className="diff-legend-item diff-modified">~ Modified</span>
        </div>
      </div>
      
      <div className="diff-content">
        {changes.map((change, index) => (
          <div key={index} className={`diff-change ${getChangeClass(change.type)}`}>
            <div className="diff-change-header">
              <span className="diff-change-icon">
                {getChangeIcon(change.type)}
              </span>
              <span className="diff-change-path">
                {change.path}
              </span>
              <span className="diff-change-type">
                {change.type}
              </span>
            </div>
            
            <div className="diff-change-content">
              {change.type === 'modified' ? (
                <div className="diff-comparison">
                  <div className="diff-old">
                    <div className="diff-label">Before:</div>
                    <pre className="diff-value">{formatValue(change.oldValue)}</pre>
                  </div>
                  <div className="diff-new">
                    <div className="diff-label">After:</div>
                    <pre className="diff-value">{formatValue(change.newValue)}</pre>
                  </div>
                </div>
              ) : (
                <div className="diff-single">
                  <pre className="diff-value">
                    {formatValue(change.value || change.oldValue || change.newValue)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="diff-summary">
        <div className="diff-stats">
          <span className="diff-stat diff-added">
            +{changes.filter(c => c.type === 'added').length}
          </span>
          <span className="diff-stat diff-removed">
            -{changes.filter(c => c.type === 'removed').length}
          </span>
          <span className="diff-stat diff-modified">
            ~{changes.filter(c => c.type === 'modified').length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DiffView;