module.exports = function (options, webpack) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...options,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    resolve: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ...options.resolve,
      extensionAlias: {
        '.js': ['.ts', '.js'],
        '.mjs': ['.mts', '.mjs'],
      },
    },
  };
};
