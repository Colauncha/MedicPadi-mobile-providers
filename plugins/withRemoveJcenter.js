const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withRemoveJcenter(config) {
  return withProjectBuildGradle(config, (config) => {
    // Strips out references to jcenter from all evaluated project paths
    if (config.modResults.contents.includes('jcenter()')) {
      config.modResults.contents = config.modResults.contents.replace(
        /jcenter\(\)/g,
        ''
      );
    }
    return config;
  });
};
