# Tips and tricks for being a Node.js developer in Windows

## Running scripts

* Use `cross-env` (https://github.com/kentcdodds/cross-env) to set environment variables in your NPM script instead of OS-specific command;
* Use CLI libs such as `del-cli` and `cpy-cli` instead of OS-specific commands in your NPM scripts;
* For more complex cases, consider using Bash analogues, e. g. "Windows Subsystem for Linux" (WSL), Git Bash provided with "Git for Windows" or CygWin;
* For testing CLI scripts use `cli-testlab`.

## Building native modules

* Whenever possible, use Node.js version 10.12.0 or newer to avoid the hassle of manually installing all the prerequisites for building native modules. Newer versions provide an option to install all necessary dependencies using Chocolatey for you during Node.js installation.

## Node version management

* Use nvm for Windows: https://github.com/coreybutler/nvm-windows

## Running Docker

* Make sure that you are running Windows 10 Enterprise, Pro, or Education;
* Enable hardware virtualization support in your BIOS or UEFI;
* Enable Hyper-V feature using Windows Settings or PowerShell;
* Install Docker Desktop.

## Git

* Use Git for Windows (https://git-scm.com/download/win). If you don't use WebStorm, you might consider using TortoiseGit for convenient GUI.
* To ensure that you commit correct end of line symbols:

  1) If you are using `prettier`, set `endOfLine` option to lf (this is a default value since v2.0.0);
  2) Configure a pre-commit hook that will run Prettier;
  3) Add `* text=auto eol=lf` to the repo's .gitattributes file. You may need to ask Windows users to re-clone your repo after this change to ensure git has not converted LF to CRLF on checkout.

