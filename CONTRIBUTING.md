# How to contribute

Thank you very much for having a look at the project best practices, if you have any question, please don't hesitate to contact us (KayhosRaven#1642 and eeyun#0890) on the [CONAN 2D20 Discord](https://discord.gg/hhbpSrtAu9) or on the GitLab repo support email [incoming+kayhos-foundryvtt-conan2d20-19641366-issue-@incoming.gitlab.com](mailto:incoming+kayhos-foundryvtt-conan2d20-19641366-issue-@incoming.gitlab.com).

## Installing the repo

Conan 2D20 is under active development, with rapid and dramatic changes. It currently depends on unmerged changes to Nick East's [Foundry Project Creator Types](https://gitlab.com/foundry-projects/foundry-pc/foundry-pc-typesTo) so we're consuming a fork (We're on the bleeding edge here apparently!).

To install the Conan 2D20 system for development on Foundry Virtual Tabletop:

1. Clone the repository `git clone git@gitlab.com:kayhos/foundryvtt-conan2d20`
1. Enter the project directory `cd foundryvtt-conan2d20`
1. Install node modules `npm -c install`
1. Copy foundryconfig.example.json to foundryconfig.json and update the data-path to root of your foundry server's Data directory.

```json
{
  "dataPath": "/example/path/to/FoundryVTT/Data",
  "systemName": "conan2d20"
}
```

You should see the directories `systems`, `modules` and `worlds` in the _dataPath_.

1. Run a webpack build or watch `npm run build:dev`

You can find out where the `foundrydata` folder is located in the Configuration and Setup page under the Configuration tab (next to the Update Software tab).

## Tools In use

1. **Typescript**
1. **SCSS** to manage CSS & **Webpack** to compile it.
1. **esLint** to validate code.
1. **Prettier** to enforce code conventions.
1. Versioning uses [SemVer](https://semver.org/)

## Testing

[![pipeline status](https://gitlab.com/kayhos/foundryvtt-conan2d20/badges/master/pipeline.svg)](https://gitlab.com/kayhos/foundryvtt-conan2d20/-/commits/master)

Please run your code changes in a Conan 2D20 World before commiting to GitHub.

Before major code commits, ensure all standard entities remain functional:

1. Create, Read, Update & Delete Characters and NPCs.
1. Create, Read, Update & Delete Items.

## Submitting changes

1. Open an [Issue](https://gitlab.com/kayhos/foundryvtt-conan2d20/-/issues/new) to document the fix or the feature proposed if no other exists.
1. **Create merge request and branch** from your [Issue](https://gitlab.com/kayhos/foundryvtt-conan2d20/-/issues/).
1. **We require a [DCO](https://developercertificate.org/) on each commit**. We cannot accept any merge requests that are not submitted with a DCO.
1. Larger PRs should be broken into logical commits. Smaller PRs should be submitted as a single commit.
1. Run the bundled [Pre-commit Checks] before opening a Merge Request.
1. Once your proposal is complete, Flag your Merge Request as Ready to merge.

Read more about [merge requests](https://docs.gitlab.com/ee/user/project/merge_requests/).

Always write a clear log message for your commits. One-line messages are fine for small changes, but bigger changes should look like this:
$ git commit -m "A brief summary of the commit > > A paragraph describing what changed and its impact."

## DCO (Signing Your Commits)

This project utilizes a Developer Certificate of Origin (DCO) to ensure that each commit was written by the author or that the author has the appropriate rights necessary to contribute the change. The project utilizes [Developer Certificate of Origin, Version 1.1](https://developercertificate.org/)

Each commit must include a DCO signature which looks like this:

`Signed-off-by: Joe Smith <joe.smith@email.com>`

The project requires that the name used is your real name. Neither anonymous contributors nor those utilizing pseudonyms will be accepted.

Git makes it easy to add this line to your commit messages. Make sure the `user.name` and `user.email` are set in your git configs. Use `-s` or `--signoff` to add the Signed-off-by line to the end of the commit message. Note that this **does not require GPG**. The singatures applied to these commits are your aggreed upon signature of the DCO.

## Coding conventions

Start reading our code and you'll get the hang of it. We optimize for readability:

- We indent using two spaces.
- We avoid logic in views, putting HTML generators into _static/templates/_. These templates should not contain any logic beyond Getters and Setters. We are aware that some logic can be necessary in specific situations.
- We ALWAYS put spaces after list items and method parameters (`[1, 2, 3]`, not `[1,2,3]`), around operators (`x += 1`, not `x+=1`), and around hash arrows.
- Commits cannot be submited directly, use a Merge Request
- To help us when reviewing your Merge Request, try to attach it to an issue number by mentioning, for example:

> Closes #4, #6 and #12

- This is open source software. Consider the people who will read your code, and make it look nice for them. It's sort of like driving a car: Perhaps you love doing donuts when you're alone, but with passengers the goal is to make the ride as smooth as possible.

## Pre-commit Checks

In order to ensure some standards of quality we use [pre-commit](https://pre-commit.com/) to execute a series of lints and checks on the code. Be sure to [install the pre-commit CLI](https://pre-commit.com/#installation). **There is no obligation to install pre-commit into your local repo (`$ pre-commit install`) and doing so will trigger pre-commit checks to run every time you run `git commit`.**

What _is_ required is to validate your branch locally before you commit your code. Just run `pre-commit run --all-files`. Often, these will fail on the first run for formatting. `Pre-commit` will try to fix any simple formatting/style issues and leave them un-staged on the branch. So your next step is to run `git add -A` (assuming you don't have any files you don't want to commit) and then `pre-commit run --all-files` once more to verify everything comes through fine.

### Eslint Checks

We do some linting with `eslint` as part of our pre-commit checks. For now, **you can ignore warnings**. What needs to be corrected are **errors**. In some cases you may need to add a lint suppression but please check with the maintainers before doing so. These situations should be fairly uncommon.

### Webpack

Our CI will run a webpack build of your branch after it completes the linting. Be sure to check that your branch can build before opening a PR. We are planning some major overhaul to the codebase which will alter a lot of our typing. Right now this is kind of a mess.
