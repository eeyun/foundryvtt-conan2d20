# How to contribute

Thank you very much for having a look at the project best practices, if you have any question, please don't hesitate to contact us on Discord @ KayhosRaven#1642 / eeyun
#0890 or at our GitLab support email incoming+kayhos-foundryvtt-conan2d20-19641366-issue-@incoming.gitlab.com.

## Data Model

https://app.lucidchart.com/documents/view/4f319568-5171-67b3-97da-61fb0a0041d5

## Tools In use

1. **SCSS** to manage CSS & **Gulp** to compile it.
2. **esLint** to validate code.
3. **Typescript** is being implemented

## Testing

Please run your code changes in a Conan 2D20 World before commiting to GitHub.

Before major code commits, ensure all standard entities remain functional: 

1. Create, Read, Update & Delete Characters and Foes.
2. Create, Read, Update & Delete Items.

## Submitting changes

Please send a [GitLab Merge Request to foundryvtt-conan2d20](https://gitlab.com/kayhos/foundryvtt-conan2d20/-/merge_requests) with a clear list of what you've done (read more about [pull requests](http://help.github.com/pull-requests/)). Please follow our coding conventions (below) and make sure all of your __commits are atomic__ (one feature per commit). A merge request can contain multiple commits each covering different features.

Always write a clear log message for your commits. One-line messages are fine for small changes, but bigger changes should look like this:

    $ git commit -m "A brief summary of the commit
    > 
    > A paragraph describing what changed and its impact."

## Coding conventions

Start reading our code and you'll get the hang of it. We optimize for readability:

  * We indent using two spaces (soft tabs)
  * We avoid logic in views, putting HTML generators into helpers
  * We ALWAYS put spaces after list items and method parameters (`[1, 2, 3]`, not `[1,2,3]`), around operators (`x += 1`, not `x+=1`), and around hash arrows.
  * This is open source software. Consider the people who will read your code, and make it look nice for them. It's sort of like driving a car: Perhaps you love doing donuts when you're alone, but with passengers the goal is to make the ride as smooth as possible.
  
_Shamelessly extracted from the OpenGovernement CONTRIBUTING.md file @ https://github.com/opengovernment/opengovernment/blob/master/CONTRIBUTING.md_
