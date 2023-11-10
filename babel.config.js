module.exports = {
  presets: [
    ["@babel/preset-env", { modules: "cjs" }],
    ["@babel/preset-react", { runtime: "automatic" }],
    '@babel/preset-typescript',
  ],
};
