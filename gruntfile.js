module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		connect: {
			options: {
				port: 1987,
				livereload: 35729,
				// Change this to '0.0.0.0' to access the server from outside
				hostname: 'localhost'
			},
			livereload: {
				options: {
					open: true
				}
			}
		},
		coffee: {
			compile: {
				options: {
					bare: true
				},
				files: [
					{
						expand: true,
						flatten: true,
						cwd:'coffeescript',
						src: ["*.coffee"],
						ext: ".js",
						dest: "js"
					}
				]
			}
		},
		jade: {
			compile: {
				files: [
					{
						"index.html": "templates/index.jade"
					},
					{
						"cookies.html": "templates/cookies.jade"
					},
					{
						expand: true,
						src: ["templates/page/*.jade"],
						ext: ".html"
					},
					{
						expand: true,
						src: ["templates/tyto/*.jade"],
						ext: ".html"
					}
				]
			}
		},
		less: {
			development: {
				files: {
					"css/style.css": "less/style.less"
				}
			}
		},
		watch: {
			scripts: {
				files: [
						"templates/**/*.jade",
						"less/**/*.less",
						"coffeescript/**/*.coffee",
				],
				tasks: ['jade', 'less', 'coffee']
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.registerTask('default', ['connect', 'watch']);

};