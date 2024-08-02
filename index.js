const core = require('@actions/core');
const exec = require('@actions/exec');
const io = require('@actions/io');
const fs = require('fs');
const codeArtifact = require('@aws-sdk/client-codeartifact');

async function run() {
  const region = core.getInput('region', { required: true });
  const domain = core.getInput('domain', { required: true });
  const owner = core.getInput('owner', { required: true });
  const type = core.getInput('type', { required: true });
  const repo = core.getInput('repo', { required: true });
  const duration = core.getInput('duration', { required: false });

  const client = new codeArtifact.CodeartifactClient({ region: region });
  const authCommand = new codeArtifact.GetAuthorizationTokenCommand({
    domain: domain,
    domainOwner: owner,
    durationSeconds: duration
  });

  core.debug(`AWS CodeArtifact Login(Auth) ${domain}-${owner}`);

  try {
    response = await client.send(authCommand)
  } catch (err) {
    core.setFailed(`AWS CodeArtifact Authentication Failed: ${err})`);
    return;
  }
  const authToken = response.authorizationToken;
  if (response.authorizationToken === undefined) {
    core.setFailed(`AWS CodeArtifact Authentication Failed: ${response.$metadata.httpStatusCode} (${response.$metadata.requestId})`);
    return;
  }

  switch(type) {
    case 'gradle':
      await gradle(domain, owner, region, repo, authToken);
      break;
    case 'npm':
      await npm(domain, owner, region, repo, authToken);
      break;
    case 'twine':
      await twine(domain, owner, region, repo, authToken);
      break;
    case 'pip':
      await pip(domain, owner, region, repo, authToken);
      break;
  }

  core.setOutput('registry', `https://${domain}-${owner}.d.codeartifact.${region}.amazonaws.com`);
  core.setOutput('auth_token', authToken);
  core.setSecret(authToken);
}

async function npm(domain, owner, region, repo, authToken) {
  const file = `
registry=https://${domain}-${owner}.d.codeartifact.${region}.amazonaws.com/npm/${repo}/
//${domain}-${owner}.d.codeartifact.${region}.amazonaws.com/npm/${repo}/:_authToken=${authToken}
//${domain}-${owner}.d.codeartifact.${region}.amazonaws.com/npm/${repo}/:always-auth=true
`;
  fs.writeFile(`.npmrc`, file, { flag: 'w' }, (callback) => {
    if (callback) core.setFailed(callback);
  });
}

async function gradle(domain, owner, region, repo, authToken) {
  const file = `
codeartifactToken=${authToken}
`
  fs.writeFile(`gradle.properties`, file, { flag: 'wx' }, (callback) => {
    if (callback) core.setFailed(callback);
  });
}

async function twine(domain, owner, region, repo, authToken) {
  const file = `
[distutils]
index-servers =
    codeartifact
[codeartifact]
repository = https://${domain}-${owner}.d.codeartifact.${region}.amazonaws.com/pypi/${repo}/
username = aws
password = ${authToken}
`;
  fs.writeFile(`.pypirc`, file, { flag: 'w' }, (callback) => {
    if (callback) core.setFailed(callback);
  });
}

async function pip(domain, owner, region, repo, authToken) {
  const file = `
[global]
extra-index-url = https://aws:${authToken}@${domain}-${owner}.d.codeartifact.${region}.amazonaws.com/pypi/${repo}/simple/
`;
  fs.writeFile(`.pip.conf`, file, { flag: 'w' }, (callback) => {
    if (callback) core.setFailed(callback);
  });
}

module.exports = run;

/* istanbul ignore next */
if (require.main === module) {
    run();
}
