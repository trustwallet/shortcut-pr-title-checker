const core = require('@actions/core');

// Mock the dependencies
jest.mock('@actions/core');

describe('Input Parsing Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    core.setSecret.mockImplementation(() => {});
    core.info.mockImplementation(() => {});
    core.setOutput.mockImplementation(() => {});
    core.setFailed.mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should parse enforce_prefix_check with default true', () => {
    // Test default behavior (empty string)
    core.getInput.mockImplementation((name) => {
      const inputs = {
        'github_auth_token': 'test-token',
        'github_repo_name': 'test/repo',
        'shortcut_auth_token': 'test-shortcut-token',
        'pr_number': '123',
        'expected_states': 'in progress,to do'
      };
      return inputs[name] || '';
    });

    const enforcePrefixCheck = (core.getInput('enforce_prefix_check') || 'true').toLowerCase() === 'true';
    expect(enforcePrefixCheck).toBe(true);
  });

  test('should parse enforce_prefix_check with explicit true', () => {
    core.getInput.mockImplementation((name) => {
      const inputs = {
        'github_auth_token': 'test-token',
        'github_repo_name': 'test/repo',
        'shortcut_auth_token': 'test-shortcut-token',
        'pr_number': '123',
        'expected_states': 'in progress,to do',
        'enforce_prefix_check': 'true'
      };
      return inputs[name] || '';
    });

    const enforcePrefixCheck = (core.getInput('enforce_prefix_check') || 'true').toLowerCase() === 'true';
    expect(enforcePrefixCheck).toBe(true);
  });

  test('should parse enforce_prefix_check with explicit false', () => {
    core.getInput.mockImplementation((name) => {
      const inputs = {
        'github_auth_token': 'test-token',
        'github_repo_name': 'test/repo',
        'shortcut_auth_token': 'test-shortcut-token',
        'pr_number': '123',
        'expected_states': 'in progress,to do',
        'enforce_prefix_check': 'false'
      };
      return inputs[name] || '';
    });

    const enforcePrefixCheck = (core.getInput('enforce_prefix_check') || 'true').toLowerCase() === 'true';
    expect(enforcePrefixCheck).toBe(false);
  });

  test('should parse enforce_single_pr_for_each_ticket with default true', () => {
    core.getInput.mockImplementation((name) => {
      const inputs = {
        'github_auth_token': 'test-token',
        'github_repo_name': 'test/repo',
        'shortcut_auth_token': 'test-shortcut-token',
        'pr_number': '123',
        'expected_states': 'in progress,to do'
      };
      return inputs[name] || '';
    });

    const enforceSinglePrForEachTicket = (core.getInput('enforce_single_pr_for_each_ticket') || 'true').toLowerCase() === 'true';
    expect(enforceSinglePrForEachTicket).toBe(true);
  });

  test('should parse enforce_single_pr_for_each_ticket with explicit false', () => {
    core.getInput.mockImplementation((name) => {
      const inputs = {
        'github_auth_token': 'test-token',
        'github_repo_name': 'test/repo',
        'shortcut_auth_token': 'test-shortcut-token',
        'pr_number': '123',
        'expected_states': 'in progress,to do',
        'enforce_single_pr_for_each_ticket': 'false'
      };
      return inputs[name] || '';
    });

    const enforceSinglePrForEachTicket = (core.getInput('enforce_single_pr_for_each_ticket') || 'true').toLowerCase() === 'true';
    expect(enforceSinglePrForEachTicket).toBe(false);
  });

  test('should parse skip_if_title_contains with default empty', () => {
    core.getInput.mockImplementation((name) => {
      const inputs = {
        'github_auth_token': 'test-token',
        'github_repo_name': 'test/repo',
        'shortcut_auth_token': 'test-shortcut-token',
        'pr_number': '123',
        'expected_states': 'in progress,to do'
      };
      return inputs[name] || '';
    });

    const skipIfTitleContains = core.getInput('skip_if_title_contains', { required: false })
      .split(',')
      .map(str => str.trim())
      .filter(str => str.length > 0);
    
    expect(skipIfTitleContains).toEqual([]);
  });

  test('should parse skip_if_title_contains with values', () => {
    core.getInput.mockImplementation((name) => {
      const inputs = {
        'github_auth_token': 'test-token',
        'github_repo_name': 'test/repo',
        'shortcut_auth_token': 'test-shortcut-token',
        'pr_number': '123',
        'expected_states': 'in progress,to do',
        'skip_if_title_contains': 'Bump SDK,no ticket for this PR'
      };
      return inputs[name] || '';
    });

    const skipIfTitleContains = core.getInput('skip_if_title_contains', { required: false })
      .split(',')
      .map(str => str.trim())
      .filter(str => str.length > 0);
    
    expect(skipIfTitleContains).toEqual(['Bump SDK', 'no ticket for this PR']);
  });

  test('should handle case insensitive boolean parsing', () => {
    const testCases = [
      { input: 'TRUE', expected: true },
      { input: 'True', expected: true },
      { input: 'true', expected: true },
      { input: 'FALSE', expected: false },
      { input: 'False', expected: false },
      { input: 'false', expected: false },
      { input: '', expected: true }, // Default case
      { input: undefined, expected: true } // Default case
    ];

    testCases.forEach(({ input, expected }) => {
      const result = (input || 'true').toLowerCase() === 'true';
      expect(result).toBe(expected);
    });
  });

  test('should handle skip_if_title_contains with whitespace', () => {
    core.getInput.mockImplementation((name) => {
      const inputs = {
        'github_auth_token': 'test-token',
        'github_repo_name': 'test/repo',
        'shortcut_auth_token': 'test-shortcut-token',
        'pr_number': '123',
        'expected_states': 'in progress,to do',
        'skip_if_title_contains': ' Bump SDK , no ticket for this PR , '
      };
      return inputs[name] || '';
    });

    const skipIfTitleContains = core.getInput('skip_if_title_contains', { required: false })
      .split(',')
      .map(str => str.trim())
      .filter(str => str.length > 0);
    
    expect(skipIfTitleContains).toEqual(['Bump SDK', 'no ticket for this PR']);
  });

  test('should filter out empty strings from skip_if_title_contains', () => {
    core.getInput.mockImplementation((name) => {
      const inputs = {
        'github_auth_token': 'test-token',
        'github_repo_name': 'test/repo',
        'shortcut_auth_token': 'test-shortcut-token',
        'pr_number': '123',
        'expected_states': 'in progress,to do',
        'skip_if_title_contains': 'Bump SDK,,no ticket for this PR,'
      };
      return inputs[name] || '';
    });

    const skipIfTitleContains = core.getInput('skip_if_title_contains', { required: false })
      .split(',')
      .map(str => str.trim())
      .filter(str => str.length > 0);
    
    expect(skipIfTitleContains).toEqual(['Bump SDK', 'no ticket for this PR']);
  });
});
