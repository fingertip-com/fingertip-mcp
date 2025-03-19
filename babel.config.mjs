export default {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '14',
        },
        modules: false,
      },
    ],
  ],
  plugins: ['@babel/plugin-transform-optional-chaining'],
  ignore: [
    // You can exclude certain packages that don't need transformation
    /node_modules\/(?!(@modelcontextprotocol|zod-to-json-schema))/,
  ],
}
