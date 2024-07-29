import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: true,
  rules: {
    'style/comma-dangle': ['error', 'never'],
    'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
    'no-console': 'off'
  },
  ignores: []
})
