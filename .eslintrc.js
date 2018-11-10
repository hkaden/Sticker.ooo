module.exports = {
   	"plugins": [
	  "security"
	],
	"extends": [
		"airbnb",
	  "plugin:security/recommended"
	],
	"parser": "babel-eslint",
	"rules": {
		"no-unused-vars": 0,
		"react/react-in-jsx-scope": "off",
		"no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
    "max-len": [1, 120, 2, {ignoreComments: true}],
    "prop-types": [2]
  }
};