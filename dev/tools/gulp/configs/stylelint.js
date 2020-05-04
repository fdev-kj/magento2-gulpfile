module.exports = {
    "extends": "stylelint-config-standard",
    "ignoreFiles": ["/**/_module.less", "/**/_widgets.less"],
    "rules": {
        "at-rule-empty-line-before": null,
        "no-descending-specificity": true,
        "indentation": 4,
        "selector-max-id": 0,
        "max-nesting-depth": 4,
        "number-leading-zero": "never",
        "max-empty-lines": 2,
        "font-family-no-missing-generic-family-keyword": null,
        "property-no-vendor-prefix": true,
        "color-no-invalid-hex": true,
        "property-no-unknown": true,
        "keyframe-declaration-no-important": true,
        "declaration-block-no-duplicate-properties": true,
        "block-no-empty": true,
        "selector-pseudo-class-no-unknown": true,
        "selector-pseudo-element-no-unknown": true,
        "selector-type-no-unknown": true,
        "comment-no-empty": true,
        "value-no-vendor-prefix": true,
        "declaration-no-important": true,
        "declaration-block-single-line-max-declarations": 1
    }
};
