module.exports = {
  dependencyTypes: ["dev", "peer", "prod"],
  semverGroups: [{ range: "^" }],
  source: [
    "package.json",
    "apps/**/package.json",
    "packages/*/package.json",
    "libraries/*/package.json",
  ],
  versionGroups: [
    {
      label:
        "Use 'workspace:*' for locally developed packages (meaning any version is acceptable)",
      dependencies: ["$LOCAL"],
      dependencyTypes: ["dev", "prod"],
      pinVersion: "workspace:*",
    },
  ],
};
