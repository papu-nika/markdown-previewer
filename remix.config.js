/** @type {import('@remix-run/dev').AppConfig} */

const { getDependenciesToBundle } = require("@remix-run/dev");
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "cjs",
  // serverDependenciesToBundle: [
  serverDependenciesToBundle: [/.*/],

  //   ...getDependenciesToBundle(
  //     "react-markdown",
  //     "devlop",
  //   ),
  //   /^micromark.*/,
  //   /^rehype.*/,
  //   /^remark.*/,
  //   /^unified.*/,
  //   /^unist.*/,
  //   /^hast.*/,
  //   /^bail.*/,
  //   /^trough.*/,
  //   /^mdast.*/,
  //   /^micromark.*/,
  //   /^decode.*/,
  //   /^character.*/,
  //   /^property.*/,
  //   /^space.*/,
  //   /^comma.*/,
  //   /^react-markdown$/,
  //   /^vfile.*/,
  //   /^ccount*/,
  //   /^markdown-table*/,
  //   /^micromark-util-sanitize-uri*/,
  //   /^hast-util-to-jsx-runtime*/
  // ]
};
