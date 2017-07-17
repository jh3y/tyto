Contributing to tyto ![alt tag](https://raw.github.com/jh3y/tyto/master/src/img/tyto.png)
===
Open source is a great thing and I really appreciate that you may be interested in contributing to `tyto`!

##Issues
Feel free to submit an issue. However. Be sure to make your contribution clear.

###Found a bug?
Be clear about what the issue is that you've found and PLEASE provide clear steps to reproduce it :simple_smile:

###Want a new feature?
If you would like to see a new feature in `tyto`, raise an issue for it. Give it an appropriate label and then clearly set out what you'd like to see. If you can, also provide a possible solution for this feature to help get the ball rolling.

##Making contributions
For me personally. I prefer to work on forked instances of a repo to ensure I'm not stepping on anyones toes.

For minor fixes and issues. Develop against develop and submit pull requests to be merged into `develop`.

For new features and large scale changes, please create a new branch on the repo and work against this. Ensure the branch name is labelled appropriately with the correct issue number.

The most important thing to me is that people aren't afraid of contributing. If you have any problems or get stuck, feel free to get in touch!

###Set up
1. Fork the repo and clone it.

        git clone https://github.com/<USERNAME>/tyto.git

2. Navigate into the repo and install the dependencies.

        cd tyto
        yarn/npm install

3. Run gulp to take care of preprocessing and running a local static webserver instance(the project uses BrowserSync).

        gulp

4. Develop!
