#!/usr/bin/env node
import inquirer from 'inquirer';
import { chdir, cwd } from 'node:process';
import { join } from 'node:path';
import { existsSync, mkdirSync, opendir, copyFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const questions = [
    {
        type: 'input',
        name: 'directory',
        message: 'In which directory do you want your project?'
    },
    {
        type: 'input',
        name: 'webcomponents',
        message: 'In which subdirectory do you want your webcomponents?',
        default() {
            return 'webcomponents';
        },
    },
    {
        type: 'checkbox',
        name: 'plugins',
        message: 'Which plugins to install?',
        choices: ['vite', 'store', 'sqlite', 'examples']
    }
];

inquirer.prompt(questions)
    .then(answers => {
        const directory = join(cwd(), answers.directory);

        if (!existsSync(directory)) {
            console.log("Creating new project...");
            mkdirSync(directory);
            opendir(directory,
                (err, dir) => {
                    if (err) {
                        console.log("Error:", err);
                    }
                    else {
                        mkdirSync(join(dir.path, answers.webcomponents), { recursive: true });
                        chdir(dir.path);
                        console.log("Initializing project...");
                        execSync('npm init -y');
                        console.log("Copying files...");
                        const templatePath = join(import.meta.dirname, '../templates', 'index.html.template');
                        const targetPath = join(dir.path, 'index.html');
                        copyFileSync(templatePath, targetPath);
                        if (answers.plugins.includes('vite')) {
                            console.log("Installing Vite...");
                            execSync('npm install vite --save');
                        }
                        if (answers.plugins.includes('sqlite')) {
                            console.log("Installing SQLite...");
                            execSync('npm install sqlite --save');
                        }
                        if (answers.plugins.includes('examples')) {
                            console.log("Installing examples...");
                        }

                        console.log("Closing the directory");
                        dir.closeSync();
                    }
                }
            );
        } else {
            throw new Error("Foldername already exists.");
        }
    })
    .catch(error => {
        console.error(error);
    });

