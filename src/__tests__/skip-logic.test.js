describe('Skip Logic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should identify skip patterns correctly', () => {
    const skipIfTitleContains = ['Bump SDK', 'no ticket for this PR', 'chore:'];
    
    const testCases = [
      { title: 'Bump SDK to v2.1.0', shouldSkip: true, matchedString: 'Bump SDK' },
      { title: 'no ticket for this PR - quick fix', shouldSkip: true, matchedString: 'no ticket for this PR' },
      { title: 'chore: update dependencies', shouldSkip: true, matchedString: 'chore:' },
      { title: 'CHORE: update dependencies', shouldSkip: true, matchedString: 'chore:' },
      { title: 'BUMP SDK to v2.1.0', shouldSkip: true, matchedString: 'Bump SDK' },
      { title: 'SC-123: Add feature', shouldSkip: false, matchedString: null },
      { title: 'Fix bug in authentication', shouldSkip: false, matchedString: null },
      { title: 'Update documentation', shouldSkip: false, matchedString: null }
    ];

    testCases.forEach(({ title, shouldSkip, matchedString }) => {
      const actualShouldSkip = skipIfTitleContains.some(skipString => 
        title.toLowerCase().includes(skipString.toLowerCase())
      );
      
      expect(actualShouldSkip).toBe(shouldSkip);
      
      if (shouldSkip) {
        const actualMatchedString = skipIfTitleContains.find(skipString => 
          title.toLowerCase().includes(skipString.toLowerCase())
        );
        expect(actualMatchedString).toBe(matchedString);
      }
    });
  });

  test('should handle empty skip patterns', () => {
    const skipIfTitleContains = [];
    const prTitle = 'Bump SDK to v2.1.0';
    
    const shouldSkip = skipIfTitleContains.some(skipString => 
      prTitle.toLowerCase().includes(skipString.toLowerCase())
    );
    
    expect(shouldSkip).toBe(false);
  });

  test('should handle single skip pattern', () => {
    const skipIfTitleContains = ['Bump SDK'];
    
    const testCases = [
      { title: 'Bump SDK to v2.1.0', shouldSkip: true },
      { title: 'SC-123: Add feature', shouldSkip: false },
      { title: 'Fix bug', shouldSkip: false }
    ];

    testCases.forEach(({ title, shouldSkip }) => {
      const actualShouldSkip = skipIfTitleContains.some(skipString => 
        title.toLowerCase().includes(skipString.toLowerCase())
      );
      expect(actualShouldSkip).toBe(shouldSkip);
    });
  });

  test('should handle case insensitive matching', () => {
    const skipIfTitleContains = ['bump sdk', 'CHORE:', 'No Ticket For This PR'];
    
    const testCases = [
      { title: 'BUMP SDK to v2.1.0', shouldSkip: true },
      { title: 'Bump SDK to v2.1.0', shouldSkip: true },
      { title: 'bump sdk to v2.1.0', shouldSkip: true },
      { title: 'chore: update dependencies', shouldSkip: true },
      { title: 'CHORE: update dependencies', shouldSkip: true },
      { title: 'Chore: update dependencies', shouldSkip: true },
      { title: 'no ticket for this pr - quick fix', shouldSkip: true },
      { title: 'NO TICKET FOR THIS PR - quick fix', shouldSkip: true },
      { title: 'No Ticket For This PR - quick fix', shouldSkip: true }
    ];

    testCases.forEach(({ title, shouldSkip }) => {
      const actualShouldSkip = skipIfTitleContains.some(skipString => 
        title.toLowerCase().includes(skipString.toLowerCase())
      );
      expect(actualShouldSkip).toBe(shouldSkip);
    });
  });

  test('should handle partial matches', () => {
    const skipIfTitleContains = ['Bump SDK', 'chore:'];
    
    const testCases = [
      { title: 'Bump SDK to v2.1.0', shouldSkip: true },
      { title: 'Bump SDK', shouldSkip: true },
      { title: 'chore: update', shouldSkip: true },
      { title: 'chore:', shouldSkip: true },
      { title: 'Bump', shouldSkip: false },
      { title: 'SDK', shouldSkip: false },
      { title: 'chore', shouldSkip: false }
    ];

    testCases.forEach(({ title, shouldSkip }) => {
      const actualShouldSkip = skipIfTitleContains.some(skipString => 
        title.toLowerCase().includes(skipString.toLowerCase())
      );
      expect(actualShouldSkip).toBe(shouldSkip);
    });
  });

  test('should skip when title contains "Bump SDK" pattern', () => {
    const skipIfTitleContains = ['Bump SDK'];
    
    const testCases = [
      { title: 'Bump SDK to 1.x.0', shouldSkip: true, matchedString: 'Bump SDK' },
      { title: 'Bump SDK to v2.1.0', shouldSkip: true, matchedString: 'Bump SDK' },
      { title: 'Bump SDK to latest', shouldSkip: true, matchedString: 'Bump SDK' },
      { title: 'BUMP SDK to 1.x.0', shouldSkip: true, matchedString: 'Bump SDK' },
      { title: 'bump sdk to 1.x.0', shouldSkip: true, matchedString: 'Bump SDK' },
      { title: 'Bump SDK', shouldSkip: true, matchedString: 'Bump SDK' },
      { title: 'SC-123: Add feature', shouldSkip: false, matchedString: null },
      { title: 'Fix bug in authentication', shouldSkip: false, matchedString: null },
      { title: 'Update documentation', shouldSkip: false, matchedString: null }
    ];

    testCases.forEach(({ title, shouldSkip, matchedString }) => {
      const actualShouldSkip = skipIfTitleContains.some(skipString => 
        title.toLowerCase().includes(skipString.toLowerCase())
      );
      
      expect(actualShouldSkip).toBe(shouldSkip);
      
      if (shouldSkip) {
        const actualMatchedString = skipIfTitleContains.find(skipString => 
          title.toLowerCase().includes(skipString.toLowerCase())
        );
        expect(actualMatchedString).toBe(matchedString);
      }
    });
  });

  test('should skip when title contains [External Team] pattern', () => {
    const skipIfTitleContains = ['Bump SDK', 'Merge release', '[Release]', '[External Team]'];
    const title = 'feat: feeature fix [External Team]';

    const shouldSkip = skipIfTitleContains.some(skipString => 
      title.toLowerCase().includes(skipString.toLowerCase())
    );

    expect(shouldSkip).toBe(true);
  });

  test('should skip [External Team] case-insensitively', () => {
    const skipIfTitleContains = ['[external team]'];
    const cases = [
      'feat: thing [EXTERNAL TEAM]',
      'chore: refactor [external team]',
      'fix: bug [External Team]'
    ];

    cases.forEach(title => {
      const shouldSkip = skipIfTitleContains.some(skipString =>
        title.toLowerCase().includes(skipString.toLowerCase())
      );
      expect(shouldSkip).toBe(true);
    });
  });
});
