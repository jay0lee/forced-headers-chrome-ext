# Forced Headers Chrome Extension

A Chrome extension that dynamically injects custom HTTP headers into specific web requests. This is designed for enterprise administrators who need to enforce Network Access Controls or Tenant Restrictions (e.g., Microsoft Entra ID, Google Workspace, Slack) on managed browsers.

## How to Configure and Deploy

### 1. Force-Install the Extension via Custom URL
First, add the self-hosted extension to your managed environment:
1. Open the [Google Admin Console](https://admin.google.com) and navigate to **Devices > Chrome > Apps & extensions > Users & browsers**.
2. Click the yellow **+** button in the bottom right and select **Add Chrome app or extension by ID**.
3. In the dropdown, select **From a custom URL**.
4. Enter the Extension ID: `fpfdoojindonejppjnehipdpehinpinh`
5. Enter the Update URL: `https://jay0lee.github.io/forced-headers-chrome-ext/hosted/update.xml`
6. Click **Save**.
7. In the app list, click the drop-down menu under "Installation policy" for the newly added extension and set it to **Force install** (you may want to do this in a test Organizational Unit first).

### 2. Generate Your Policy File
Now that the extension is deployed to your browser, use its built-in tool to generate your configuration file:
1. Open Chrome and ensure the extension is installed locally.
2. Right-click the **Forced Headers** extension icon in your browser toolbar and select **Options**.
3. Add your target domains (comma-separated), header name, and header value.
4. Click **Export to Policy JSON**. This will download a correctly formatted file (e.g., `ForcedHeaders_Policy.json`).

### 3. Apply the Policy
Upload your configuration so it pushes out to your users along with the extension:
1. Back in the Google Admin Console, select the Forced Headers extension to open its settings panel on the right.
2. Under **Policy for extensions**, paste the contents of your downloaded `ForcedHeaders_Policy.json` file.
3. Click **Save**.

🔗 **Google Documentation:** [Configure policies for Chrome extensions](https://support.google.com/chrome/a/answer/10649896)

### 4. Restrict Permissions (Security Best Practice)
To dynamically inject headers across various admin-defined domains, this extension requests the powerful `<all_urls>` host permission. **It is highly recommended** to use Chrome's native controls to restrict the extension's access to only your target authentication domains.

You can configure this directly in the extension's settings panel in the Google Admin Console:
1. Select the extension to open its settings panel.
2. Scroll down to **Enterprise extensions settings**.
3. Under **Hosts where the extension is blocked**, enter: `*://*/` (This blocks the extension from running everywhere by default).
4. Under **Hosts where the extension is allowed to run**, enter your target domains separated by commas. For example: `*://login.microsoftonline.com/, *://login.microsoft.com/, *://login.live.com/`
5. Click **Save**.

🔗 **Google Documentation:** [Allow or block extensions on specific websites](https://support.google.com/chrome/a/answer/7532015)

---

## Supported Services & Common Headers

Below is a reference list of major SaaS and Cloud platforms that support network control via HTTP header injection, along with example values.

| Service | HTTP Header(s) | Example Value | Documentation |
| :--- | :--- | :--- | :--- |
| **Microsoft Entra ID** | `sec-Restrict-Tenant-Access-Policy`<br> | `restrict-msa;mytenant.onmicrosoft.com`<br>`contoso.com, fabrikam.com` | [Docs](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/tenant-restrictions-v2) |
| **Google Workspace** | `X-GoogApps-Allowed-Domains` | `mycompany.com, subsidiary.com` | [Docs](https://support.google.com/a/answer/1668854) |
| **Google Cloud (GCP)** | `X-Goog-Allowed-Resources` | `organizations/123456789` | [Docs](https://cloud.google.com/resource-manager/docs/organization-policy/restricting-domains) |
| **Slack** | `X-Slack-Allowed-Workspaces`<br>`X-Slack-Allowed-Workspaces-Requester` | `T1234567, T8901234`<br>`T1234567` | [Docs](https://slack.com/help/articles/360024821873-Approve-Slack-workspaces-for-your-network) |
| **Dropbox** | `X-Dropbox-Allowed-Team-Ids` | `12345678` | [Docs](https://help.dropbox.com/security/network-control) |
| **Cisco Webex** | `CiscoSpark-Allowed-Domains` | `mycompany.com` | [Docs](https://help.webex.com/en-us/article/m0jby2/Configure-a-list-of-allowed-domains-to-access-Webex-while-on-your-corporatenetwork) |
| **Asana** | `Asana-Allowed-Domain-Ids`<br>`Asana-Allowed-Domains-Requester-Id` | `11111111111, 22222222222`<br>`11111111111` | [Docs](https://help.asana.com/hc/en-us/articles/14234033602459-Network-restrictions) |
| **YouTube** | `YouTube-Restrict` | `Strict` (or `Moderate`) | [Docs](https://support.google.com/a/answer/6214622) |
| **Anthropic Claude** | `anthropic-allowed-org-ids` | `123e4567-e89b-12d3-a456-426614174000` | [Docs](https://support.claude.com/en/articles/13198485-enforce-network-level-access-control-with-tenant-restrictions) |

*Note: Services that require paired headers (like Slack and Asana) typically use a "Requester ID" header alongside the allowed list to identify the primary tenant managing the restriction policy.*
