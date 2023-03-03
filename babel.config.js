module.exports = (api) => {
  api.cache.using(() => process.env.NODE_ENV);
  return {
    presets: [
      ['@babel/env', { targets: { browsers: ['last 2 versions'] } }],
      '@babel/preset-react',
      '@babel/typescript',
    ],
    plugins: [
      '@babel/proposal-object-rest-spread',
      '@babel/proposal-class-properties',
      '@babel/proposal-optional-chaining',
      '@babel/syntax-dynamic-import',
      '@loadable/babel-plugin',
      [
        'babel-plugin-styled-components',
        {
          ssr: true,
          displayName: true,
          preprocess: false,
        },
      ],
    ].filter(Boolean),
  };
};
