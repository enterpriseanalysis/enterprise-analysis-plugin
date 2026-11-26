# Public directory submission

The source package retains local stdio support. `scripts/package-submission.py` creates a separate ZIP with one remote HTTPS MCP connection and the packaged selection skill.

## Build the upload

```sh
python3 scripts/package-submission.py https://enterpriseanalysis.ai/mcp
```

The output is `dist/enterprise-analysis-submission.zip`. It excludes local source, dependencies, environment files and repository metadata. Confirm the endpoint is live before uploading.

## Deployment

The remote endpoint is planned on the existing Enterprise Analysis backend at `https://enterpriseanalysis.ai/mcp`. It must be deployed and verified through the existing EA application release pipeline before submission. No separate hosting project is required.

The local Node implementation remains available for development. The public service implementation is prepared on backend branch `codex/ea-mcp`. It has not been deployed.

## Portal steps

Open the [OpenAI plugin dashboard](https://platform.openai.com/plugins), sign in to the publishing account and select the intended organization and project. Complete publisher verification if requested. Upload the ZIP, connect and scan its MCP server, then resolve the portal findings.

When the portal generates the domain challenge, serve its exact content at `/.well-known/openai-apps-challenge` on the existing EA host. Run Verify Domain in the portal. Do not invent the token or publish account credentials.

The package includes review prompts and expected behavior. A demo recording, publication countries, policy attestations and any additional reviewer fields must be completed in the portal. No public-directory approval or enhanced distribution is implied by deployment.
