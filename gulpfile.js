/**
 * Copyright © 2019 Rocket Web
 * See LICENSE.MD for license details.
 */

/* Modules */
const gulp = require('gulp'),
  less = require('gulp-less'),
  log = require('fancy-log'),
  chalk = require('chalk'),
  clean = require('gulp-clean'),
  run = require('gulp-run'),
  browserSync = require('browser-sync').create(),
  sourcemaps = require('gulp-sourcemaps'),
  stylelint = require('gulp-stylelint'),
  eslint = require('gulp-eslint'),
  image = require('gulp-image'),
  imageResize = require('gulp-image-resize'),
  parseArgs = require('minimist'),
  autoprefixer = require('gulp-autoprefixer');

/* Configs */
const themesConfig = require('./dev/tools/gulp/configs/themes'),
  browserConfig = require('./dev/tools/gulp/configs/browser-sync'),
  stylelintConfig = require('./dev/tools/gulp/configs/stylelint'),
  eslintConfig = require('./dev/tools/gulp/configs/eslint');

/* Theme options and paths */
const args = parseArgs(process.argv.slice(2));
const themeName = args.theme ? args.theme : Object.keys(themesConfig)[0];
const theme = themesConfig[themeName];
const staticFolder = `pub/static/${theme.area}/${theme.vendor}/${theme.name}/${theme.locale}`;
const folderToClean = ['./' + staticFolder + '/*', './var/view_preprocessed/*'];

/**
 * Lint less files (excludes _module.less - see config/stylelint.js)
 */
gulp.task('less:lint', function lintCssTask() {
  const filesToLint = `app/design/frontend/${theme.vendor}/${theme.name}/**/*.${theme.lang}`;

  return gulp
    .src(filesToLint)
    .pipe(
      stylelint({
        config: stylelintConfig,
        reporters: [{ formatter: 'string', console: true }],
      })
    )
    .on('end', () => {
      log(chalk.green('Less files checked'));
    })
});

/**
 * Compile less
 */

