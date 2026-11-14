// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");


// ---- Architecture boundaries -------------------------------------------------------------
// shared  -> may not import core, layout or features
// core    -> may not import layout or features
// layout  -> may not import features
// feature -> may not import layout or another feature
const FEATURES = ["home", "not-found"];
const forbid = (files, groups, message) => ({
  files,
  rules: {
    "no-restricted-imports": ["error", { patterns: groups.map((group) => ({ group: [group, "!@angular/**"], message })) }],
  },
});

const boundaries = [
  forbid(["src/app/shared/**/*.ts"], ["**/core/**", "**/layout/**", "**/features/**"], "shared code must stay independent of core, layout and features."),
  forbid(["src/app/core/**/*.ts"], ["**/layout/**", "**/features/**"], "core must not depend on layout or features."),
  forbid(["src/app/layout/**/*.ts"], ["**/features/**"], "layout must not depend on features."),
  ...FEATURES.map((name) =>
    forbid(
      [`src/app/features/${name}/**/*.ts`],
      ["**/layout/**", ...FEATURES.filter((f) => f !== name).map((f) => `**/features/${f}/**`)],
      "a feature may only use core and shared; features must not import each other or layout.",
    ),
  ),
];

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  },
  ...boundaries,
);
