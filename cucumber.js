const BASE_URL = process.env.BASE_URL || 'http://localhost:8000';

module.exports = {
  default: {
    require: ['tests/support/**/*.js', 'tests/step-definitions/**/*.js'],
    format: ['progress-bar'],
    worldParameters: { baseUrl: BASE_URL },
  },
};
