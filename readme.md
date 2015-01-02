# [Angular Form Library](https://github.com/uglow/angular-form-lib)
[![Build Status](http://img.shields.io/travis/uglow/angular-form-lib/master.svg?style=flat)](http://travis-ci.org/uglow/angular-form-lib)
[![Code Climate](https://codeclimate.com/github/uglow/angular-form-lib/badges/gpa.svg)](https://codeclimate.com/github/uglow/angular-form-lib)
[![Test Coverage](https://codeclimate.com/github/uglow/angular-form-lib/badges/coverage.svg)](https://codeclimate.com/github/uglow/angular-form-lib)

## <a name="download"></a> Download
```
bower install angular-form-lib --save
```

## <a name="dependencies"></a> Dependencies
- Git
- [Node](http://nodejs.org)
- Grunt: `npm install -g grunt-cli`
- Bower (for when you need to updated dependencies): `npm install -g bower`

## <a name="install"></a> Installation
```
git clone url-to-repo.git
npm install
bower install
grunt install
```

## <a name="dev"></a> Development Tasks

From the command line, you can run the following commands:

- `grunt dev`: Continuous development (builds debuggable version into /dev folder, starts server, watches files for changes and reloads)
- `grunt build`: Builds the site into /dist, ready for distribution
- `grunt build:serve`: Builds the site into /dist, and then serves it up
- `grunt test`: Runs unit tests in PhantomJS
- `grunt test:browser`: Runs unit tests in Chrome (useful for debugging)

# Notes
- If Grunt throws errors for missing dependencies try installing them manually through npm install *filename*
- If node has permission errors ensure that it has ownership of the global directory.


## Git Commit Guidelines

These rules are adopted from [the AngularJS commit conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/).

### Commit Message Format

Each commit message starts with a **type**, a **scope**, and a **subject**.

Below that, the commit message has a **body**.

- **type**: what type of change this commit contains.
- **scope**: what item of code this commit is changing.
- **subject**: a short description of the changes.
- **body** (optional): a more in-depth description of the changes

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
```

Examples:

```
feat(ruler): add inches as well as centimeters
```

```
fix(protractor): fix 90 degrees counting as 91 degrees
```

```
refactor(pencil): use graphite instead of lead

Closes #640.

Graphite is a much more available resource than lead, so we use it to lower the price.
```

```
fix(pen): use blue ink instead of red ink

BREAKING CHANGE: Pen now uses blue ink instead of red.

To migrate, change your code from the following:

`pen.draw('blue')`

To:

`pen.draw('red')`
```

Any line of the commit message should not be longer 100 characters. This allows the message to be easier
to read on github as well as in various git tools.

### Type
Is recommended to be one of the below items. Only **feat** and **fix** show up in the changelog, in addition to breaking changes (see breaking changes section at bottom).

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
* **refactor**: A code change that neither fixes a bug or adds a feature
* **test**: Adding missing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
  generation

### Scope
The scope could be anything specifying place of the commit change. For example `$location`,
`$browser`, `$compile`, `$rootScope`, `ngHref`, `ngClick`, `ngView`, etc...

### Subject
The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

### Breaking Changes
Put any breaking changes with migration instructions in the commit body.

If there is a breaking change, put **BREAKING CHANGE:** in your commit body, and it will show up in the changelog.
