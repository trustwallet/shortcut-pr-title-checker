const core = require('@actions/core');
const github = require('@actions/github');
const https = require('https');

/**
 * Extracts Shortcut ticket ID from PR title (anywhere in the title)
 * Supports formats like: "SC-123", "sc-456", "SHORTCUT-789", etc.
 */
function extractTicketId(prTitle) {
  const patterns = [
    /(?:^|\s)(?:SC|sc|SHORTCUT|shortcut)-(\d+)(?:\s|$)/i,
    /(?:^|\s)(?:SC|sc|SHORTCUT|shortcut)(\d+)(?:\s|$)/i
  ];
  
  for (const pattern of patterns) {
    const match = prTitle.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Extracts Shortcut ticket ID from PR title when it must be at the prefix.
 * Valid prefix cases:
 *  - "1234: title"
 *  - "#1234: title"
 *  - "sc-1234: title" (case-insensitive)
 *  - "#sc-1234: title" (case-insensitive)
 *  - "[sc-1234]: title" (case-insensitive)
 */
function extractPrefixTicketId(prTitle) {
  const patterns = [
    /^\s*#?\s*(\d+):\s+/i,
    /^\s*#?\s*(?:sc-)(\d+):\s+/i,
    /^\s*\[(?:sc-)(\d+)\]:\s+/i
  ];

  for (const pattern of patterns) {
    const match = prTitle.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

/**
 * Makes HTTP request to Shortcut API
 */
function makeShortcutRequest(token, endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.app.shortcut.com',
      port: 443,
      path: endpoint,
      method: 'GET',
      headers: {
        'Shortcut-Token': token,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: jsonData });
        } catch (error) {
          reject(new Error(`Failed to parse JSON response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.end();
  });
}

/**
 * Validates Shortcut ticket and checks linked PRs
 */
async function validateTicket(ticketId, authToken, expectedStates, checkUniquePR = false) {
  try {
    const response = await makeShortcutRequest(authToken, `/api/v3/stories/${ticketId}`);
    
    if (response.statusCode !== 200) {
      throw new Error(`Shortcut API returned status ${response.statusCode}: ${response.data.message || 'Unknown error'}`);
    }
    
    const ticket = response.data;
    const currentState = ticket.workflow_state.name.toLowerCase();
    const normalizedExpectedStates = expectedStates.map(state => state.toLowerCase().trim());
    
    // Check linked PRs if requested
    let linkedPRs = [];
    if (checkUniquePR && ticket.pull_requests && ticket.pull_requests.length > 0) {
      linkedPRs = ticket.pull_requests;
      if (linkedPRs.length > 1) {
        const prUrls = linkedPRs.map(pr => pr.url).join(', ');
        throw new Error(`Multiple PRs linked to ticket SC-${ticketId}: ${prUrls}`);
      }
    }
    
    return {
      id: ticket.id,
      title: ticket.name,
      state: ticket.workflow_state.name,
      isValid: normalizedExpectedStates.includes(currentState),
      currentState: currentState,
      linkedPRs: linkedPRs
    };
  } catch (error) {
    throw new Error(`Failed to validate ticket SC-${ticketId}: ${error.message}`);
  }
}


/**
 * Main action function
 */
async function run() {
  try {
    // Get inputs
    const githubToken = core.getInput('github_auth_token', { required: true });
    const repoName = core.getInput('github_repo_name', { required: true });
    const shortcutToken = core.getInput('shortcut_auth_token', { required: true });
    const prNumber = core.getInput('pr_number', { required: true });
    const expectedStates = core.getInput('expected_states', { required: true })
      .split(',')
      .map(state => state.trim())
      .filter(state => state.length > 0);
    const enforcePrefixCheck = (core.getInput('enforce_prefix_check') || 'false').toLowerCase() === 'true';
    const enforceSinglePrForEachTicket = (core.getInput('enforce_single_pr_for_each_ticket') || 'true').toLowerCase() === 'true';

    // Validate inputs
    if (expectedStates.length === 0) {
      throw new Error('Expected states cannot be empty');
    }

    // Initialize GitHub client
    const octokit = github.getOctokit(githubToken);

    // Get PR details
    const [owner, repo] = repoName.split('/');
    if (!owner || !repo) {
      throw new Error('Invalid repository name format. Expected: owner/repo');
    }

    const { data: pr } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: parseInt(prNumber)
    });

    const prTitle = pr.title;
    core.info(`Validating PR #${prNumber}: "${prTitle}"`);

    // Extract ticket ID from PR title
    const ticketId = enforcePrefixCheck ? extractPrefixTicketId(prTitle) : extractTicketId(prTitle);
    if (!ticketId) {
      const errorMsg = enforcePrefixCheck
        ? `❌ PR title must start with a Shortcut ticket number.\n` +
          `Valid prefixes: "1234: title", "#1234: title", "sc-1234: title", "#sc-1234: title", "[sc-1234]: title"\n` +
          `Current title: "${prTitle}"`
        : `❌ PR title does not contain a valid Shortcut ticket number.\n` +
          `Examples: "SC-123", "sc-456", "SHORTCUT-789"\n` +
          `Current title: "${prTitle}"`;
      core.setFailed(errorMsg);
      return;
    }

    core.info(`Found ticket ID: SC-${ticketId}`);

    // Validate ticket with Shortcut API and check linked PRs
    const ticketValidation = await validateTicket(ticketId, shortcutToken, expectedStates, enforceSinglePrForEachTicket);
    
    if (!ticketValidation.isValid) {
      const errorMsg = `❌ Shortcut ticket SC-${ticketId} is not in an expected state.\n` +
        `Current state: "${ticketValidation.state}"\n` +
        `Expected states: ${expectedStates.join(', ')}\n` +
        `Ticket title: "${ticketValidation.title}"`;
      core.setFailed(errorMsg);
      return;
    }

    // Success - set outputs
    core.setOutput('ticket_id', ticketId);
    core.setOutput('ticket_title', ticketValidation.title);
    core.setOutput('ticket_state', ticketValidation.state);

    const successMsg = `✅ PR validation successful!\n` +
      `Ticket: SC-${ticketId} - "${ticketValidation.title}"\n` +
      `State: ${ticketValidation.state}`;
    
    core.info(successMsg);

  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

// Run the action
run();

