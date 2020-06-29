# Robert E. Howard's Conan (2D20) ~ Work In Progress

Robert E. Howard's Conan is based on the 2D20 cinematic system developped by Modiphius Entertainment (https://www.modiphius.net/) through their kickstarter (https://www.kickstarter.com/projects/modiphius/robert-e-howards-conan-roleplaying-game).

Community contributed (WIP) system for the Foundry VTT (https://foundryvtt.com/). MOST of this project has been very heavily influenced by [Foundry VTT Pathfinder 2E](https://gitlab.com/hooking/foundry-vtt---pathfinder-2e) from actual blobs of code to the repository layout and project organization. All credit to their previous work and generosity. 

## Installation Instructions

Conan 2D20 is under active development, with rapid and dramatic changes. It currently depends on unmerged changes to Nick East's [Foundry Project Creator Types](https://gitlab.com/foundry-projects/foundry-pc/foundry-pc-typesTo) so we're consuming a fork (We're on the bleeding edge here apparently!). The project should not yet be considered playable.. yet. 

To install the Conan 2D20 system for development on Foundry Virtual Tabletop:

1. Clone the repository `git clone git@gitlab.com:kayhos/foundryvtt-conan2d20`
1. Enter the project directory `cd foundryvtt-conan2d20`
1. Install node modules `npm install`
1. Copy foundryconfig.example.json to foundryconfig.json and update the data-path to root of your foundry server install
1. Run a gulp build or watch `npm run build:dev` 


You can find out where the `foundrydata` folder is located in the Configuration and Setup page under the Configuration tab (next to the Update Software tab).

## Support & Bug Reports

Please send an email to incoming+kayhos-foundryvtt-conan2d20-19641366-issue-@incoming.gitlab.com with the below content

Following things are greatly appreciated and speed up the resolution time:
1. Screenshot of the issue.
2. Description of the issue.
3. What were you doing.
4. How to replicate the issue.
5. Version of the following
  1. FoundryVTT.
  2. Conan 2D20 System.
  3. Browser and its version.

## Community Contribution

Code and content contributions are welcome. Please feel free to submit issues to the issue tracker or submit merge requests for code changes. 

Review the [Contributing Guilelines](https://gitlab.com/kayhos/foundryvtt-conan2d20/-/blob/master/CONTRIBUTING.md) to know how we would prefer receiving your help.

## Code contributions

@Hooking was generous enough to let us reuse the item selector from his game system [Foundry VTT Pathfinder 2e (PF2e)](https://gitlab.com/hooking/foundry-vtt---pathfinder-2e). That piece of code was contributed by `unknown as of now` on the PF2e game system.

## Legal

© 2017 Conan Properties International LLC (“CPI”). Conan, Conan The Barbarian, Hyboria and related logos, characters, names, and distinctive likenesses thereof are trademarks or registered trademarks of CPI. All rights reserved.

Robert E. Howard and related logos, characters, names, and distinctive likenesses thereof are trademarks or registered trademarks of Robert E. Howard Properties Inc. All rights reserved.

The 2d20 system and Modiphius Logos are copyright Modiphius Entertainment Ltd. 2015–2017. 

All 2d20 system text is copyright Modiphius Entertainment Ltd.
