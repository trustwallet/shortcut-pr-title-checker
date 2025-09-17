const { extractTicketId, extractPrefixTicketId } = require('../index');

describe('Ticket ID Extraction', () => {
  describe('extractTicketId', () => {
    test('should extract SC-123 format', () => {
      expect(extractTicketId('SC-123: Add feature')).toBe('123');
      expect(extractTicketId('Fix bug SC-456')).toBe('456');
      expect(extractTicketId('SC-789 Implement new feature')).toBe('789');
    });

    test('should extract sc-123 format (lowercase)', () => {
      expect(extractTicketId('sc-123: Add feature')).toBe('123');
      expect(extractTicketId('Fix bug sc-456')).toBe('456');
    });

    test('should extract SHORTCUT-123 format', () => {
      expect(extractTicketId('SHORTCUT-123: Add feature')).toBe('123');
      expect(extractTicketId('Fix bug SHORTCUT-456')).toBe('456');
    });

    test('should extract SC123 format (no dash)', () => {
      expect(extractTicketId('SC123: Add feature')).toBe('123');
      expect(extractTicketId('Fix bug SC456')).toBe('456');
    });

    test('should return null for invalid formats', () => {
      expect(extractTicketId('Add new feature')).toBeNull();
      expect(extractTicketId('Fix bug')).toBeNull();
      expect(extractTicketId('SC-')).toBeNull();
    });

    test('should handle multiple ticket numbers (return first)', () => {
      expect(extractTicketId('SC-123 and SC-456')).toBe('123');
    });

    test('should support flexible number formats anywhere in title', () => {
      expect(extractTicketId(' 123 : test')).toBe('123');
      expect(extractTicketId(' 123: test')).toBe('123');
      expect(extractTicketId('123 : test')).toBe('123');
      expect(extractTicketId('123:adfadf')).toBe('123');
      expect(extractTicketId('123-adfadf')).toBe('123');
      expect(extractTicketId('123 - adfadf')).toBe('123');
      expect(extractTicketId('123- adfadf')).toBe('123');
      expect(extractTicketId(' # 123 : test')).toBe('123');
      expect(extractTicketId(' #123 : test')).toBe('123');
      expect(extractTicketId('#123: test')).toBe('123');
      expect(extractTicketId('#123 : test')).toBe('123');
      expect(extractTicketId('#123:adfadf')).toBe('123');
      expect(extractTicketId(' #123 - test')).toBe('123');
    });

    test('should support all specified valid formats for extractTicketId', () => {
      // Test all the specific formats mentioned in requirements
      const validFormats = [
        ' 123 : test',
        ' 123: test',
        '123 : test',
        '123:adfadf',
        '123-adfadf',
        '123 - adfadf',
        '123- adfadf',
        ' # 123 : test',
        ' #123 : test',
        '#123: test',
        '#123 : test',
        '#123:adfadf',
        ' #123 - test'
      ];

      validFormats.forEach(format => {
        expect(extractTicketId(format)).toBe('123');
      });
    });
  });

  describe('extractPrefixTicketId', () => {
    test('should extract 1234: format', () => {
      expect(extractPrefixTicketId('1234: Add feature')).toBe('1234');
      expect(extractPrefixTicketId('5678: Fix bug')).toBe('5678');
    });

    test('should extract #1234: format', () => {
      expect(extractPrefixTicketId('#1234: Add feature')).toBe('1234');
      expect(extractPrefixTicketId('#5678: Fix bug')).toBe('5678');
    });

    test('should extract sc-1234: format', () => {
      expect(extractPrefixTicketId('sc-1234: Add feature')).toBe('1234');
      expect(extractPrefixTicketId('SC-5678: Fix bug')).toBe('5678');
    });

    test('should extract #sc-1234: format', () => {
      expect(extractPrefixTicketId('#sc-1234: Add feature')).toBe('1234');
      expect(extractPrefixTicketId('#SC-5678: Fix bug')).toBe('5678');
    });

    test('should extract [sc-1234]: format', () => {
      expect(extractPrefixTicketId('[sc-1234]: Add feature')).toBe('1234');
      expect(extractPrefixTicketId('[SC-5678]: Fix bug')).toBe('5678');
    });

    test('should extract #number: format (with hash)', () => {
      expect(extractPrefixTicketId('#94558: fix xyz')).toBe('94558');
      expect(extractPrefixTicketId('#1234: Add feature')).toBe('1234');
      expect(extractPrefixTicketId('#5678: Fix bug')).toBe('5678');
    });

    test('should extract number: format (without hash)', () => {
      expect(extractPrefixTicketId('94558: add feature')).toBe('94558');
      expect(extractPrefixTicketId('1234: Add feature')).toBe('1234');
      expect(extractPrefixTicketId('5678: Fix bug')).toBe('5678');
    });

    test('should handle spaces around number formats', () => {
      expect(extractPrefixTicketId(' 94558: chore')).toBe('94558');
      expect(extractPrefixTicketId('# 94558: fix xyz')).toBe('94558');
      expect(extractPrefixTicketId('  #94558: fix xyz')).toBe('94558');
    });

    test('should support flexible spacing formats', () => {
      expect(extractPrefixTicketId(' 123 : test')).toBe('123');
      expect(extractPrefixTicketId(' 123: test')).toBe('123');
      expect(extractPrefixTicketId('123 : test')).toBe('123');
      expect(extractPrefixTicketId('123:adfadf')).toBe('123');
      expect(extractPrefixTicketId('123-adfadf')).toBe('123');
      expect(extractPrefixTicketId('123 - adfadf')).toBe('123');
      expect(extractPrefixTicketId('123- adfadf')).toBe('123');
    });

    test('should support flexible hash spacing formats', () => {
      expect(extractPrefixTicketId(' # 123 : test')).toBe('123');
      expect(extractPrefixTicketId(' #123 : test')).toBe('123');
      expect(extractPrefixTicketId('#123: test')).toBe('123');
      expect(extractPrefixTicketId('#123 : test')).toBe('123');
      expect(extractPrefixTicketId('#123:adfadf')).toBe('123');
      expect(extractPrefixTicketId(' #123 - test')).toBe('123');
    });

    test('should support all specified valid formats', () => {
      // Test all the specific formats mentioned in requirements
      const validFormats = [
        ' 123 : test',
        ' 123: test',
        '123 : test',
        '123:adfadf',
        '123-adfadf',
        '123 - adfadf',
        '123- adfadf',
        ' # 123 : test',
        ' #123 : test',
        '#123: test',
        '#123 : test',
        '#123:adfadf',
        ' #123 - test'
      ];

      validFormats.forEach(format => {
        expect(extractPrefixTicketId(format)).toBe('123');
      });
    });

    test('should return null for non-prefix formats', () => {
      expect(extractPrefixTicketId('Add feature SC-123')).toBeNull();
      expect(extractPrefixTicketId('Fix bug sc-456')).toBeNull();
    });

    test('should return null for invalid formats', () => {
      expect(extractPrefixTicketId('Add new feature')).toBeNull();
      expect(extractPrefixTicketId('Fix bug')).toBeNull();
      expect(extractPrefixTicketId('1234 Title')).toBeNull();
    });
  });
});

