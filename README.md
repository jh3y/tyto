[![Build Status](https://travis-ci.org/jh3y/tyto.svg?branch=master)](https://travis-ci.org/jh3y/tyto)
tyto ![alt tag](https://raw.github.com/jh3y/tyto/master/src/img/tyto.png)
===
__tyto__ is an extensible and customizable management and organisation tool

just visit [jh3y.github.io/tyto](http://jh3y.github.io/tyto)!

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/app_three_cols.png)

###Features
* minimal UI
* no accounts necessary
* intuitive
* extensible
* localStorage persistence
* time tracking
* sortable UI
* Markdown support
* etc.

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/add_task.gif)

###Why tyto? What's it for?
Tyto arose from a desire of my own and members of my then team. The desire for an intuitive and simple tool for easy workflow/task management. Whether it be managing tasks in the current sprint or your weekly schedule. An ability to share was also vital.

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/edit_view.png)

In truth, most organisations have some form of tool for this. In my experience though, most are cumbersome and clunky. Employees tend to dislike internal tools. Whiteboards and walls etc. are still covered in sticky notes.

This is why tyto came about. It's intuitive and minimal. No accounts are necessary. On top of that, the source isn't too hard to grasp making it rather easy to extend and customise.

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/edit_task.gif)

###Who's it for?
Developer and project managers were the original target audience. A means to share project progression on a more personal level. As opposed to an automated message from an internal system.

For example; a developer may track the different stages of a task. They may also want to track time spent on different tasks and then email this to a project manager.
Tyto isn't restricting. It has use in a multitude of scenarios. Not quite right out of the box? Extensibility provides a means to create a bespoke version based on theme or functionality.

Examples:
* the plan for the week ahead.
* ingredient lists.
* priority lists etc.
* managing your xmas shopping

Tyto is a personal pet of mine and if it can help others, that's great!

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/change_color.gif)


###Using tyto
Just want to use it? Do that by visiting [jh3y.github.io/tyto](http://jh3y.github.io/tyto).

GitHub flavored markdown is supported thanks to `marked`.

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/markdown.gif)

Changes are persistent thanks to `localStorage`.

Want to move to a different browser or machine though? Use the export utility to export a json file. Load this using the import utility.

A persistent workflow across devices? I'm afraid I haven't implemented that. Accounts is not something I am keen on implementing. I think it diverts from my original intention with tyto.



####Your own environment
#####Prerequisites
If you're cloning the repo and setting up the codebase you are going to need __[node]__, __[bower]__ and  __[gulp]__ installed.
#####Set up
1. Clone the repo.

        git clone https://github.com/jh3y/tyto.git

2. Navigate into the repo and install the dependencies.

        cd tyto
        npm install
        bower install

3. Run gulp to take care of preprocessing and running a local static server instance(project utilises BrowserSync).

        gulp

####Hosting
I would suggest just taking a snapshot of the `gh-pages` branch and ftp'ing this onto your desired server or web space. Alternatively, follow the set up procedure and FTP the contents of the `public` directory.

If you wish to host on Github. Follow the set up procedure first(ideally, with a fork). When happy with your version, use the `deploy` task. This will require familiarity with `gulp-gh-pages` in order to publish to the correct location if other than `gh-pages`.

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/speed_dial.gif)

###Development
A strength of tyto is extensibility. Making changes whether it be functional or aesthetic is straightforward once familiar with the codebase.

Any queries as to how things work in the codebase? Feel free to raise an issue with a question!

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/time_track.gif)

####Under the hood
There are a range of technologies being used under the hood.
* jQuery
* jQuery UI
* Material Design Lite
* Lodash
* Backbone
* Marionette
* Marked
* Jade
* Stylus
* CoffeeScript
* Gulp

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/move_task.gif)

###License

MIT

If you wish to use __tyto__ please star, fork or share the repo! It aids with project presence.

[@jh3y](https://github.com/jh3y) (c) 2015.
