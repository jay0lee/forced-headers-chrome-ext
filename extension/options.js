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
      
      // Show the managed warning banner
      statusBanner.textContent = "These options are set by your admin and can't be changed.";
      statusBanner.className = "managed-active";
      statusBanner.style.display = "block";

      // Disable buttons
      addBtn.disabled = true;
      saveBtn.disabled = true;
      addBtn.style.opacity = "0.5";
      saveBtn.style.opacity = "0.5";
      addBtn.style.cursor = "not-allowed";
      saveBtn.style.cursor = "not-allowed";

      // Load managed rules into the UI as read-only
      const rules = managedResult.ManagedHeaders || [];
      if (rules.length === 0) {
        addRuleRow("", "", "", true);
      } else {
        rules.forEach(rule => {
          const domainsStr = rule.domains ? rule.domains.join(', ') : "";
          addRuleRow(domainsStr, rule.headerName, rule.headerValue, true);
        });
      }
    } else {
      // 2. No policy active: Load Local Settings
      chrome.storage.local.get(['LocalHeaders'], (localResult) => {
        const rules = localResult.LocalHeaders || [];
        if (rules.length === 0) {
          addRuleRow(); // Show one empty row by default
        } else {
          rules.forEach(rule => {
            const domainsStr = rule.domains ? rule.domains.join(', ') : "";
            addRuleRow(domainsStr, rule.headerName, rule.headerValue, false);
          });
        }
      });
    }
  });

  // UI: Add a new row
  // Now accepts a readOnly parameter to lock the inputs and hide the remove button
  function addRuleRow(domains = "", name = "", value = "", readOnly = false) {
    const row = document.createElement('div');
    row.className = 'rule-row';
    
    const disabledAttr = readOnly ? 'disabled="disabled"' : '';
    const removeBtnStyle = readOnly ? 'style="display: none;"' : '';
    
    row.innerHTML = `
      <input type="text" class="domains" placeholder="Domains (comma-separated)" value="${domains}" ${disabledAttr}>
      <input type="text" class="header-name" placeholder="Header Name" value="${name}" ${disabledAttr}>
      <input type="text" class="header-value" placeholder="Header Value" value="${value}" ${disabledAttr}>
      <button class="btn-remove" ${disabledAttr} ${removeBtnStyle}>X</button>
    `;
    
    if (!readOnly) {
      row.querySelector('.btn-remove').addEventListener('click', () => {
        row.remove();
      });
    }

    container.appendChild(row);
  }

  addBtn.addEventListener('click', () => {
    if (!isManaged) addRuleRow();
  });

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
    if (isManaged) return; // Prevent saving if managed state was somehow bypassed
    
    const rules = getRulesFromUI();
    chrome.storage.local.set({ LocalHeaders: rules }, () => {
      saveMessage.textContent = "Saved locally!";
      setTimeout(() => { saveMessage.textContent = ""; }, 2000);
    });
  });

  // Export to Policy JSON
  exportBtn.addEventListener('click', () => {
    const rules = getRulesFromUI();
    
    // Wrap the array in the precise structure needed for policy deployment
    const policyObject = {
      "ManagedHeaders": {
        "Value": rules
      }
    };

    const jsonString = JSON.stringify(policyObject, null, 2);
    
    // Create a downloadable Blob
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = "ForcedHeaders_Policy.json";
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