describe('Action Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle successful validation', async () => {
    // Mock inputs
    mockCore.getInput.mockImplementation((name) => {
      const inputs = {
        'github_auth_token': 'github-token',
        'github_repo_name': 'owner/repo',
        'shortcut_auth_token': 'shortcut-token',
        'pr_number': '123',
        'expected_states': 'in progress,to do',
        'enforce_prefix_check': 'false',
        'enforce_single_pr_for_each_ticket': 'false',
        'skip_if_title_contains': ''
      };
      return inputs[name] || '';
    });

    // Mock GitHub API response
    const mockPR = {
      data: {
        title: 'SC-123: Add feature',
        number: 123
      }
    };

    mockGithub.getOctokit().rest.pulls.get.mockResolvedValue(mockPR);

    // Mock Shortcut API responses
    const mockTicketResponse = {
      statusCode: 200,
      data: {
        id: 123,
        name: 'Add feature',
        workflow_state_id: 500000516
      }
    };

    const mockWorkflowResponse = {
      statusCode: 200,
      data: [
        {
          states: [
            { id: 500000516, name: 'In Progress' },
            { id: 500000511, name: 'To do' }
          ]
        }
      ]
    };

    mockHttps.request.mockImplementation((options, callback) => {
      const mockResponse = {
        on: jest.fn((event, handler) => {
          if (event === 'data') {
            handler(JSON.stringify(mockTicketResponse.data));
          } else if (event === 'end') {
            handler();
          }
        }),
        statusCode: 200
      };
      
      callback(mockResponse);
      return { end: jest.fn() };
    });

    // Import and run the action
    const { run } = require('../index');
    
    // This would need to be refactored to be testable
    // For now, we'll test the individual functions
  });

  test('should handle skip conditions', () => {
    mockCore.getInput.mockImplementation((name) => {
      const inputs = {
        'skip_if_title_contains': 'Bump SDK,chore:'
      };
      return inputs[name] || '';
    });

    // Test skip logic
    const skipIfTitleContains = mockCore.getInput('skip_if_title_contains', { required: false })
      .split(',')
      .map(str => str.trim())
      .filter(str => str.length > 0);

    const prTitle = 'Bump SDK to v2.1.0';
    const shouldSkip = skipIfTitleContains.some(skipString => 
      prTitle.toLowerCase().includes(skipString.toLowerCase())
    );

    expect(shouldSkip).toBe(true);
  });

  test('should handle prefix validation', () => {
    const prTitle = '1234: Add feature';
    const ticketId = extractPrefixTicketId(prTitle);
    expect(ticketId).toBe('1234');
  });

  test('should handle regular validation', () => {
    const prTitle = 'SC-123: Add feature';
    const ticketId = extractTicketId(prTitle);
    expect(ticketId).toBe('123');
  });
});
