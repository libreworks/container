import { typescript, javascript } from "projen";

const project = new typescript.TypeScriptProject({
  name: "container",
  description: "A simple dependency injection container and event target",
  keywords: [
    "dependency injection",
    "di",
    "ioc",
    "inversion-of-control",
    "service locator",
    "EventTarget",
  ],

  authorName: "LibreWorks Contributors",
  authorUrl: "https://github.com/libreworks/container/contributors",
  authorOrganization: true,
  license: "MIT",

  repository: "https://github.com/libreworks/container.git",
  homepage: "https://libreworks.github.io/container/",
  bugsUrl: "https://github.com/libreworks/container/issues",

  deps: ["ts-log"],

  minNodeVersion: "18.0.0",
  workflowNodeVersion: "18.x",
  tsconfig: {
    compilerOptions: {
      module: "node16",
      lib: ["DOM", "ES2022"],
      target: "es2022",
    },
  },

  projenrcTs: true,
  prettier: true,
  codeCov: true,
  docgen: true,

  majorVersion: 0,
  defaultReleaseBranch: "main",
  githubOptions: {
    pullRequestLintOptions: {
      semanticTitleOptions: { types: ["feat", "fix", "chore", "docs"] },
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

  releaseToNpm: true,
  packageName: "@libreworks/container",
});

project.package.file.addOverride("private", false);

project.synth();