gulp.task('less:compile', () => {
  const filesToCompile = theme.files.map((file) => {
    return (
      `${staticFolder}/${file}.${theme.lang}`
    );
  });

  return gulp
    .src(filesToCompile)
    .pipe(sourcemaps.init())
    .pipe(
      less().on('error', (error) => {
        log(chalk.red(`Error compiling ${theme.vendor}/${theme.name}: ${error.message}`));
      })
    )
    .pipe(autoprefixer('last 4 versions'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(staticFolder + '/css'))
    .pipe(browserSync.stream())
    .on('end', () => {
      log(chalk.green(`Successfully compiled ${theme.vendor}/${theme.name}`));
    })
});

/**
 * Lint all JS files in theme folder
 */
gulp.task('js:lint', () => {
  const filesToLint = [
    `app/design/frontend/${theme.vendor}/${theme.name}/**/*.js`,
    '!**/*.min.js',
    '!/**/requirejs-config.js',
  ];

  return gulp
    .src(filesToLint)
    .pipe(eslint(eslintConfig))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .on('end', () => {
      log(chalk.green('JS files checked'));
    })
});

/**
 * Optimize images in theme folder
 */
gulp.task('image:theme:optimize', function (done) {
  const themeFolder = `app/design/frontend/${theme.vendor}/${theme.name}`,
    fileTypes = ['png', 'jpg', 'svg'],
    filePaths = fileTypes.map((file) => {
      return themeFolder + '/**/*.' + file;
    });

  return gulp
    .src(filePaths)
    .pipe(image())
    .pipe(gulp.dest(themeFolder))
    .on('end', () => {
      log(chalk.green(`Images in ${themeFolder} were optimized`));
    })

  done();
});

/**
 * Optimize specific images in pub/media folder
 * @input {string} - specify input file folder, fallbacks to pub/media
 * @output {string} - specify output file folder, fallbacks to --input (file overrides)
 */
gulp.task('image:media:optimize', function (done) {
  const mediaFolder = 'pub/media';
  const inputFolder = args.input
    ? `${mediaFolder}/${args.input}/**/*`
    : '/**/*';
  const outputFolder = args.output
    ? `${mediaFolder}/${args.output}`
    : `${mediaFolder}/${args.input}`;

  if (!args.input) {
    log(chalk.red('Please specify input folder'));
    done();

    return;
  }

  return gulp
    .src(inputFolder)
    .pipe(image())
    .pipe(gulp.dest(outputFolder))
    .on('end', () => {
      log(chalk.green(`Images in ${inputFolder} were optimized and saved in ${outputFolder}`))
    })

  done();
});

/**
 * Resize specific images
 * @input {string} - specify input blob
 * @output {string} - specify output folder, defaults to pub/media/resized
 * @width {number} - image width in px or percentage
 * @height {number} - image height in px or percentage
 * @crop {bool} - whether image should be cropped, default false
 * @upscale {bool} - whether image can be upscaled, default false
 * @gravity {string: NorthWest|North|NorthEast|West|Center|East|SouthWest|South|SouthEast} - set image gravity when cropping images
 * @format {string: gif|png|jpeg } - override output format of the input file(s)
 * @quality {number} - output quality of the resized image, default 1
 * @background {string} - image bg color if applicable, 'none' to keep transparency
 * @percentage {number} - percentage value of the image size
 * @cover {bool} - maintain aspect ratio by overflowing dimensions when necessary, default false
*/
gulp.task('image:resize', function (done) {
  const options = {
    input: args.input,
    output: args.output || 'pub/media/resized/',
    width: args.width,
    height: args.height,
    crop: args.crop || false,
    upscale: args.upscale || false,
    gravity: args.gravity,
    format: args.format,
    quality: args.quality || 1,
    background: args.background,
    percentage: args.percentage,
    cover: args.cover,
  };

  if (!options.input) {
    log(chalk.red('Please specify input argument'));
    done();

    return;
  }

  if (!options.width) {
    if (!options.height) {
      log(chalk.red('Please specify new image dimensions'));
      done();

      return;
    }
  }

  return gulp
    .src(options.input)
    .pipe(imageResize(options))
    .pipe(gulp.dest(options.output))
    .on('end', () => {
      log(chalk.green(`Images in ${options.input} have been resized and saved in ${options.output}`));
    });

  done();
});


/**
 * Cache clean
 */
gulp.task('clean:cache', function () {
  const cacheFoldersToClean = [
    './var/page_cache/*',
    './var/cache/*',
    './var/di/*',
    './var/generation/*',
  ];

  return gulp
    .src(cacheFoldersToClean, { read: false })
    .pipe(clean())
    .on('end', () => {
      log(chalk.green('Cache cleaned: var/page_cache/ var/cache/ /var/di/ /var/generation/'))
    })
});

/**
 * Clean static files
 */
gulp.task('clean:static', () => {
  return gulp
    .src(folderToClean, { read: false })
    .pipe(clean())
    .on('end', () => {
      log(chalk.green(`Static folder ${staticFolder} have been cleaned`))
    })
});

/**
 * Create aliases in pub/static folder
 */
gulp.task('source', () => {
  const createAlias =
    'php bin/magento dev:source-theme:deploy --theme ' +
    theme.vendor +
    '/' +
    theme.name +
    ' --locale ' +
    theme.locale +
    ' ' +
    theme.files.join(' ');

  return gulp
    .src(staticFolder)
    .on('end', () => {
      log(chalk.blue('Source theme deploy started...'));
    })
    .pipe(run(createAlias))
    .on('end', () => {
      log(chalk.green('Aliases created'));
    })
});

/**
 * Deploy static assets
 */
gulp.task('deploy:static', () => {
  const staticDeploy =
    'php bin/magento setup:static-content:deploy --theme ' +
    theme.vendor +
    '/' +
    theme.name +
    ' -v -f';

  return gulp
    .src(staticFolder)
    .on('end', () => {
      log(chalk.blue('Asset static deployment is starting. Wait...'));
    })
    .pipe(
      run(staticDeploy).on('error', (error) => {
        log(chalk.red('Error: ' + error.message));
      })
    )
    .on('end', () => {
      log(chalk.green('Static deployment finished. Run `gulp watch --[your theme name]`'));
    })
});

/**
 * Deploy admin assets
 */
gulp.task('deploy:admin', () => {
  const adminDeploy = 'php bin/magento setup:static-content:deploy --theme Magento/backend -v -f';

  return gulp
    .src(staticFolder)
    .on('end', () => {
      log(chalk.blue('Asset static deployment of admin is starting. Wait...'));
    })
    .pipe(
      run(adminDeploy).on('error', (error) => {
        log(chalk.red('Error: ' + error.message));
      })
    )
    .on('end', () => {
      log(chalk.green('Admin deployment finished'));
    })
});

/**
 * Watch for changes
 */
gulp.task('watch', () => {
  gulp.watch(
      [`pub/static/frontend/${theme.vendor}/${theme.name}/**/*.${theme.lang}`],
      gulp.series('less')
  );
});

/**
 * Task sequences
 */
gulp.task('less', gulp.series('less:lint', 'less:compile'));
gulp.task('js', gulp.series('js:lint'));
gulp.task('refresh', gulp.series('clean:static', 'source', 'less'));
gulp.task('theme', gulp.series('clean:cache', 'clean:static', 'source', 'less', 'watch'));
