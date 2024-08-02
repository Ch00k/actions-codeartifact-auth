# AWS CodeArtifact authentification action

Based on https://github.com/dshare-inc/actions-codeartifact-auth

Required: `aws-actions/configure-aws-credentials`

### `region`

AWS CodeArtifact Region

### `domain`

AWS Domain

### `owner`

Owner

### `type`

Repository type (npm or gradle)

### `repo`

Repository Name

## Example

```yml
Test:
  runs-on: ubuntu-latest
  steps:
    - name: Auth
      uses: Ch00k/actions-codeartifact-auth@2.0.0
      with:
        region: ${{ secrets.AWS_CODEARTIFACT_REGION }}
        domain: ${{ secrets.AWS_CODEARTIFACT_DOMAIN }}
        owner: ${{ secrets.AWS_CODEARTIFACT_OWNER }}
        type: "npm"
        repo: "npmjs"
```
