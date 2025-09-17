// Mock @actions/core
const mockCore = {
  getInput: jest.fn(),
  setOutput: jest.fn(),
  setSecret: jest.fn(),
  info: jest.fn(),
  setFailed: jest.fn()
};

// Mock @actions/github
const mockGithub = {
  getOctokit: jest.fn(() => ({
    rest: {
      pulls: {
        get: jest.fn()
      }
    }
  }))
};

// Mock https module
const mockHttps = {
  request: jest.fn()
};

// Set up mocks
jest.mock('@actions/core', () => mockCore);
jest.mock('@actions/github', () => mockGithub);
jest.mock('https', () => mockHttps);

// Export mocks for use in tests
global.mockCore = mockCore;
global.mockGithub = mockGithub;
global.mockHttps = mockHttps;
