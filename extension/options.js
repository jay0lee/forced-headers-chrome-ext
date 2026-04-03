document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('rules-container');
  const addBtn = document.getElementById('add-rule');
  const saveBtn = document.getElementById('save-rules');
  const exportBtn = document.getElementById('export-rules');
  const statusBanner = document.getElementById('status-banner');
  const saveMessage = document.getElementById('save-message');

  let isManaged = false;

  // 1. Check for Enterprise Policy first
  chrome.storage.managed.get(['ManagedHeaders'], (managedResult) => {
    if (managedResult.ManagedHeaders !== undefined) {
      isManaged = true;
      statusBanner.textContent = "⚠️ An Enterprise Policy is currently active. Local settings below will NOT apply until the policy is removed.";
      statusBanner.className = "managed-active";
      statusBanner.style.display = "block";
    }

    // 2. Load Local Settings
    chrome.storage.local.get(['LocalHeaders'], (localResult) => {
      const rules = localResult.LocalHeaders || [];
      if (rules.length === 0) {
        addRuleRow(); // Show one empty row by default
      } else {
        rules.forEach(rule => {
          // Convert array back to comma-separated string for UI
          const domainsStr = rule.domains.join(', ');
          addRuleRow(domainsStr, rule.headerName, rule.headerValue);
        });
      }
    });
  });

  // UI: Add a new row
  function addRuleRow(domains = "", name = "", value = "") {
    const row = document.createElement('div');
    row.className = 'rule-row';
    row.innerHTML = `
      <input type="text" class="domains" placeholder="Domains (comma-separated)" value="${domains}">
      <input type="text" class="header-name" placeholder="Header Name" value="${name}">
      <input type="text" class="header-value" placeholder="Header Value" value="${value}">
      <button class="btn-remove">X</button>
    `;
    
    row.querySelector('.btn-remove').addEventListener('click', () => {
      row.remove();
    });

    container.appendChild(row);
  }

  addBtn.addEventListener('click', () => addRuleRow());

  // Function to gather data from the DOM into the JSON array format
  function getRulesFromUI() {
    const rows = container.querySelectorAll('.rule-row');
    const rules = [];

    rows.forEach(row => {
      const domainsInput = row.querySelector('.domains').value;
      const nameInput = row.querySelector('.header-name').value.trim();
      const valueInput = row.querySelector('.header-value').value.trim();

      // Clean up comma-separated domains into a neat array
      const domainArray = domainsInput.split(',')
        .map(d => d.trim())
        .filter(d => d.length > 0);

      if (domainArray.length > 0 && nameInput && valueInput) {
        rules.push({
          domains: domainArray,
          headerName: nameInput,
          headerValue: valueInput
        });
      }
    });
    return rules;
  }

  // Save to chrome.storage.local
  saveBtn.addEventListener('click', () => {
    const rules = getRulesFromUI();
    chrome.storage.local.set({ LocalHeaders: rules }, () => {
      saveMessage.textContent = "Saved locally!";
      setTimeout(() => { saveMessage.textContent = ""; }, 2000);
    });
  });

  // Export to Policy JSON
  exportBtn.addEventListener('click', () => {
    const rules = getRulesFromUI();
    const jsonString = JSON.stringify(rules, null, 2);
    
    // Create a downloadable Blob
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = "ManagedHeaders_Policy_Test.json";
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
