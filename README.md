[![Build Status](https://travis-ci.org/jh3y/tyto.svg?branch=master)](https://travis-ci.org/jh3y/tyto)
tyto ![alt tag](https://raw.github.com/jh3y/tyto/master/src/images/tyto.png)
===
__tyto__ is an extensible and customizable management and organisation tool

just visit [jh3y.github.io/tyto](http://jh3y.github.io/tyto).

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/app_three_cols.png)

###Features
* minimal UI for managing and organising
* no accounts necessary
* easy to use
* easy to extend and develop
* localStorage persistence
* time tracking for items
* sortable columns and items
* etc.

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/add_task.gif)

###Why tyto? What's it for?
To be honest __tyto__ arose from my own and other members of my then team desiring something easy to organise and manage your own daily workflow. This could be something simple like the current development tasks on your plate or maybe the meetings you have scheduled in the current week coming. The ability to also share this is important.

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/edit_view.png)

It is true that most organisations have some form of tool for this exact problem but in my experience many employees don't actually like what they are using and you still see peoples whiteboards and walls etc. covered in sticky notes.

This is why __tyto__ came about. It's simple to use, no accounts needed, and the source code isn't too hard to grasp making it also easily extensible and customizable.

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/edit_task.gif)

###Who's it for?
Initially, __tyto__ was intended for developers and project managers as an easy way to share current tasks and project progression.

For example; a developer may have columns set up for 'to do', 'in progress', 'awaiting merge' and 'done'. They may also want to track time spent on different tasks and then email this to a project manager.

You could also have a boilerplate board set up created via exporting board data or share boards via the email function.

However, why have this restriction? It doesn't really make sense. As __tyto__ can be extended and customized however you see fit, it can be used for many different purposes.

Examples:
* the plan for the week ahead.
* ingredient lists.
* priority lists etc.
* managing your xmas shopping

To be honest, __tyto__ is still just a personal pet of mine and is shared to see if it can gather interest or help others. It is also assumed that while it is being shared new uses will be discovered and features will be proposed as with any piece of tech.

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/change_color.gif)


###Using tyto
The nice thing about __tyto__ is that you can use it however you want to and it's easy to do so. If you just want to simply use it and try it out for a bit then simply do that by visiting [jh3y.github.io/tyto](http://jh3y.github.io/tyto), the beauty of 'no accounts necessary'.

Your data will be persisted in the browser using localStorage so you can close the tab browser etc. and you won't lose anything.

If you want to move to a different browser or machine, simply use the __export__ action to export a json file which can be loaded in wherever you use __tyto__.

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/menu.png)

As for a nice persistent workflow across devices, I'm afraid I haven't actually implemented that and accounts is not something I am keen on implementing to be honest as I believe it takes away from my original purpose for __tyto__.

However, you can easily integrate with something like Google Drive or Dropbox using their respective desktop features to keep track of your tasks by exporting and loading your task file to a shared folder on your machine. This works for me going between machines.

You can also share board content using the email function. However, this is just a means to export the text content into an email and doesn't provide nice formatting. Just saves some of the heavy lifting of copy & pasting things.

####Using tyto in your own environment to develop against, extend, etc.
Alternatively, if you want to use __tyto__ in your own environment or want to start hacking away at it and extending, configuring it etc. it's very easy!

#####Prerequisites
If you're cloning the repo and setting up the codebase you are going to need __[node]()__, __[bower]()__ and  __[gulp]()__ installed.
#####Set up
1. Simply clone the repo.

        git clone https://github.com/jh3y/tyto.git

2. Navigate into the repo and install the dependencies.

        cd tyto
        npm install
        bower install

3. Simply run gulp to take care of preprocessing and running a webserver instance for you on port 1987(this can be configured and the project makes use of BrowserSync so heading to `localhost:3001` is also a good idea).

        gulp

####Hosting tyto
If you simply wish to host __tyto__ in your own environment you can do. I would suggest just taking a snapshot of the `gh-pages` branch and ftp'ing this onto your desired server or web space.

