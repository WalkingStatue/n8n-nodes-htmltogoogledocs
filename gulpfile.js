const path = require('path');
const { task, src, dest } = require('gulp');

task('build:icons', copyIcons);

function copyIcons() {
	const fs = require('fs');
	
	const nodeSource = path.resolve('nodes', '**', '*.{png,svg}');
	const nodeDestination = path.resolve('dist', 'nodes');

	src(nodeSource).pipe(dest(nodeDestination));

	// Check if credentials directory exists before trying to copy from it
	if (fs.existsSync('credentials')) {
		const credSource = path.resolve('credentials', '**', '*.{png,svg}');
		const credDestination = path.resolve('dist', 'credentials');
		return src(credSource).pipe(dest(credDestination));
	}
	
	// If credentials directory doesn't exist, return a resolved promise
	return Promise.resolve();
}
