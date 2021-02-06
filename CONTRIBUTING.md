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
1. Create atomic commits to your branch. (one feature per commit)
1. Once your proposal is complete, Flag your Merge Request as Ready to merge.

Read more about [merge requests](https://docs.gitlab.com/ee/user/project/merge_requests/).

Always write a clear log message for your commits. One-line messages are fine for small changes, but bigger changes should look like this:
$ git commit -m "A brief summary of the commit > > A paragraph describing what changed and its impact."

## Coding conventions

Start reading our code and you'll get the hang of it. We optimize for readability:

- We indent using two spaces.
- We avoid logic in views, putting HTML generators into _static/templates/_. These templates should not contain any logic beyond Getters and Setters. We are aware that some logic can be necessary in specific situations.
- We ALWAYS put spaces after list items and method parameters (`[1, 2, 3]`, not `[1,2,3]`), around operators (`x += 1`, not `x+=1`), and around hash arrows.
- Commits cannot be submited directly, use a Merge Request
- To help us when reviewing your Merge Request, try to attach it to an issue number by mentioning, for example:

> Closes #4, #6 and #12

- This is open source software. Consider the people who will read your code, and make it look nice for them. It's sort of like driving a car: Perhaps you love doing donuts when you're alone, but with passengers the goal is to make the ride as smooth as possible.
