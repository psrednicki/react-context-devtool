import React, { useState } from 'react';

const JsonTree = ({ data, level = 0 }) => {
  const [expandedKeys, setExpandedKeys] = useState(new Set());

  const toggleExpanded = (key) => {
    const newExpanded = new Set(expandedKeys);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedKeys(newExpanded);
  };

  const renderValue = (value, key, path = '') => {
    const fullPath = path ? `${path}.${key}` : key;

    if (value === null) {
      return <span className="json-null">null</span>;
    }

    if (value === undefined) {
      return <span className="json-undefined">undefined</span>;
    }

    if (typeof value === 'boolean') {
      return <span className="json-boolean">{value.toString()}</span>;
    }

    if (typeof value === 'number') {
      return <span className="json-number">{value}</span>;
    }

    if (typeof value === 'string') {
      return <span className="json-string">"{value}"</span>;
    }

    if (typeof value === 'function') {
      return <span className="json-function">ƒ {value.name || 'anonymous'}</span>;
    }

    if (Array.isArray(value)) {
      const isExpanded = expandedKeys.has(fullPath);
      return (
        <div className="json-array">
          <span
            className="json-toggle"
            onClick={() => toggleExpanded(fullPath)}
          >
            {isExpanded ? '▼' : '▶'} Array({value.length})
          </span>
          {isExpanded && (
            <div className="json-children" style={{ marginLeft: '20px' }}>
              {value.map((item, index) => (
                <div key={index} className="json-item">
                  <span className="json-key">{index}:</span>
                  {renderValue(item, index, fullPath)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      const isExpanded = expandedKeys.has(fullPath);
      
      return (
        <div className="json-object">
          <span
            className="json-toggle"
            onClick={() => toggleExpanded(fullPath)}
          >
            {isExpanded ? '▼' : '▶'} Object({keys.length})
          </span>
          {isExpanded && (
            <div className="json-children" style={{ marginLeft: '20px' }}>
              {keys.map(objKey => (
                <div key={objKey} className="json-item">
                  <span className="json-key">{objKey}:</span>
                  {renderValue(value[objKey], objKey, fullPath)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return <span className="json-unknown">{String(value)}</span>;
  };

  if (data === null || data === undefined) {
    return <div className="json-tree">{renderValue(data, 'root')}</div>;
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data);
    return (
      <div className="json-tree">
        {keys.map(key => (
          <div key={key} className="json-item">
            <span className="json-key">{key}:</span>
            {renderValue(data[key], key)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="json-tree">
      {renderValue(data, 'value')}
    </div>
  );
};

export default JsonTree;