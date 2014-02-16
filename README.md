tyto ![alt tag](https://raw.github.com/jh3y/tyto/master/images/tyto.png)
==
__tyto__ is a completely configurable, extensible and customizable management and organisation tool (wow that's a mouthful!)
###demo/site
just visit [jh3y.github.io/tyto](http://jh3y.github.io/tyto).

![alt tag](https://raw.github.com/jh3y/tyto/master/screenshots/tyto1.png)

###features
* nice simple user interface for managing and organising
* no accounts necessary
* easy to use
* easy to configure
* easy to extend and develop
* __NEW!__ localStorage persistence
* __NEW!__ undo action
* __NEW!__ UI overhaul
* __NEW!__ Sortable columns and items
*__NEW!__ Collapsible items
* etc.

![alt tag](https://raw.github.com/jh3y/tyto/master/screenshots/tyto6.gif)

###tyto has had a big overhaul
after the great feedback it received previously on HN. New features have been added that people requested.

###what's been happening.
* __11/12/13__: Posted to HN, really great and very appreciated feedback from a large group of people.
* __11-22/12/13__: Been really busy and ill but been able to reply here and there to issues when I can.
* __22/12/13__: After a congested couple of weeks, finally have sat down and taken notes from the HN discussion in order to compile a nice little issues list of what needs doing. The summary can be seen [here](https://github.com/jh3y/tyto/blob/master/docs/HNnotes.md)
* __12/02/14__: Wahey! Happy NY and finally after some time working on other little things I'm getting under way picking up issues again.
* __14/02/14__: V1.1.0 released with plenty of new features that were raised in the first showing.
* __16/02/14__: V1.2.0 new release with jQuery UI implementation for sorting columns and items.


![alt tag](https://raw.github.com/jh3y/tyto/master/screenshots/tyto8.gif)

###why tyto? what's it for?
To be honest __tyto__ arose from my own and other members of my then team desiring something easy to organise and manage your own daily workflow. This could be something simple like the current development tasks on your plate or maybe the meetings you have scheduled in the current week coming. The ability to also share this is important.

It is true that most organisations have some form of tool for this exact problem but in my experience many employees don't actually like what they are using and you still see peoples whiteboards and walls etc. covered in sticky notes.

This is why __tyto__ came about. It's simple to use, no accounts needed, you can configure it how you want, theme it and the source code isn't hard to grasp as the tech under the bonnet makes it very easy to understand therefore making it also easily extensible and customizable.

![alt tag](https://raw.github.com/jh3y/tyto/master/screenshots/tyto2.png)

###who 's it for?
Initially, __tyto__ was intended for developers and project managers as an easy way to share current tasks and project progression.

For example; a developer may have columns set up for 'to do', 'in progress', 'awaiting merge' and 'done'. Then this can easily be shared with the project manager by using the email function. Another perspective could be that the project manager will configure a default configuration of columns etc. and then share this with the developer to load and then email back or share when necessary.

However, why have this restriction? It doesn't really make sense. As __tyto__ can be extended, configured and customized however you see fit, it can be used for many different purposes.

Examples:
* the plan for the week ahead.
* ingredient lists.
* priority lists etc.
* managing your xmas shopping

To be honest, __tyto__ is in its very infant stages and is being shared to see if it gathers enough interest. It is also assumed that while it is being shared new uses will be discovered and features will be proposed as with any piece of tech.
###using tyto
the nice thing about __tyto__ is that you can use it however you want to and it's easy to do so. If you just want to simply use it and try it out for a bit then simply do that by visiting [jh3y.github.io/tyto](http://jh3y.github.io/tyto), the beauty of 'no accounts necessary'.

Your data will be persisted in the browser using localStorage so you can close the tab browser etc. and you won't lose anything. 

If you want to move to a different browser or machine, simply use the __export__ action to export a json file which can be loaded in wherever you use __tyto__. 

![alt tag](https://raw.github.com/jh3y/tyto/master/screenshots/tyto7.gif)

####using tyto in your own environment to develop against, extend, etc.
alternatively, if you want to use __tyto__ in your own environment or want to start hacking away at it and extending, configuring it etc. it's very easy!
#####prerequisites
if you're cloning the repo and setting up the codebase you are going to need __[node]()__ installed and also the __[grunt-cli]()__.
#####set up
1. simply clone the repo.

        git clone https://github.com/jh3y/tyto.git
    
2. navigate into the repo and install the dependencies.

        cd tyto
        npm install
    
3. simply run grunt to take care of preprocessing and running a webserver instance for you on port 1987(which can be configured).

        grunt

####hosting tyto
if you simply wish to host __tyto__ in your own environment you can do. I would suggest just taking a snapshot of the `gh-pages` branch and ftp'ing this onto your desired server or web space.

in most cases and ideally you will want to configure __tyto__ to your own needs and tweak it accordingly whether it be with styles and themes or you want to change the branding, html etc. To do this, the best way is to follow the instructions for developing against __tyto__ and then taking the output from this and pushing it to a desired environment or server.

![alt tag](https://raw.github.com/jh3y/tyto/master/screenshots/tyto3.png)

####configuration
a nice feature of __tyto__ is how easily configurable it is. It handles this by having a config file that is shimmed for use with requireJS. This file is a javascript file that simply defines a block of json which is the configuration or options.
#####autoSave
sets whether __tyto__ should auto save actions
#####showIntroModalOnLoad: bool
sets whether to show the intro modal on page load.
#####introModalId: string
provides the string of the intro modal id for jQuery to use.
#####helpModalId: string
provides the string of the help modal id for jQuery to use.
#####infoModalId: string
provides the string of the info modal id for jQuery to use.
#####DOMId: string
provides the DOM id for the board component for use with jQuery.
#####DOMElementSelector: string
provides the CSS selector for the DOM element being used for the board.
#####emailSubject: string
defines a default subject of email generated by tyto.
#####emailRecipient: string
defines a default recipient of email generated by tyto.
#####exportFilename: string
defines the default filename for the json file when a board is exported.
#####maxColumns: number
defines the maximum amount of columns that can be created on a board.
#####columns: object array
this defines the default columns to be displayed on a board and the default tasks within those columns.

For example;
        
        [
            {
                title: 'A column',
                    items: [
                        {
                            collapsed: false,
                            title: 'An item',
                            content: 'im your first item.'
                        },
                        {
                            collapsed: true,
                            title: 'A collapsed item',
                            content: ' im another item.'
                        }
                    ]
            },
            {
                title: 'Another column',
                items: []
            }
        ]

###development
the beauty of __tyto__ is how easy it is to change things and really customise and extend it to be exactly what you want.
####under the hood
there are a range of technologies being used under the hood to achieve this.
* jQuery
* jQuery UI
* requireJS
* bootstrap
* Font Awesome
* Handlebars.js
* CSS3
* jade
* less
* coffeescript
* grunt
* modernizr

of course, the use of jade, less and coffeescript or any of the technology being used is completely optional but for me personally developing using jade, less and coffeescript in combination with grunt makes development very speedy as the project uses grunt-contrib-connect and grunt-contrib-watch also.
####templating
using jade and handlebars has made it very easy to template html for __tyto__. this makes it also easy to extend or customize in a desirable way.

using the text plugin for requireJS, __tyto__ pulls in templates and then using handlebars generates items, columns, and email drafts so changing entities is as easy as changing the template.
###roadmap and known needs
* the documentation isn't great and in some ways not clear. this does mean that there are probably ways the implementation could be made simpler.
* mobile support for touch events such as drag and swipe possibly using hammer.js
* __tyto__ is being shared in a very early age stage to get feedback primarily on how bad or maybe good it is or how it could be improved or approached differently. this is afterall my own little personal project.
* online persistence if there was demand. this does however mean accounts which isn't cool but maybe the notion of guest accounts and persistent accounts whereby multiple boards could be saved.
* better responsive design for various devices in general (consider moving over to using bootstrap for a lot of the responsive lifting).


![alt tag](https://raw.github.com/jh3y/tyto/master/screenshots/tyto5.png)


###discuss
i have yet to work my way through the feedback and insight left on Hacker News to create an issue list etc. so feel free to join the discussion [here](https://news.ycombinator.com/item?id=6886834).

Alternatively, email me or leave a comment on my site.

It would be really appreciated!  :)
###contributing
if you feel __tyto__ would be something you'd like to contribute ideas to or enhancements please don't hesitate to get in touch or fork the repo and submit a pull request. i know __tyto__ has many flaws so I welcome the criticism to be honest as any publicity is good publicity.
###license

MIT

if you do wish to use __tyto__ please star the repo or fork it, it helps it get spread. Also if you have an interesting use or example usage please don't hesitate to share it and it can be put up as an example.


tyto - http://jh3y.github.io/tyto
Licensed under the MIT license

[Jhey Tompkins](https://github.com/jh3y) (c) 2014.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


@jh3y
