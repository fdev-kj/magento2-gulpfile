# Magento 2 gulpfile 

Gulp tasks and configuration necessary to setup gulp-based front-end workflow for deploying and watching theme customizations.

Requirements
-----
- Node.js
- gulp-cli (intalled globally) - `npm install -g gulp-cli`
- Magento 2 project with LESS based theme 

> If you need SASS support I highly recommend the excellent [Frontools by Snowdog](https://github.com/SnowdogApps/magento2-frontools) 


Installation
----
1. Download gulpfile.js into the root folder of your project
2. Add the following dependancies to your local package.json file (into devDependancies):
		
		"browser-sync": "^2.26.7",
		"chalk": "^2.1.0",
		"fancy-log": "^1.3.3",
		"gulp": "^4.0.2",
		"gulp-autoprefixer": "^7.0.1",
		"gulp-clean": "^0.3.2",
		"gulp-eslint": "^5.0.0",
		"gulp-image": "^6.0.0",
		"gulp-image-resize": "^0.13.1",
		"gulp-less": "^4.0.1",
		"gulp-run": "^1.7.1",
		"gulp-sourcemaps": "^2.6.0",
		"gulp-stylelint": "^8.0.0",
		"minimist": "^1.2.5",
		"stylelint": "^9.10.0",
		"stylelint-config-standard": "^18.2.0"
3. Run 
	
		npm install
	or

		yarn install

Configuration
----
Copy **dev/tools/gulp/configs/** into your root directory and update configuration using the following templates:

**themes.js** 

		module.exports = {
			<"theme-alias">: {
				"locale": locale,
				"lang": "less",
				"area": "frontend",
				"vendor": <"Vendor">,
				"name": <"Theme-name">,
				"files": [
					"css/styles-m",
					"css/styles-l",
					"css/<custom-css>"
				]
			}
		};
  
- _locale_: local language,
- _lang_: css preprocessor (currently only less is supported)
- _area_: area, one of (frontend|adminhtml|base),
- _vendor_: developing company,
- _name_: theme name,
- _files_: Files to compile
        
**browser-sync.js**

        module.exports = {
          	proxy : "local.magento"
        }

_proxy_: Local address of your site

**stylelint.js**

    	module.exports = {
			"extends": "stylelint-config-standard",
			"ignoreFiles": ["/**/_module.less", "/**/_widgets.less"],
			"rules": {
				"at-rule-empty-line-before": null,
				"no-descending-specificity": true,
				"indentation": 4,
				"string-quotes": "single",
				"selector-max-id": 0,
				"max-nesting-depth": 4,
				"number-leading-zero": "never",
				"max-empty-lines": 2,
				"font-family-no-missing-generic-family-keyword": null
			}
		}

Update _rules_ with your custom ones adding to or overriding the existing [standard rules](https://github.com/stylelint/stylelint-config-standard/blob/master/index.js).

**eslint.js**

	module.exports = {
		"configFile": "./dev/tools/gulp/configs/.eslintrc"
	}

> Note: ESlint configuration is specified within .eslintrc file. Please change your eslint environments and rules there. 

Usage
--------
**Basic tasks**

Lint less files: 

	gulp less:lint [--theme-alias]

> Note: _module.less and _widget.less are excluded from linting 

Compile less to CSS:

> Note: before less:compile use gulp source to deploy source-theme

	gulp less:compile [--theme-alias]

Alias for less:lint and less:compile sequence:

	gulp less [--theme-alias]

Lint js files: 

	gulp js:lint [--theme-alias]

Alias for js:lint:

	gulp js [--theme-alias]

Optimize images in the {theme}/web/images folder

	gulp image:theme:optimize [--theme-alias]

> Note: this task overwrites existing image files. If you want to keep the original files specify optimized images destination folder in gulp.dest pipe

Optimize specific images in the pub/media folder

	gulp image:media:optimize [--theme-alias --input --output]

Resize specific images

	gulp image:resize [--theme-alias --input --output --width --height --crop --upscale --gravity --format --quality --background --percentage --cover]

Clean local cache in var/page_cache/ var/cache/ /var/di/ /var/generation/: 
        
	gulp clean:cache [--theme-alias]

Clean static assets in pub/static and var/view_preprocessed folders:
        
	gulp clean:static [--theme-alias]
        
Create aliases in pub/static folder:
        
	gulp source [--theme-alias]

Manually trigger static asset deployment for frontend:
        
	gulp deploy:static [--theme-alias]

Manually trigger static asset deployment for admin:
        
	gulp deploy:admin [--theme-alias]

Serves static assets and watches for less file changes in vendor modules/themes:
        
	gulp serve [--theme-alias]

---
**Task sequences**
Lint and compile less:
	
	gulp less [--theme-alias]

JS processing:

	gulp js [--theme-alias]

Rebuild aliases and compile less (eg. when adding new less files):

	gulp refresh [--theme-alias]

Refresh static assets, lint, compile and watch less files for changes (run `gulp --tasks` for more details):

	gulp theme [--theme-alias]

> Note: [--theme-alias] is optional, the first available theme in themes.js is used by default

License
-----
This project is licensed under **GNU General Public License v3.0**