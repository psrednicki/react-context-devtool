import React, { useState } from 'react';
import JsonTree from './JsonTree';
import JsonEditor from './JsonEditor';
import DiffView from './DiffView';

const ContextViewer = ({ contextData, onDispatchAction }) => {
  const [selectedTab, setSelectedTab] = useState('context');
  const [selectedContext, setSelectedContext] = useState(null);
  const [selectedReducer, setSelectedReducer] = useState(null);
  const [viewMode, setViewMode] = useState('tree'); // tree, raw, diff

  const { context, useReducer, contextKeys, useReducerKeys, reactInfo } = contextData;

  const hasContextData = contextKeys && contextKeys.length > 0;
  const hasReducerData = useReducerKeys && useReducerKeys.length > 0;
  const hasAnyData = hasContextData || hasReducerData;

  const handleContextSelect = (contextKey) => {
    setSelectedContext(contextKey);
    setSelectedTab('context');
  };

  const handleReducerSelect = (reducerKey) => {
    setSelectedReducer(reducerKey);
    setSelectedTab('useReducer');
  };

  const handleDispatchAction = (action) => {
    if (selectedReducer && onDispatchAction) {
      onDispatchAction({
        type: 'useReducer',
        debugId: selectedReducer,
        data: action
      });
    }
  };

  const renderEmptyState = () => (
    <div className="empty-state">
      <div className="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6"/>
          <path d="m21 12-6-3-6 3-6-3"/>
        </svg>
      </div>
      <h3>No React Context Data</h3>
      <p>Connect your React application to start debugging Context and useReducer.</p>
      <div className="empty-actions">
        <button className="btn btn-outline" onClick={() => setSelectedTab('help')}>
          View Setup Instructions
        </button>
      </div>
    </div>
  );

  const renderContextList = () => (
    <div className="data-list">
      <h4>Context Providers ({contextKeys.length})</h4>
      {contextKeys.map(key => (
        <div
          key={key}
          className={`data-item ${selectedContext === key ? 'selected' : ''}`}
          onClick={() => handleContextSelect(key)}
        >
          <div className="data-item-header">
            <span className="data-item-name">
              {context[key]?.displayName || key}
            </span>
            <span className="data-item-type">Context</span>
          </div>
          <div className="data-item-preview">
            {JSON.stringify(context[key]?.value).substring(0, 50)}...
          </div>
        </div>
      ))}
    </div>
  );

  const renderReducerList = () => (
    <div className="data-list">
      <h4>useReducer Hooks ({useReducerKeys.length})</h4>
      {useReducerKeys.map(key => (
        <div
          key={key}
          className={`data-item ${selectedReducer === key ? 'selected' : ''}`}
          onClick={() => handleReducerSelect(key)}
        >
          <div className="data-item-header">
            <span className="data-item-name">
              {useReducer[key]?.displayName || key}
            </span>
            <span className="data-item-type">useReducer</span>
          </div>
          <div className="data-item-stats">
            <span>Actions: {useReducer[key]?.actions?.length || 0}</span>
            <span>States: {useReducer[key]?.state?.length || 0}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContextDetails = () => {
    if (!selectedContext || !context[selectedContext]) return null;

    const contextItem = context[selectedContext];

    return (
      <div className="details-panel">
        <div className="details-header">
          <h3>{contextItem.displayName || selectedContext}</h3>
          <div className="view-mode-selector">
            <button
              className={viewMode === 'tree' ? 'active' : ''}
              onClick={() => setViewMode('tree')}
            >
              Tree
            </button>
            <button
              className={viewMode === 'raw' ? 'active' : ''}
              onClick={() => setViewMode('raw')}
            >
              Raw
            </button>
          </div>
        </div>
        
        <div className="details-content">
          {viewMode === 'tree' ? (
            <JsonTree data={contextItem.value} />
          ) : (
            <JsonEditor 
              value={JSON.stringify(contextItem.value, null, 2)}
              readOnly={true}
            />
          )}
        </div>
      </div>
    );
  };

  const renderReducerDetails = () => {
    if (!selectedReducer || !useReducer[selectedReducer]) return null;

    const reducerItem = useReducer[selectedReducer];

    return (
      <div className="details-panel">
        <div className="details-header">
          <h3>{reducerItem.displayName || selectedReducer}</h3>
          <div className="view-mode-selector">
            <button
              className={viewMode === 'tree' ? 'active' : ''}
              onClick={() => setViewMode('tree')}
            >
              State
            </button>
            <button
              className={viewMode === 'raw' ? 'active' : ''}
              onClick={() => setViewMode('raw')}
            >
              Actions
            </button>
            <button
              className={viewMode === 'diff' ? 'active' : ''}
              onClick={() => setViewMode('diff')}
            >
              Diff
            </button>
          </div>
        </div>
        
        <div className="details-content">
          {viewMode === 'tree' && (
            <div className="reducer-state">
              <h4>Current State</h4>
              <JsonTree 
                data={reducerItem.state[reducerItem.state.length - 1]} 
              />
            </div>
          )}
          
          {viewMode === 'raw' && (
            <div className="reducer-actions">
              <h4>Action History ({reducerItem.actions.length})</h4>
              <div className="action-list">
                {reducerItem.actions.map((action, index) => (
                  <div key={index} className="action-item">
                    <div className="action-header">
                      <span className="action-index">#{index}</span>
                      <span className="action-type">{action.type || 'Unknown'}</span>
                    </div>
                    <JsonTree data={action} />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {viewMode === 'diff' && reducerItem.state.length > 1 && (
            <DiffView
              oldValue={reducerItem.state[reducerItem.state.length - 2]}
              newValue={reducerItem.state[reducerItem.state.length - 1]}
            />
          )}
        </div>
        
        <div className="action-dispatcher">
          <h4>Dispatch Action</h4>
          <JsonEditor
            placeholder='{"type": "ACTION_TYPE", "payload": {}}'
            onSubmit={handleDispatchAction}
            submitLabel="Dispatch"
          />
        </div>
      </div>
    );
  };

  const renderHelpTab = () => (
    <div className="help-content">
      <h3>Setup Instructions</h3>
      
      <div className="help-section">
        <h4>Method 1: Browser Extension</h4>
        <ol>
          <li>Install React Context DevTool browser extension</li>
          <li>Open extension settings</li>
          <li>Select "Standalone Connection"</li>
          <li>Set port to match this application</li>
          <li>Click "Connect"</li>
        </ol>
      </div>
      
      <div className="help-section">
        <h4>Method 2: Direct Integration</h4>
        <pre><code>{`// Add to your React app
import { connectToDevTools } from 'react-context-devtool';

// Connect to this standalone app
connectToDevTools('ws://localhost:8097');`}</code></pre>
      </div>
      
      <div className="help-section">
        <h4>Context Setup</h4>
        <pre><code>{`// Set displayName for better debugging
const MyContext = React.createContext();
MyContext.displayName = 'MyContext';

// Or use displayName prop
<MyContext.Provider 
  value={value} 
  displayName="My Context Provider"
>
  <App />
</MyContext.Provider>`}</code></pre>
      </div>
      
      <div className="help-section">
        <h4>useReducer Setup</h4>
        <pre><code>{`// Named reducer functions work best
function myReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(myReducer, initialState);`}</code></pre>
      </div>
    </div>
  );

  return (
    <div className="context-viewer">
      <div className="viewer-header">
        <div className="tab-navigation">
          <button
            className={selectedTab === 'context' ? 'active' : ''}
            onClick={() => setSelectedTab('context')}
            disabled={!hasContextData}
          >
            Context ({contextKeys.length})
          </button>
          <button
            className={selectedTab === 'useReducer' ? 'active' : ''}
            onClick={() => setSelectedTab('useReducer')}
            disabled={!hasReducerData}
          >
            useReducer ({useReducerKeys.length})
          </button>
          <button
            className={selectedTab === 'help' ? 'active' : ''}
            onClick={() => setSelectedTab('help')}
          >
            Help
          </button>
        </div>
        
        {reactInfo.version && (
          <div className="react-info">
            React {reactInfo.version}
          </div>
        )}
      </div>
      
      <div className="viewer-content">
        {!hasAnyData && selectedTab !== 'help' ? (
          renderEmptyState()
        ) : (
          <div className="viewer-layout">
            {selectedTab === 'context' && (
              <>
                <div className="sidebar">
                  {renderContextList()}
                </div>
                <div className="main-panel">
                  {selectedContext ? renderContextDetails() : (
                    <div className="no-selection">
                      Select a Context Provider to view its data
                    </div>
                  )}
                </div>
              </>
            )}
            
            {selectedTab === 'useReducer' && (
              <>
                <div className="sidebar">
                  {renderReducerList()}
                </div>
                <div className="main-panel">
                  {selectedReducer ? renderReducerDetails() : (
                    <div className="no-selection">
                      Select a useReducer hook to view its data
                    </div>
                  )}
                </div>
              </>
            )}
            
            {selectedTab === 'help' && (
              <div className="full-panel">
                {renderHelpTab()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContextViewer;