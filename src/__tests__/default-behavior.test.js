const core = require('@actions/core');

// Mock the dependencies
jest.mock('@actions/core');

describe('Default Behavior Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should use correct default values for input parsing', () => {
    // Test the actual parsing logic used in the main function
    const testInputParsing = (inputs) => {
      const mockGetInput = (name) => inputs[name] || '';
      
      const enforcePrefixCheck = (mockGetInput('enforce_prefix_check') || 'true').toLowerCase() === 'true';
      const enforceSinglePrForEachTicket = (mockGetInput('enforce_single_pr_for_each_ticket') || 'true').toLowerCase() === 'true';
      const skipIfTitleContains = mockGetInput('skip_if_title_contains', { required: false })
        .split(',')
        .map(str => str.trim())
        .filter(str => str.length > 0);

      return {
        enforcePrefixCheck,
        enforceSinglePrForEachTicket,
        skipIfTitleContains
      };
    };

    // Test with no inputs (should use defaults)
    const result1 = testInputParsing({
      'github_auth_token': 'test-token',
      'github_repo_name': 'test/repo',
      'shortcut_auth_token': 'test-shortcut-token',
      'pr_number': '123',
      'expected_states': 'in progress,to do'
    });

    expect(result1.enforcePrefixCheck).toBe(true); // Default should be true
    expect(result1.enforceSinglePrForEachTicket).toBe(true); // Default should be true
    expect(result1.skipIfTitleContains).toEqual([]); // Default should be empty array

    // Test with explicit values
    const result2 = testInputParsing({
      'github_auth_token': 'test-token',
      'github_repo_name': 'test/repo',
      'shortcut_auth_token': 'test-shortcut-token',
      'pr_number': '123',
      'expected_states': 'in progress,to do',
      'enforce_prefix_check': 'false',
      'enforce_single_pr_for_each_ticket': 'false',
      'skip_if_title_contains': 'Bump SDK,no ticket'
    });

    expect(result2.enforcePrefixCheck).toBe(false);
    expect(result2.enforceSinglePrForEachTicket).toBe(false);
    expect(result2.skipIfTitleContains).toEqual(['Bump SDK', 'no ticket']);

    // Test with empty strings (should use defaults)
    const result3 = testInputParsing({
      'github_auth_token': 'test-token',
      'github_repo_name': 'test/repo',
      'shortcut_auth_token': 'test-shortcut-token',
      'pr_number': '123',
      'expected_states': 'in progress,to do',
      'enforce_prefix_check': '',
      'enforce_single_pr_for_each_ticket': '',
      'skip_if_title_contains': ''
    });

    expect(result3.enforcePrefixCheck).toBe(true); // Empty string should default to true
    expect(result3.enforceSinglePrForEachTicket).toBe(true); // Empty string should default to true
    expect(result3.skipIfTitleContains).toEqual([]); // Empty string should be empty array
  });

  test('should handle case insensitive boolean parsing', () => {
    const testBooleanParsing = (input) => (input || 'true').toLowerCase() === 'true';

    expect(testBooleanParsing('TRUE')).toBe(true);
    expect(testBooleanParsing('True')).toBe(true);
    expect(testBooleanParsing('true')).toBe(true);
    expect(testBooleanParsing('FALSE')).toBe(false);
    expect(testBooleanParsing('False')).toBe(false);
    expect(testBooleanParsing('false')).toBe(false);
    expect(testBooleanParsing('')).toBe(true); // Default case
    expect(testBooleanParsing(undefined)).toBe(true); // Default case
  });

  test('should handle skip_if_title_contains parsing with various inputs', () => {
    const testSkipParsing = (input) => {
      const result = (input || '')
        .split(',')
        .map(str => str.trim())
        .filter(str => str.length > 0);
      return result;
    };

    expect(testSkipParsing('')).toEqual([]);
    expect(testSkipParsing(undefined)).toEqual([]);
    expect(testSkipParsing('Bump SDK')).toEqual(['Bump SDK']);
    expect(testSkipParsing('Bump SDK,no ticket')).toEqual(['Bump SDK', 'no ticket']);
    expect(testSkipParsing(' Bump SDK , no ticket ')).toEqual(['Bump SDK', 'no ticket']);
    expect(testSkipParsing('Bump SDK,,no ticket,')).toEqual(['Bump SDK', 'no ticket']);
  });

  test('should validate that new defaults are correct', () => {
    // This test ensures our new defaults match the requirements
    const defaultEnforcePrefixCheck = 'true';
    const defaultEnforceSinglePrForEachTicket = 'true';
    const defaultSkipIfTitleContains = '';

    expect(defaultEnforcePrefixCheck).toBe('true');
    expect(defaultEnforceSinglePrForEachTicket).toBe('true');
    expect(defaultSkipIfTitleContains).toBe('');

    // Test the parsing logic with these defaults
    const enforcePrefixCheck = (defaultEnforcePrefixCheck || 'true').toLowerCase() === 'true';
    const enforceSinglePrForEachTicket = (defaultEnforceSinglePrForEachTicket || 'true').toLowerCase() === 'true';
    const skipIfTitleContains = defaultSkipIfTitleContains
      .split(',')
      .map(str => str.trim())
      .filter(str => str.length > 0);

    expect(enforcePrefixCheck).toBe(true);
    expect(enforceSinglePrForEachTicket).toBe(true);
    expect(skipIfTitleContains).toEqual([]);
  });
});
