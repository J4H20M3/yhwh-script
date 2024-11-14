#!/usr/bin/env node
import inquirer from 'inquirer';
import { chdir, cwd } from 'node:process';
import { join } from 'node:path';
import { existsSync, mkdirSync, opendir, cpSync } from 'node:fs';
import { execSync } from 'node:child_process';

const questions = [
    {
        type: 'input',
        name: 'directory',
        message: 'In which directory do you want your project?'
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
                    } else {
                        chdir(dir.path);
                        console.log("Initializing project...");
                        execSync('npm init -y');
                        execSync(`npm pkg delete scripts.test`);
                        execSync(`npm pkg set type=module`);

                        console.log("Copying files...");
                        const defaultPath = join(import.meta.dirname, '../files');
                        const targetPath = join(dir.path);
                        cpSync(defaultPath, targetPath, { recursive: true });

                        console.log("Installing Vite...");
                        execSync(`npm install vite @vitejs/plugin-basic-ssl --save`);
                        execSync(`npm pkg set scripts.gen="node gen.cjs" scripts.dev="npm run gen && vite" scripts.build="npm run gen && vite build" scripts.preview="npm run gen && vite preview"`);

                        console.log("Installing SQLite...");
                        execSync('npm install @sqlite.org/sqlite-wasm --save');

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

