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
  devDeps: ["@jest/globals"],

  minNodeVersion: "18.0.0",
  workflowNodeVersion: "18.18.2",
  tsconfig: {
    compilerOptions: {
      moduleResolution: javascript.TypeScriptModuleResolution.NODE16,
      module: "node16",
      lib: ["DOM", "ES2022"],
      target: "es2022",
      removeComments: true,
    },
  },

  prettier: true,
  codeCov: true,
  docgen: true,

  jestOptions: {
    jestConfig: {
      extensionsToTreatAsEsm: [".ts"],
      moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
      },
      transform: {
        "^.+\\.ts$": [
          "ts-jest",
          { useESM: true, tsconfig: "tsconfig.dev.json" },
        ],
      },
    },
  },

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
  npmAccess: javascript.NpmAccess.PUBLIC,
  npmignore: ["docs"],
});

project.package.file.addOverride("type", "module");
project.package.file.addOverride("private", false);
project.testTask.env("NODE_OPTIONS", "--experimental-vm-modules");

project.synth();
