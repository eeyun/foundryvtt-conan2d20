const gulp = require('gulp');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const archiver = require('archiver');
const stringify = require('json-stringify-pretty-compact');
const typescript = require('typescript');
const FormData = require('form-data');
const ky = require('ky-universal');

const ts = require('gulp-typescript');
const sass = require('gulp-sass');
const git = require('gulp-git');
const babel = require('gulp-babel');

const { argv } = require('yargs');

sass.compiler = require('sass');

function getConfig() {
  const configPath = path.resolve(process.cwd(), 'foundryconfig.json');
  let config;

  if (fs.existsSync(configPath)) {
    config = fs.readJSONSync(configPath);
    return config;
  }
}

function getManifest() {
  const json = {};

  json.root = '';
  const modulePath = path.join(json.root, 'module.json');
  const systemPath = path.join(json.root, 'system.json');

  if (fs.existsSync(modulePath)) {
    json.file = fs.readJSONSync(modulePath);
    json.name = 'module.json';
  } else if (fs.existsSync(systemPath)) {
    json.file = fs.readJSONSync(systemPath);
    json.name = 'system.json';
  } else {
    return;
  }

  return json;
}

/**
 * TypeScript transformers
 * @returns {typescript.TransformerFactory<typescript.SourceFile>}
 */
function createTransformer() {
  /**
   * @param {typescript.Node} node
   */
  function shouldMutateModuleSpecifier(node) {
    if (!typescript.isImportDeclaration(node) && !typescript.isExportDeclaration(node)) return false;
    if (node.moduleSpecifier === undefined) return false;
    if (!typescript.isStringLiteral(node.moduleSpecifier)) return false;
    if (!node.moduleSpecifier.text.startsWith('./') && !node.moduleSpecifier.text.startsWith('../')) return false;
    if (path.extname(node.moduleSpecifier.text) !== '') return false;
    return true;
  }

  /**
   * Transforms import/export declarations to append `.js` extension
   * @param {typescript.TransformationContext} context
   */
  function importTransformer(context) {
    return (node) => {
      /**
       * @param {typescript.Node} node
       */
      function visitor(node) {
        if (shouldMutateModuleSpecifier(node)) {
          if (typescript.isImportDeclaration(node)) {
            const newModuleSpecifier = typescript.createLiteral(`${node.moduleSpecifier.text}.js`);
            return typescript.updateImportDeclaration(node, node.decorators, node.modifiers, node.importClause, newModuleSpecifier);
          } if (typescript.isExportDeclaration(node)) {
            const newModuleSpecifier = typescript.createLiteral(`${node.moduleSpecifier.text}.js`);
            return typescript.updateExportDeclaration(node, node.decorators, node.modifiers, node.exportClause, newModuleSpecifier);
          }
        }
        return typescript.visitEachChild(node, visitor, context);
      }

      return typescript.visitNode(node, visitor);
    };
  }

  return importTransformer;
}

const tsConfig = ts.createProject('tsconfig.json', {
  getCustomTransformers: (prgram) => ({
    after: [
      createTransformer(),
    ],
  }),
});

/** ***************** */
/*		BUILD		*/
/** ***************** */

/**
 * Build TypeScript
 */
function buildTS() {
  return gulp.src('src/**/*.ts')
    .pipe(tsConfig())
    .pipe(gulp.dest('dist'));
}

function buildJS() {
  return gulp.src('src/**/*.js')
    .pipe(babel({
      'plugins': ["@babel/plugin-proposal-optional-chaining"]
    }))
    .pipe(gulp.dest('dist'));
}

/**
   * Build SASS
   */
function buildSASS() {
  return gulp.src('src/**/*.scss', { sourcemaps: true })
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dist', { sourcemaps: true }));
}

/**
   * Copy static files
   */
async function copyFiles(cb) {
  const statics = [
    'lang',
    'fonts',
    'packs',
    'templates',
    'module.json',
    'system.json',
    'template.json',
  ];
  try {
    for (const file of statics) {
      if (fs.existsSync(path.join('static', file))) {
        await fs.copy(path.join('static', file), path.join('dist', file));
      }
    }
    return cb();
  } catch (err) {
    cb(err);
  }
}

/**
 * Watch for changes for each build step
 */
function buildWatch() {
  gulp.watch('src/**/*.ts', { ignoreInitial: false }, buildTS);
  gulp.watch('src/**/*.scss', { ignoreInitial: false }, buildSASS);
  gulp.watch(['static/fonts', 'static/templates', 'static/*.json', 'static/lang/*.json', 'static/system.json'], { ignoreInitial: false }, copyFiles);
  gulp.watch('dist/**/*', copyToUserData);
}

/** ***************** */
/*		CLEAN		*/
/** ***************** */

/**
 * Remove built files from `dist` folder
 * while ignoring source files
 */
async function clean(cb) {
  const config = fs.readJSONSync('foundryconfig.json');
  const name = config.systemName;
  const files = [];

  files.push(
    'lang',
    'static/templates',
    'assets',
    'src/module',
    `${name}.js`,
    'static/system.json',
    'static/template.json',
    'src/scripts',
    'README.md',
    'LICENSE'
  );
  files.push('system.json');

  // If the project uses Less or SASS
  if (
    fs.existsSync(path.join('src', `${name}.less`))
      || fs.existsSync(path.join('src', `${name}.scss`))
  ) {
    files.push(
      'fonts',
      `${name}.css`,
    );
  }

  console.log(' ', chalk.yellow('Files to clean:'));
  console.log('   ', chalk.blueBright(files.join('\n    ')));

  // Attempt to remove the files
  try {
    for (const filePath of files) {
      await fs.remove(path.join('dist', filePath));
    }
    return cb();
  } catch (err) {
    cb(err);
  }
}

/** ***************** */
/*		COPY		*/
/** ***************** */

/**
 * Copy build to User Data folder
 */
async function copyToUserData(cb) {
    const config = fs.readJSONSync('foundryconfig.json');
    const name = config.systemName;

    let destDir;
    let linkDir;
    if (config.dataPath) {
        if (!fs.existsSync(path.join(config.dataPath, 'Data'))) throw Error('User Data path invalid, no Data directory found');
        linkDir = path.join(config.dataPath, 'Data', 'systems', name);
    } else {
      throw Error('No User Data path defined in foundryconfig.json');
    }

    console.log(chalk.yellow(`Removing build in ${chalk.blueBright(linkDir)}`));

    await fs.remove(linkDir);
    console.log(chalk.green(`Linking build to ${chalk.blueBright(linkDir)}`));

    await fs.emptyDir(linkDir);
    await fs.copy('dist', linkDir);
}

const execBuild = gulp.parallel(buildTS, buildJS, buildSASS);

const execCopy = gulp.parallel(copyFiles);

exports.build = gulp.series(clean, execBuild, execCopy);
exports.watch = buildWatch;
exports.clean = clean;
exports.copy = copyToUserData;

