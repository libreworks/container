import { typescript, javascript } from "projen";

const project = new typescript.TypeScriptProject({
  name: "container",
  description: "A simple dependency injection container and event publisher",
  packageName: "@libreworks/container",
  projenrcTs: true,

  authorName: "LibreWorks Contributors",
  authorUrl: "https://github.com/libreworks/shady-island/contributors",
  authorOrganization: true,

  repository: "https://github.com/libreworks/container.git",
  homepage: "https://libreworks.github.io/container/",
  bugsUrl: "https://github.com/libreworks/container/issues",

  tsconfig: {
    compilerOptions: { module: "node16", lib: ["ES2022"], target: "es2022" },
  },
  prettier: true,
  codeCov: true,
  docgen: true,

  majorVersion: 0,
  defaultReleaseBranch: "main",
  githubOptions: {
    pullRequestLintOptions: {
      semanticTitleOptions: {
        types: ["feat", "fix", "chore", "docs"],
      },
    },
  },
  projenTokenSecret: "PROJEN_GITHUB_TOKEN",
  autoApproveOptions: {
    // Anyone with write access to this repository can have auto-approval.
    allowedUsernames: [],
  },
  depsUpgradeOptions: {
    workflowOptions: {
      labels: ["auto-approve"],
      schedule: javascript.UpgradeDependenciesSchedule.WEEKLY,
    },
  },

  // deps: [],                /* Runtime dependencies of this module. */
  // devDeps: [],             /* Build dependencies for this module. */
});
project.synth();
