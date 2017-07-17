[![Build Status](https://travis-ci.org/jh3y/tyto.svg?branch=master)](https://travis-ci.org/jh3y/tyto)
tyto ![alt tag](https://raw.github.com/jh3y/tyto/master/src/img/tyto.png)
===
__tyto__ is an extensible and customizable management and organisation tool

just visit [jh3y.github.io/tyto](http://jh3y.github.io/tyto)!

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/app_three_cols.png)

### Features
* minimal UI
* no accounts necessary
* intuitive
* extensible
* localStorage persistence
* time tracking
* sortable UI
* task linking
* Markdown support
* etc.

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/add_task.gif)

### Why tyto? What's it for?

Tyto arose from the want for an electronic post-it board without the need for accounts. Something simple and intuitive that could be easily shared.

It's also the product of my own curiosity being used as an opportunity to pick up new tech stacks. It started as a vanilla JS app utilising one file and experimenting with HTML5 drag and drop. It then grew a little more, and a little more after that. Now it uses Backbone w/ Marionette. The next step? Most likely Angular 2.0 or React.

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/edit_view.png)

In truth, most organisations have some form of tool for what Tyto is doing. In my experience though, they can be cumbersome, clunky and just a bit noisy. Some employees tend to dislike internal tools. You still see whiteboards and walls plastered in sticky notes.

This is where Tyto came from, It's my personal intuitive and minimal TodoMVC. No accounts necessary and the source isn't too hard to grasp making it rather easy to extend and customise.

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/edit_task.gif)

### Who's it for?
Developer and project managers were the original target audience. A means to share project progression on a more _personal_ level. As opposed to publicly through an internal system. Almost like a complimentary attachment to an email.

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/change_color.gif)

There are no restrictions though, it's open source. Not quite right out of the box? Change it :smile:

Extensibility provides a means to create a bespoke version based on theme or functionality.

Tyto is a personal pet of mine and if it can help others, that's great!



###Using tyto
Just want to use it? Do that by visiting [jh3y.github.io/tyto](http://jh3y.github.io/tyto).

GitHub flavored markdown is supported thanks to `marked`.

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/markdown.gif)

This also enables you to link to boards, columns and other tasks by using the `#` character

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/linking.gif)

Changes are persistent thanks to `localStorage`.

Want to move to a different browser or machine though? Use the export utility to export a json file. Load this using the import utility.

A persistent workflow across devices? I'm afraid I haven't implemented that. Accounts is _not_ something I am keen on implementing/hosting right now. I think it diverts from my original intention with Tyto.

#### Your own environment
##### Prerequisites
If you're cloning the repo and setting up the codebase you are going to need __node__(_preferably __yarn___) and  __gulp__ installed.

##### Set up
1. Clone the repo.

        git clone https://github.com/jh3y/tyto.git

2. Navigate into the repo and install the dependencies.

        cd tyto
        yarn (alternatively, npm install)

3. Run gulp to take care of preprocessing and running a local static server instance(project utilises BrowserSync).

        gulp

#### Hosting
I would suggest just taking a snapshot of the `gh-pages` branch and ftp'ing this onto your desired server or web space. Alternatively, follow the set up procedure and FTP the contents of the `public` directory.

If you wish to host on Github. Follow the set up procedure first(ideally, with a fork). When happy with your version, use the `deploy` task. This will require familiarity with `gulp-gh-pages` in order to publish to the correct location if other than `gh-pages`.

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/speed_dial.gif)

### Development
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
* Babel
* Gulp

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/move_task.gif)

### License

MIT

---------------------------

Made with :sparkles: [@jh3y](https://twitter.com/@_jh3y) 2017
