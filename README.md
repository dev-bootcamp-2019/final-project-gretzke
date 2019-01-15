# Online Marketplace Example

This is the final project of the
[Consensys Acadamy Bootcamp](https://consensys.net/academy/bootcamp/) for the Consensys
certification.

## Abstract

Goal of this project was to build a decentralized Marketplace prototype where store owners, who are
managed by admins, can create stores and sell items. On a technical level it focused upon a safe and
efficient storage design and integrating [IPFS](https://ipfs.io/) as a storage for images and
webhosting solution.

## Setup

This project is intended to be interacted with in one of two ways. It consists of two main parts.

1. A [truffle](https://truffleframework.com/) project containing the smart contract, migration
   scripts and unit tests.
2. An [angular](https://angular.io/) frontend.

### Rinkeby

This is the easiest way to check the project out. [Here](./deployed_addresses.txt) you can find the
latest deployed address on the Rinkeby network together with an IPFS gateway where the website of
the project is hosted. All you need is the [Metamask](https://metamask.io) browser extention, switch
the network to Rinkeby and you will be able to browse the store as a customer, check out stores and
"purchase" items. If you want to add stores and items you will need to request permission to do
that.

### Local Development Blockchain

Using this method you will compile and migrate the smart contract yourself with the help of a
[local development blockchain](https://github.com/trufflesuite/ganache-cli) and serve the Angular
frontend using a local http-server.

Make sure you have [Node.js](https://nodejs.org/) installed as this project relies on Node.js
packages via `npm`

To get strated, clone this project and navigate to the projects folder

    git clone https://github.com/dev-bootcamp-2019/final-project-gretzke
    cd final-project-gretzke/project

Install all global dependencies needed for this project

    npm install -g truffle ganache-cli @angular/cli

Install all local dependencies needed for this project

    npm install

Start the local development blockchain

    ganache-cli

Compile and migrate the smart contract

    truffle compile && migrate --reset

Last but not least serve the frontend

    ng serve
