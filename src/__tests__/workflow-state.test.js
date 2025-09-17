describe('Workflow State Mapping Tests', () => {
  test('should map workflow state IDs to names correctly', () => {
    const mockWorkflowResponse = {
      statusCode: 200,
      data: [
        {
          name: 'Engineering',
          states: [
            { id: 500000514, name: 'Backlog' },
            { id: 500000511, name: 'To do' },
            { id: 500000516, name: 'In Progress' },
            { id: 500000518, name: 'In Review' },
            { id: 500000513, name: 'Done' }
          ]
        },
        {
          name: 'Standard',
          states: [
            { id: 500000006, name: 'Backlog' },
            { id: 500000007, name: 'To Do' },
            { id: 500000008, name: 'In Progress' },
            { id: 500000010, name: 'Done' }
          ]
        }
      ]
    };

    // Simulate the state mapping logic
    const stateMap = new Map();
    mockWorkflowResponse.data.forEach(workflow => {
      if (workflow.states) {
        workflow.states.forEach(state => {
          stateMap.set(state.id, state.name);
        });
      }
    });

    // Test mappings
    expect(stateMap.get(500000514)).toBe('Backlog');
    expect(stateMap.get(500000511)).toBe('To do');
    expect(stateMap.get(500000516)).toBe('In Progress');
    expect(stateMap.get(500000518)).toBe('In Review');
    expect(stateMap.get(500000513)).toBe('Done');
    expect(stateMap.get(500000006)).toBe('Backlog');
    expect(stateMap.get(500000007)).toBe('To Do');
    expect(stateMap.get(500000008)).toBe('In Progress');
    expect(stateMap.get(500000010)).toBe('Done');
  });

  test('should handle empty workflow response', () => {
    const mockWorkflowResponse = {
      statusCode: 200,
      data: []
    };

    const stateMap = new Map();
    mockWorkflowResponse.data.forEach(workflow => {
      if (workflow.states) {
        workflow.states.forEach(state => {
          stateMap.set(state.id, state.name);
        });
      }
    });

    expect(stateMap.size).toBe(0);
  });

  test('should handle workflows without states', () => {
    const mockWorkflowResponse = {
      statusCode: 200,
      data: [
        { name: 'Empty Workflow' },
        { name: 'Another Workflow', states: [] }
      ]
    };

    const stateMap = new Map();
    mockWorkflowResponse.data.forEach(workflow => {
      if (workflow.states) {
        workflow.states.forEach(state => {
          stateMap.set(state.id, state.name);
        });
      }
    });

    expect(stateMap.size).toBe(0);
  });

  test('should handle duplicate state IDs (last one wins)', () => {
    const mockWorkflowResponse = {
      statusCode: 200,
      data: [
        {
          name: 'Workflow 1',
          states: [
            { id: 500000514, name: 'Backlog' }
          ]
        },
        {
          name: 'Workflow 2',
          states: [
            { id: 500000514, name: 'Different Name' }
          ]
        }
      ]
    };

    const stateMap = new Map();
    mockWorkflowResponse.data.forEach(workflow => {
      if (workflow.states) {
        workflow.states.forEach(state => {
          stateMap.set(state.id, state.name);
        });
      }
    });

    expect(stateMap.get(500000514)).toBe('Different Name');
  });
});
