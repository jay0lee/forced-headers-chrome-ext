async function updateRulesFromPolicy() {
  chrome.storage.managed.get(['ManagedHeaders'], async (managedResult) => {
    let policies = managedResult.ManagedHeaders;
    
    // If ManagedHeaders is undefined, no enterprise policy is set. Fallback to local.
    if (policies === undefined) {
      const localResult = await chrome.storage.local.get(['LocalHeaders']);
      policies = localResult.LocalHeaders || [];
      console.log("No managed policy found. Using local test headers.");
    } else {
      console.log("Managed policy found. Overriding local test headers.");
    }

    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map(rule => rule.id);
    
    const newRules = [];
    
    policies.forEach((policy, index) => {
      if (Array.isArray(policy.domains) && policy.domains.length > 0 && policy.headerName && policy.headerValue) {
        newRules.push({
          id: index + 1, 
          priority: 1,
          action: {
            type: "modifyHeaders",
            requestHeaders: [
              {
                header: policy.headerName,
                operation: "set",
                value: policy.headerValue
              }
            ]
          },
          condition: {
            requestDomains: policy.domains,
            resourceTypes: [
              "main_frame", "sub_frame", "stylesheet", "script", "image", 
              "font", "object", "xmlhttprequest", "ping", "csp_report", 
              "media", "websocket", "other"
            ]
          }
        });
      }
    });

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds,
      addRules: newRules
    });
  });
}

chrome.runtime.onInstalled.addListener(updateRulesFromPolicy);
chrome.runtime.onStartup.addListener(updateRulesFromPolicy);

// Listen for BOTH managed and local storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'managed' && changes.ManagedHeaders) {
    updateRulesFromPolicy();
  }
  if (areaName === 'local' && changes.LocalHeaders) {
    updateRulesFromPolicy();
  }
});