In most cases and ideally you will want to configure __tyto__ to your own needs and tweak it accordingly whether it be with styles and themes or you want to change the branding, html etc. To do this, the best way is to follow the instructions for developing against __tyto__ and then taking the output from this and pushing it to a desired environment or server.

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/speed_dial.gif)

###Configuration
Previous versions of __tyto__ offered a means of configuration for defining some board characteristics. However, with the new implementation introduced in version `2.0.0` and the inclusion of Backbone Marionette it didn't seem necessary to keep the configuration object as changes can be made to the `config` module within the app source.

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/time_track.gif)

###Development
The beauty of __tyto__ is how easy it is to change things and really customise and extend it to be exactly what you want.
####Under the hood
There are a range of technologies being used under the hood to achieve this.
* jQuery
* jQuery UI
* Material Design Lite
* Lodash
* Backbone
* Marionette
* Jade
* Stylus
* CoffeeScript
* Gulp

The use of Jade, Stylus and CoffeeScript or any of the technology being used is completely optional, but for me personally, development using these in combination with gulp makes development very speedy for myself.

The addition of watches with BrowserSyncs' live reload capability is a big plus too!
#####Why that tech?
__tyto__ has always been a project that I put together for myself to try out and learn new things whilst developing my own e-pinboard.

With the new version I've made some rather large changes with the things I've used. I've continued with Jade, CoffeeScript etc. but have introduced Lodash, Material Design, Stylus and Backbone.

Why? Simply because I wanted to try and use them together for this version :smile:

Moving to an MV* type framework/library was a no brainer as I wanted to introduce new features such as multiple boards etc. along with a single page app like experience. I believe Backbone & Marionette was a good choice for this version and fits well with __tyto__.

For this version I was looking to make the UI more minimal and clean. The release time of MDL and the Material Design spec was convenient I have to admit and I like the spec and look and feel it provides.

####Templating
Using jade and lodash has made it very easy to template views/markup for __tyto__. Making use of `gulp-template-store` means I can maintain an app wide template store for my application markup that is easily accessed by components of the app.

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/move_task.gif)

###Roadmap and known needs
* I always believe that my documentation could do with improvement and as such, I believe there are some things I could explain clearer.
* Better app wide source commentary.
* online persistence if there was d̨emand. this does however mean accounts which I'm not overly keen on implementing.


![alt tag](https://raw.github.com/jh3y/pics/master/tyto/open_menu.gif)

###Timeline
* __11/12/13__: Posted to HN, really great and very appreciated feedback from a large group of people.
* __14/02/14__: V1.1.0 released with plenty of new features that were raised in̨ the first showing.
* __16/02/14__: V1.2.0 new release with jQuery UI implementation for sorting columns and items.
* __23/05/14__: V1.4.0 major overhaul of code as it's been some time. Moving away from requireJS and introducing bower instead for piling sources together via grunt.̨
* __02/03/15__: It's now 2015. And the issues have gone untouched and I've started adding new ones! So it looks like it's going to be a good time soon to make some progress on them. Looking to add:
  * Ability to modify notes using custom markup
  * Multiple boards
  * Huge refactor to get rid of annoyances such as load time template loading.
  * Add tracking for both tasks and time!
* __01/08/15__: V2.0.0 is live! There are still features to be implemented but there has been a complete overhaul to an MV* architecture using Backbone Marionette. A more minimal design has also been implemented trying to follow the Material Design spec.

###Contributing
See [contributing](https://github.com/jh3y/tyto/blob/master/CONTRIBUTING.md).

![alt tag](https://raw.github.com/jh3y/pics/master/tyto/show_time.png)

###License

MIT

if you do wish to use __tyto__ please star the repo or fork it, it aids with project presence. Also if you have an interesting use or example usage please don't hesitate to share it and maybe we can add a featured examples section.


[@jh3y](https://github.com/jh3y) (c) 2015.
