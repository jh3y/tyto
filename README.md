tyto
==
__tyto__ is a completely configurable, extensible and customizable management and organisation tool (wow that's a mouthful!)
###demo
just visit [jh3y.github.io/tyto](http://jh3y.github.io/tyto).
###features
* nice simple user interface for managing and organising
* no accounts necessary
* easy to use
* easy to configure
* easy to extend and develop
* etc.

###why tyto? what's it for?
To be honest __tyto__ arose from my own and other members of my then team desiring something easy to organise and manage your own daily workflow. This could be something simple like the current development tasks on your plate or maybe the meetings you have scheduled in the current week coming. The ability to also share this is important.

It is true that most organisations have some form of tool for this exact problem but in my experience many employees don't actually like what they are using and you still see peoples whiteboards and walls etc. covered in sticky notes.

This is why __tyto__ came about. It's simple to use, no accounts needed, you can configure it how you want, theme it and the source code isn't hard to grasp as the tech under the bonnet makes it very easy to understand therefore making it also easily extensible and customizable.

###who 's it for?
Initially, __tyto__ was intended for developers and project managers as an easy way to share current tasks and project progression.

For example; a developer may have columns set up for 'to do', 'in progress', 'awaiting merge' and 'done'. Then this can easily be shared with the project manager by using the email function. Another perspective could be that the project manager will configure a default configuration of columns etc. and then share this with the developer to load and then email back or share when necessary.

However, why have this restriction? It doesn't really make sense. As __tyto__ can be extended, configured and customized however you see fit, it can be used for many different purposes.

Examples:
* the plan for the week ahead.
* ingredient lists.
* managing your xmas shopping

To be honest, __tyto__ is in its very infant stages and is being shared to see if it gathers enough interest. It is also assumed that while it is being shared new uses will be discovered and features will be proposed as with any piece of tech.
###using tyto
the nice thing about __tyto__ is that you can use it however you want to and it's easy to do so. If you just want to simply use it and try it out for a bit then simply do that by visiting [jh3y.github.io/tyto](http://jh3y.github.io/tyto), the beauty of 'no accounts necessary'.
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
